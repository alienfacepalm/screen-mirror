const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');

const minicap = require('./lib/minicap');
const minitouch = require('./lib/minitouch');
const middleware = require('./lib/middleware');
const DevTools = require('./lib/devtools');

let win;

const createWindow = () => {
  win = new BrowserWindow({width: 900, height: 700});
  let devTools = new DevTools;
  devTools.init(win);

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  win.on('closed', () => {
    win = null;
  });
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
