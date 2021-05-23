const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const screenshot = require('screenshot-desktop');
const jwt = require('jsonwebtoken');

const jwt_secret = process.env.JWT_SECRET || '2e8bf84eb85b8c62cb26ca36feab31ce772da90fdf98b4f5ab22f7be12a939ea';

// TODO: ADD LOGIN AUTH PRIVILEGES
const token = jwt.sign({ website: 'https://hubviewer.dev-hub.cf' }, jwt_secret);

const socket = require('socket.io-client')('http://localhost:5000', {
  transportOptions: {
    polling: {
      extraHeaders: {
        'Authorization': 'Bearer ' + token,
      },
    },
  },
});

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
  socket.emit('create-room', {id: arg['id'], password: arg['token']}, (response) => {
    console.log('create-room', response);
    if (response.status === 'fail') {
      return event.reply('error-create-room', response);
    }

    socket.on('auth-user', ({id, password, client}) => {
      jwt.verify(password, arg['password'], function(err) {
        if (err) {
          socket.emit('user-authorized', {id, isAuth: false}, rb => {
            console.log(rb);
          });
        }
        socket.emit('user-authorized', {id, token: password, client, isAuth: true}, rb => {
          console.log(rb);
          shareWin = new BrowserWindow({
            width: 350,
            height: 180,
            title: 'Share Scree Request',
            webPreferences: {
              contextIsolation: false,
              nodeIntegration: true,
            },
          });
        
          shareWin.loadURL('http://localhost:3000/share/' + id + '/' + arg['password']);
          shareWin.removeMenu();
          shareWin.center();
          shareWin.setResizable(false);
          shareWin.setMaximizable(false);
      
          shareWin.on('closed', () => {
            shareWin = null;
          });
        });
      });
    });
  });
});

ipcMain.on('share', (event, {id, password}) => {
  interval = setInterval(async () => {
    try {
      const img = await screenshot();
      const imgStr = img.toString('base64');
      const token = jwt.sign(imgStr, password);
      let obj = {};

      obj['room'] = id;
      obj['image'] = token;

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

ipcMain.on('auth', async (event, {id, password, token}) => {
  socket.emit('auth-confirm', {id, password: token}, (response) => {
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
  
    castWin.loadURL('http://localhost:3000/cast/' + id + '/' + password);
    castWin.removeMenu();
    castWin.center();
    castWin.setMinimumSize(800, 500);

    castWin.on('closed', () => {
      castWin = null;
    });
  });
});

ipcMain.on('view', (event, {id, password}) => {
  socket.emit('join', {id}, (joined) => {
    if (joined) {
      socket.on('screen-data', (msg) => {
        jwt.verify(msg, password, function(err, decoded) {
          if (err) console.error(err.message)
          event.reply('screen-cast', 'data:image/png;base64,' + decoded);
        });
      });
    }
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

ipcMain.on('disconnect', (_event) => {
  clearInterval(interval);
});
