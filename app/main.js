/**
 * @module storjshare-gui/main
 */

'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipc = electron.ipcMain;
const dialog = electron.dialog;
const ApplicationMenu = require('./lib/menu');
const UserData = require('./lib/userdata');
const SysTrayIcon = require('./lib/trayicon');
const AutoLaunch = require('./lib/autolaunch');
const isCommandLaunched = /(electron(\.exe|\.app)?)$/.test(app.getPath('exe'));
const PLATFORM = require('./lib/platform');

var autoLaunchSettings = {
  name: app.getName(),
  path: app.getPath('exe'),
  isHidden: false
};

var main, sysTray, userDataViewModel = null;
var bootOpt = new AutoLaunch(autoLaunchSettings);

var isSecondAppInstance = app.makeSingleInstance(function() {
  // Someone tried to run a second instance, we should focus our window
  if (main) {
    if (main.isMinimized()) {
      main.restore();
    }
    main.show();
  }
  return true;
});

if(isSecondAppInstance) {
  app.quit();
}

app.on('ready', function() {
  //TODO make state-safe app data model,
  //can't safely save userData in this process
  userDataViewModel = new UserData(app.getPath('userData'))
    ._parsed;
  var menu = new ApplicationMenu();
  main = new BrowserWindow({
    width: 500,
    height: PLATFORM === 'mac' ? 600 : 635
  });

  sysTray = new SysTrayIcon(
    app,
    main,
     __dirname + '/imgs',
    userDataViewModel
  );

  menu.render();
  main.loadURL('file://' + __dirname + '/storjshare.html');

  if (userDataViewModel.appSettings.minToTask) {
    sysTray.render();
  }

  main.on('close', minToSysTray);
  app.on('before-quit', handleBeforeAppQuit);
  app.on('activate', handleMacActivate);
  ipc.on('selectStorageDirectory', selectStorageDir);
  ipc.on('selectLogFolder', selectLogFolder);
  ipc.on('checkBootSettings', checkBootSettings);
  ipc.on('appSettingsChanged', changeAppSettings);
});

function minToSysTray(ev) {
  if ((userDataViewModel.appSettings.minToTask && !main.forceClose) ||
  PLATFORM === 'mac' && !main.forceClose) {
    ev.preventDefault();
    main.hide();
  }
  else {
    app.quit();
  }
}

function handleBeforeAppQuit() {
  main.forceClose = true;
}

function handleMacActivate() {
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

function selectLogFolder() {
  dialog.showOpenDialog( {
    properties: ['openDirectory']
  }, function(path) {
    if (path) {
      main.webContents.send('logFolderSelected', path);
    }
  });
}

function changeAppSettings(ev, data) {
  userDataViewModel = sysTray.userData = JSON.parse(data);
  if(userDataViewModel.appSettings.launchOnBoot && !isCommandLaunched) {
    bootOpt.enable();
  }
  else if(!userDataViewModel.appSettings.launchOnBoot && !isCommandLaunched) {
    bootOpt.disable();
  }
  if (userDataViewModel.appSettings.minToTask) {
    sysTray.render();
  }
  else if(!userDataViewModel.appSettings.minToTask) {
    sysTray.destroy();
  }
}

function checkBootSettings() {
  bootOpt.isEnabled().then(
    function success(isEnabled) {
      userDataViewModel.appSettings.launchOnBoot = isEnabled;
      main.webContents.send('checkAutoLaunchOptions', isEnabled);
    });
}
