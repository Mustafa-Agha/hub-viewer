const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const screenshot = require('screenshot-desktop');

const socket = require('socket.io-client')('http://localhost:5000');
let interval;
let win = null;
let room = null;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 768,
    icon: path.join(__dirname + '/public/assets/images/favicon2.png'),
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  win.loadURL('http://localhost:3000');
  win.removeMenu();
  win.center();
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
    socket.emit('leave-room', room);
    app.quit();
  }
});

ipcMain.on('connect', async (event, { id, password, type }) => {
  room = {id, password};
  if (type === 'share') {
    socket.emit('create-cast', {id, password});
    interval = setInterval(async () => {
      try {
        const img = await screenshot();
        const imgStr = img.toString('base64');
        let obj = {};

        obj['room'] = id;
        obj['image'] = imgStr;

        socket.emit('screen-data', JSON.stringify(obj));
      } catch (err) {
        console.error(err.stack || err);
        process.exit(1);
      }
    }, 1000);
  } else if (type === 'view') {
    let opened = false;
    socket.emit('join-cast', {id, password});
    socket.on('screen-data', (msg) => {
      event.reply('screen-cast', 'data:image/png;base64,' + msg);
      if (!opened) win.loadURL('http://localhost:3000/cast');
      opened = true;
    });
  }
});

ipcMain.on('disconnect', (_event, {id, password}) => {
  clearInterval(interval);
  socket.emit('leave-room', {id, password});
});
