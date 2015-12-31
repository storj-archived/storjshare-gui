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
const AutoLaunch = require('./lib/auto_launch');
const PLATFORM = require('os').platform();
const CONFIG = require('./config');
var args = process.argv;
var isCommandLaunched = /(electron(\.exe|\.app)?)$/.test(app.getPath('exe'));

var autoLaunchSettings = {
  name: (isCommandLaunched) ?
    app.getName() + '_' + CONFIG.name :
    app.getName(),
  path: (isCommandLaunched) ?
    app.getPath('exe') + ' ' + __dirname + ' --runatboot=true':
    app.getPath('exe'),
  isHidden: false
};

var main, sysTray, appSettingsViewModel = null;
var bootOpt = new AutoLaunch(autoLaunchSettings);

hasPrimeBootPackageInstalled(function(isPkgEnabled) {
  process.argv.forEach(function(val) {
    if(val === '--runatboot=true' && isPkgEnabled){
      //quit if package installation startup option is enabled and unpackaged startup option is enabled, then remove the unpackaged boot option.
      bootOpt.disable().then(function success(){
        app.quit();
      });
    }
  });
});

app.on('ready', function() {
  //TODO make state-safe app data model,
  //can't safely save userData in this process
  appSettingsViewModel = new UserData(app.getPath('userData'))._parsed.appSettings;

  var menu = new ApplicationMenu();
  main = new BrowserWindow({
    width: 600,
    height: PLATFORM === 'darwin' ? 600 : 635
  });

  sysTray = new SysTrayIcon(app, main, __dirname + '/imgs/icon.png');

  menu.render();
  main.loadURL('file://' + __dirname + '/driveshare.html');

  main.on('close', closeBrowser);
  main.on('minimize', minimizeBrowser);
  main.on('restore', restoreBrowser);
  app.on('window-all-closed', closeAllApp);
  app.on('before-quit', handleBeforeAppQuit);
  app.on('activate', activateApp);
  ipc.on('selectStorageDirectory', selectStorageDir);
  ipc.on('checkBootSettings', checkBootSettings);
  ipc.on('appSettingsChanged', changeAppSettings);
});

function closeBrowser(e) {
  if (PLATFORM === 'darwin') {
    if (!main.forceClose) {
      e.preventDefault();
      main.hide();
    }
  }
}

function minimizeBrowser() {
  if (appSettingsViewModel.minToTask) {
    sysTray.render();
    main.setSkipTaskbar(true);
  }
}

function restoreBrowser() {
  if (appSettingsViewModel.minToTask) {
    sysTray.destroy();
    main.setSkipTaskbar(false);
  }
}

function closeAllApp() {
  if (PLATFORM !== 'darwin') {
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
  dialog.showOpenDialog( {
    properties: ['openDirectory']
  }, function(path) {
    if (path) {
      main.webContents.send('storageDirectorySelected', path);
    }
  });
}

function changeAppSettings(ev, data) {
  appSettingsViewModel = JSON.parse(data);
  if(appSettingsViewModel.launchOnBoot) {
    bootOpt.enable();
  }
  else {
    bootOpt.disable();
  }
}

function checkBootSettings() {
  bootOpt.isEnabled().then(
    function success(isEnabled) {
      appSettingsViewModel.launchOnBoot = isEnabled;
      main.webContents.send('checkAutoLaunchOptions', isEnabled);
    });
}

function hasPrimeBootPackageInstalled(cb) {
  var al = new AutoLaunch({
    name: app.getName()
  });
  al.isEnabled().then(function success(isEnabled) {
    return cb(isEnabled);
  })
}
