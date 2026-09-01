const { app, BrowserWindow, Menu, shell } = require('electron');

const DEFAULT_IRONPATH_URL = 'https://ironpath-test-2026-08-31.pastel-bream-2451.chatgpt.site';
const ironpathUrl = process.env.IRONPATH_DESKTOP_URL || DEFAULT_IRONPATH_URL;

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 940,
    minWidth: 1024,
    minHeight: 700,
    title: 'Ironpath',
    backgroundColor: '#111217',
    autoHideMenuBar: process.platform === 'win32',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  window.loadURL(ironpathUrl);
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { role: 'appMenu' },
    { role: 'fileMenu' },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { role: 'windowMenu' },
    { role: 'help', submenu: [{ label: 'Ironpath website', click: () => shell.openExternal(ironpathUrl) }] },
  ]));
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
