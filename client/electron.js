const { app, BrowserWindow, ipcMain } = require('electron');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const screenshot = require('screenshot-desktop');

const socket = require('socket.io-client')('http://localhost:5000');
let interval;

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 300,
    icon: path.join(__dirname + '/public/images/favicon2.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  win.loadURL('http://localhost:3000/');
  // win.removeMenu();
  win.center();
  // win.setResizable(false);
}

app.whenReady().then(() => {
  setTimeout(() => {
    createWindow();
  }, 10000);

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

ipcMain.on('connect', (event, arg) => {
  //TODO: capture continuous screen shots
  const uuid = uuidv4();
  socket.emit('join-message', uuid);
  event.replay('uuid', uuid);

  //TODO: Broadcast to all users
});

ipcMain.on('disconnect', (event, arg) => {
  //TODO: Stop broadcasting & screen capture
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// Handle window controls via IPC
ipcMain.on('windowControls:maximize', (ipcEvent) => {
  const window = findBrowserWindow(ipcEvent);
  if (window.isMaximized()) {
    window.restore();
  } else {
    window.maximize();
  }
});

ipcMain.on('windowControls:minimize', (ipcEvent) => {
  const window = findBrowserWindow(ipcEvent);
  window.minimize();
});

ipcMain.on('windowControls:close', (ipcEvent) => {
  const window = findBrowserWindow(ipcEvent);
  window.close();
});

// ipcEvent.sender is the webContents that sent the message
// use BrowserWindow.fromWecContents to get the associated BrowserWindow instance
function findBrowserWindow(ipcEvent) {
  return BrowserWindow.fromWebContents(ipcEvent.sender);
}
