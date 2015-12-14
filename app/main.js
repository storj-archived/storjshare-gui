/**
 * @module drivshare-gui/main
 */

'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');
var main = null;

app.on('ready', function () {

  var ipc = require('electron-safe-ipc/host');
  var dialog = require('dialog');
  var ApplicationMenu = require('./lib/menu');
  var menu = new ApplicationMenu();

  main = new BrowserWindow({
    width: 620,
    height: 720
  });

  menu.render();
  main.loadUrl('file://' + __dirname + '/driveshare.html');

  main.on('close', function(e) {
    if (main.forceClose) {
      return;
    }

    e.preventDefault();
    main.hide();
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

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', function() {
  main.forceClose = true;
});

app.on('activate-with-no-open-windows', function() {
  main.show();
});
