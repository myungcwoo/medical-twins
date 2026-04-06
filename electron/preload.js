import { contextBridge } from 'electron';

// Expose protected methods that allow the renderer process to use
// safe electron APIs without exposing the entire Node.js environment
contextBridge.exposeInMainWorld(
    'electronAPI',
    {
        // Add specific IPC endpoints here if we ever need native file-system saving rather than IDB
        platform: process.platform
    }
);
