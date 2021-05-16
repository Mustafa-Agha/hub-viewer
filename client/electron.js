const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const screenshot = require('screenshot-desktop');
const jwt = require('jsonwebtoken');

const socket = require('socket.io-client')('http://localhost:5000');
let interval;
let shareWin = null;
let authWin = null;
let castWin = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 1080,
    height: 500,
    title: 'HubViewer',
    icon: path.join(__dirname + '/public/images/favicon.png'),
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  win.loadURL('http://localhost:3000');
  win.removeMenu();
  win.center();
  win.setMinimumSize(800, 500);
}

app.on('ready', () => {
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

ipcMain.on('create-room', (event, arg) => {
  socket.emit('create-room', arg, (response) => {
    console.log('create-room', response);
    if (response.status === 'fail') {
      return event.reply('error-create-room', response);
    }

    socket.on('share-screen', ({id, password, client}) => {
      if (parseInt(arg['id']) === parseInt(id) && arg['password'] === password) {
        shareWin = new BrowserWindow({
          width: 350,
          height: 180,
          title: 'Share Scree Request',
          webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
          },
        });
      
        shareWin.loadURL('http://localhost:3000/share/' + id + '/' + password + '/' + client);
        shareWin.removeMenu();
        shareWin.center();
        shareWin.setResizable(false);
        shareWin.setMaximizable(false);
    
        shareWin.on('closed', () => {
          shareWin = null;
        });
      }
    });
  });
});

ipcMain.on('share', (event, {id, password}) => {
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
});

ipcMain.on('connect', async (event, {id}) => {
  socket.emit('connect-to-room', {id}, (response) => {
    console.log('connec-to-room', response);
    if (response.status === 'fail') {
      return event.reply('error-connect', response);
    }

    event.reply('success-connect', response);

    authWin = new BrowserWindow({
      width: 310,
      height: 180,
      title: 'Room Authentication',
      webPreferences: {
        contextIsolation: false,
        nodeIntegration: true,
      },
    });
  
    authWin.loadURL('http://localhost:3000/auth/' + id);
    authWin.removeMenu();
    authWin.center();
    authWin.setResizable(false);
    authWin.setMaximizable(false);

    authWin.on('closed', () => {
      authWin = null;
    });
  });
});

ipcMain.on('auth', async (event, {id, password}) => {
  socket.emit('auth-room', {id, password}, (response) => {
    console.log('auth-room', response);
    if (response.status === 'fail') {
      return event.reply('error-auth', response);
    }

    castWin = new BrowserWindow({
      width: 800,
      height: 500,
      title: 'Screen Cast',
      webPreferences: {
        contextIsolation: false,
        nodeIntegration: true,
      },
    });
  
    castWin.loadURL('http://localhost:3000/cast');
    castWin.removeMenu();
    castWin.center();
    castWin.setMinimumSize(800, 500);

    castWin.on('closed', () => {
      castWin = null;
    });
  });
});

ipcMain.on('view', (event, arg) => {
  socket.on('screen-data', (msg) => {
    event.reply('screen-cast', 'data:image/png;base64,' + msg);
  });
});

ipcMain.on('close-auth', () => {
  if (authWin) {
    authWin.close();
    authWin = null;
  }
});

ipcMain.on('close-share', () => {
  if (shareWin) {
    shareWin.close();
    shareWin = null;
  }
});

ipcMain.on('close-cast', () => {
  if (castWin) {
    castWin.close();
    castWin = null;
  }
});

ipcMain.on('disconnect', (_event, {id, password}) => {
  clearInterval(interval);
  socket.emit('leave-room', {id, password});
});
