import { Peer } from 'peerjs';
import type { DataConnection } from 'peerjs';
import { KnowledgeBase } from './KnowledgeNetwork';
import type { IdeaTemplate } from './KnowledgeNetwork';
import toast from 'react-hot-toast';

export type FederationStatus = 'offline' | 'hosting' | 'connected';

type ConnectionCallback = (status: FederationStatus, peerId?: string) => void;

export class FederationEngine {
    private static peer: Peer | null = null;
    private static connections: DataConnection[] = [];
    private static currentStatus: FederationStatus = 'offline';
    private static listeners: Set<ConnectionCallback> = new Set();
    
    public static localPeerId: string | null = null;

    static subscribe(cb: ConnectionCallback) {
        this.listeners.add(cb);
        cb(this.currentStatus, this.localPeerId || undefined);
        return () => this.listeners.delete(cb);
    }

    private static updateStatus(s: FederationStatus, id?: string) {
        this.currentStatus = s;
        if (id) this.localPeerId = id;
        this.listeners.forEach(cb => cb(s, this.localPeerId || undefined));
    }

    static async hostSession() {
        if (this.peer) this.peer.destroy();
        
        this.peer = new Peer();
        
        this.peer.on('open', (id) => {
            console.log(`[FedEngine] Hosting Lobby: ${id}`);
            this.updateStatus('hosting', id);
        });

        this.peer.on('connection', (conn) => {
            console.log(`[FedEngine] Peer Connected: ${conn.peer}`);
            this.setupConnection(conn);
            toast.success(`Peer joined the simulation mesh!`);
        });

        this.peer.on('error', (err) => {
            console.error('PeerJS Error:', err);
            toast.error('Federation Network Error.');
            this.updateStatus('offline');
        });
    }

    static async joinSession(targetId: string) {
        if (this.peer) this.peer.destroy();
        
        this.peer = new Peer();
        
        this.peer.on('open', (id) => {
            this.localPeerId = id;
            console.log(`[FedEngine] Connecting to ${targetId}...`);
            const conn = this.peer!.connect(targetId, { reliable: true });
            
            conn.on('open', () => {
                this.setupConnection(conn);
                this.updateStatus('connected', targetId);
                toast.success('Successfully merged into remote simulation!');
            });
            
            conn.on('error', () => {
                toast.error('Failed to link multi-simulation array.');
                this.updateStatus('offline');
            });
        });

        this.peer.on('error', (err) => {
            console.error('PeerJS Error (Join):', err);
            toast.error('Could not locate simulation proxy.');
            this.updateStatus('offline');
        });
    }

    private static setupConnection(conn: DataConnection) {
        this.connections.push(conn);
        
        conn.on('data', (data: any) => {
            if (data && data.type === 'FEDERATED_IDEA') {
                const template = data.payload as IdeaTemplate;
                // Add the remote idea implicitly without triggering a rebroadcast loop
                KnowledgeBase.injectForeignIdea(template, conn.peer);
            }
        });
        
        conn.on('close', () => {
            this.connections = this.connections.filter(c => c !== conn);
            if (this.connections.length === 0) {
                this.updateStatus(this.currentStatus === 'hosting' ? 'hosting' : 'offline');
                toast.error('Peer detached from the simulation.');
            }
        });
    }

    static emitIdea(template: IdeaTemplate) {
        if (this.connections.length === 0) return;
        
        const payload = { type: 'FEDERATED_IDEA', payload: template };
        this.connections.forEach(conn => {
            conn.send(payload);
        });
    }

    static terminate() {
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }
        this.connections = [];
        this.updateStatus('offline', '');
        console.log("[FedEngine] Neural network mesh severed.");
    }
}
