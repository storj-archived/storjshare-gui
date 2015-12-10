/**
 * @module drivshare-gui/main
 */

'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');

app.on('ready', function () {

  var ipc = require('electron-safe-ipc/host');
  var dialog = require('dialog');
  var ApplicationMenu = require('./lib/menu');
  var menu = new ApplicationMenu();

  var main = new BrowserWindow({
    width: 620,
    height: 720
  });

  menu.render();
  main.loadUrl('file://' + __dirname + '/driveshare.html');

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
