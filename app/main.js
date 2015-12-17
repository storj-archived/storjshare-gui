/**
 * @module drivshare-gui/main
 */

'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');
var main = null;
var menu = require('menu');

app.on('ready', function() {
  var ipc = require('electron-safe-ipc/host');
  var dialog = require('dialog');
  var ApplicationMenu = require('./lib/menu');
  var SysTrayIcon = require('./lib/sys_tray_icon');
  var menu = new ApplicationMenu();

  main = new BrowserWindow({
    width: 620,
    height: 720
  });

  var sysTray = new SysTrayIcon(app, main, __dirname + '/imgs/icon.png');

  menu.render();
  main.loadUrl('file://' + __dirname + '/driveshare.html');

  main.on('close', function(e) {
    if (process.platform === 'darwin') {
      if (!main.forceClose) {
        e.preventDefault();
        main.hide();
      }
    }
  });

  main.on('minimize', function(e) {
    //TODO preferences menu & data
    if (true) {
      sysTray.render();
      main.setSkipTaskbar(true);
    }
  });

  main.on('restore', function(e) {
    //TODO preferences menu & data
    if (true) {
      sysTray.destroy();
      main.setSkipTaskbar(false);
    }
  });

  app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('before-quit', function() {
    main.forceClose = true;
  });

  app.on('activate', function() {
    main.show();
  });

  ipc.on('selectStorageDirectory', function() {
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }, function(path) {
      if (path) {
        ipc.send('storageDirectorySelected', path);
      }
    });
  });
});
