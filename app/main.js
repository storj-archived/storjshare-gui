/**
 * @module drivshare-gui/main
 */

'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');
var windowState = require('./lib/electron_boilerplate/window_state');
var mainState = windowState('main', { width: 620, height: 720 });

app.on('ready', function () {

  var ipc = require('electron-safe-ipc/host');
  var dialog = require('dialog');
  var ApplicationMenu = require('./lib/menu');
  var menu = new ApplicationMenu();

  var main = new BrowserWindow({
    x: mainState.x,
    y: mainState.y,
    width: mainState.width,
    height: mainState.height
  });

  menu.render();

  if (mainState.isMaximized) {
    main.maximize();
  }

  main.loadUrl('file://' + __dirname + '/driveshare.html');

  main.on('close', function () {
    mainState.saveState(main);
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

app.on('window-all-closed', function () {
  app.quit();
});
