const {app, remote, BrowserWindow, dialog, ipcMain} = require('electron');
const path = require('path');
const url = require('url');

const Minicap = require('./lib/minicap');
const Minitouch = require('./lib/minitouch');
const Middleware = require('./lib/middleware');
const DevTools = require('./lib/devtools');
const Device = require('./lib/device');

let win;

const createWindow = () => {
  win = new BrowserWindow({width: 1024, height: 576});

  if(process.platform === 'win32'){
    dialog.showMessageBox({
      message: `You are on Windows.\r\nMinicap and minitouch currently are only supported in *nix platforms.\r\nDo not expect this to function correctly.`
    });
  }

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

  let mc = new Minicap(win);
  mc.initialize();

  let mt = new Minitouch(win);
  mt.initialize();

  let mw = new Middleware(win);
  mw.initialize();

};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (!win) {
    createWindow();
  }
});
