const { app, BrowserWindow, ipcMain, screen, Tray, Menu } = require('electron');
const path = require('path');
const jwt = require('jsonwebtoken');
const screenshot = require('screenshot-desktop');
const isDev = require('electron-is-dev');
const url = require('url');

const server_secret =
  process.env.SERVER_SECRET || '3dcc17e8cf702ee00787c7086de31d';

const token = jwt.sign(
  { website: 'https://hubviewer.dev-hub.cf' },
  server_secret
);

const socket = require('socket.io-client')('http://hubviewer.dev-hub.cf', {
  transportOptions: {
    polling: {
      extraHeaders: {
        Authorization: 'Bearer ' + token,
      },
    },
  },
});

const STATUS = Object.freeze({ success: 'success', error: 'error' });
const EVENTS = Object.freeze({
  reply: {
    successConnection: 'success-connection',
    errorConnection: 'err-connection',
    successDisconnect: 'success-disconnect',
    successConnect: 'success-connect',
    errorConnect: 'err-connect',
    error: 'error',
  },
  on: {
    connection: 'connection',
    disconnect: 'disconnect',
    connect: 'connect',
    view: 'view',
  },
});

const SOCKET = Object.freeze({
  emit: {
    createServer: 'create-server',
    connectServer: 'connect-server',
    verifiedUser: 'verified-user',
    joinUser: 'join-user',
  },
  on: {
    verifyUser: 'verify-user',
    verifyJoin: 'verify-join',
    disconnect: 'force-disconnect',
  },
});

let mainWindow;
let shareWin;
let interval;
let tray;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1080,
    height: 500,
    title: 'HubViewer',
    darkTheme: true,
    icon: path.join(__dirname + '/images/icon.png'),
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL('http://localhost:3000');
  mainWindow.removeMenu();
  mainWindow.center();
  mainWindow.setMinimumSize(800, 500);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: function () {
        mainWindow.show();
      },
    },
    {
      label: 'Quit',
      click: function () {
        app.isQuiting = true;
        app.quit();
      },
    },
  ]);

  tray = new Tray(path.join(__dirname + '/images/icon.png'));
  tray.setContextMenu(contextMenu);

  mainWindow.on('minimize', function (event) {
    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on('close', function (event) {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (shareWin) {
      shareWin.close();
    }
  });
}

function handleErrorExc(
  event,
  message = 'App crashed 😱 contact developer for support 🖖'
) {
  let error = new Error(message);
  error.event = event;
  throw error;
}

app.on('ready', () => {
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

ipcMain.on(EVENTS.on.connection, (event, arg) => {
  try {
    let token = jwt.sign(
      { website: 'https://hubviewer.dev-hub.cf' },
      arg['secret']
    );
    socket.emit(
      SOCKET.emit.createServer,
      { id: arg['id'], token },
      ({ status }) => {
        if (status === STATUS.success)
          event.reply(EVENTS.reply.successConnection, {
            msg: 'Ready to connect (secure connection)',
            type: 'success',
          });

        if (status === STATUS.error)
          event.reply(EVENTS.reply.errorConnection, {
            msg: 'Not ready. Please check your connection',
            type: 'error',
          });
      }
    );

    socket.on(SOCKET.on.verifyUser, ({ id, token, client }) => {
      jwt.verify(token, arg['secret'], function (err) {
        if (!err) {
          socket.emit(SOCKET.emit.verifiedUser, { id, client });
          let display = screen.getPrimaryDisplay();
          let width = display.bounds.width;

          shareWin = new BrowserWindow({
            width: 30,
            height: 30,
            resizable: false,
            frame: false,
            x: width - 30,
            y: 200,
            webPreferences: {
              contextIsolation: false,
              nodeIntegration: true,
            },
          });

          shareWin.loadURL('http://localhost:3000/share');
          shareWin.on('closed', () => {
            shareWin = null;
            clearInterval(interval);
          });

          interval = setInterval(async () => {
            try {
              const img = await screenshot();
              const imgStr = img.toString('base64');
              const token = jwt.sign(imgStr, arg['secret']);
              let obj = {};

              obj['room'] = id;
              obj['image'] = token;

              socket.emit('share-data', JSON.stringify(obj));
            } catch (err) {
              process.exit(1);
            }
          }, 1000);
        }
      });
    });

    socket.on(SOCKET.on.disconnect, () => {
      socket.disconnect();
      clearInterval(interval);
    });
  } catch (err) {
    handleErrorExc(event);
  }
});

ipcMain.on(EVENTS.on.connect, (event, arg) => {
  try {
    let token = jwt.sign(
      { website: 'https://hubviewer.dev-hub.cf' },
      arg['secret']
    );
    socket.emit(
      SOCKET.emit.connectServer,
      { id: arg['id'], token },
      ({ status, msg }) => {
        if (status === STATUS.success) {
          event.reply(EVENTS.reply.successConnect, {
            msg: msg,
            type: 'success',
          });
          socket.on(SOCKET.on.verifyJoin, ({ id, client }) => {
            socket.emit(SOCKET.emit.joinUser, { id, client }, ({ status }) => {
              if (status === STATUS.success) {
                mainWindow.loadURL('http://localhost:3000/view/' + arg['secret']);
              }

              if (status === STATUS.error) {
                event.reply(EVENTS.reply.errorConnect, {
                  msg: msg,
                  type: 'error',
                });
              }
            });
          });
        }
      }
    );
  } catch (err) {
    handleErrorExc(event);
  }
});

ipcMain.on(EVENTS.on.disconnect, (event) => {
  try {
    socket.disconnect();
    clearInterval(interval);
    event.reply(EVENTS.reply.successDisconnect, {
      msg: 'Ready to connect (secure connection)',
      type: 'success',
    });
  } catch (err) {
    handleErrorExc(event);
  }
});

ipcMain.on(EVENTS.on.view, (event, { secret }) => {
  socket.on('share-data', (msg) => {
    jwt.verify(msg, secret, function (err, decoded) {
      if (err) console.error(err.message);
      event.reply('screen-cast', 'data:image/png;base64,' + decoded);
    });
  });
});

process.on('uncaughtException', function (error) {
  const { message, event } = error;
  if (event) {
    event.reply(EVENTS.reply.error, {
      msg: message,
      type: 'error',
    });
  } else {
    console.error(error);
  }
});
