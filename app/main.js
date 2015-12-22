/**
 * @module drivshare-gui/main
 */

'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipc = electron.ipcMain;
const dialog = electron.dialog;
const ApplicationMenu = require('./lib/menu');
const UserData = require('./lib/userdata');
const SysTrayIcon = require('./lib/sys_tray_icon');
var main, sysTray, appSettings = null;

app.on('ready', function() {
  appSettings = new UserData(app.getPath('userData'))._parsed.appSettings;
  var menu = new ApplicationMenu();
  main = new BrowserWindow({
    width: 600,
    height: 635
  });

  sysTray = new SysTrayIcon(app, main, __dirname + '/imgs/icon.png');

  menu.render();
  main.loadUrl('file://' + __dirname + '/driveshare.html');

  main.on('close', closeBrowser);
  main.on('minimize', minimizeBrowser);
  main.on('restore', restoreBrowser);
  app.on('window-all-closed', closeAllApp);
  app.on('before-quit', handleBeforeAppQuit);
  app.on('activate', activateApp);
  ipc.on('selectStorageDirectory', selectStorageDir);
  ipc.on('appSettingsChanged', changeAppSettings);
});

function closeBrowser(e) {
  if (process.platform === 'darwin') {
    if (!main.forceClose) {
      e.preventDefault();
      main.hide();
    }
  }
}

function minimizeBrowser() {
  if (appSettings.minToTask) {
    sysTray.render();
    main.setSkipTaskbar(true);
  }
}

function restoreBrowser() {
  if (appSettings.minToTask) {
    sysTray.destroy();
    main.setSkipTaskbar(false);
  }
}

function closeAllApp() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
}

function handleBeforeAppQuit() {
  main.forceClose = true;
}

function activateApp() {
  main.show();
}

function selectStorageDir() {
  dialog.showOpenDialog({
    properties: ['openDirectory']
  }, function(path) {
    if (path) {
      ipc.send('storageDirectorySelected', path);
    }
  });
}

function changeAppSettings(ev, arg) {
  appSettings = JSON.parse(arg);
}
