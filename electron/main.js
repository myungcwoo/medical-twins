import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            // We enable webSecurity but allow nodeIntegration purely for localized caching safely isolated via preload
            nodeIntegration: false,
            contextIsolation: true
        },
        autoHideMenuBar: true,
        title: "Medical Twins Studio - Hospital Environment"
    });

    const isDev = process.env.VITE_DEV_SERVER_URL;
    if (isDev) {
        mainWindow.loadURL(isDev);
        // Open DevTools in dev mode
        mainWindow.webContents.openDevTools();
    } else {
        // Load the local index.html in production
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
