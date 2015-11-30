/**
 * @module driveshare-gui/menu
 */

'use strict';

var app = require('app');
var Menu = require('menu');
var BrowserWindow = require('browser-window');
var ipc = require('electron-safe-ipc/host');

/**
 * Dynamically builds menu based on application state
 * @constructor
 */
function ApplicationMenu() {
  if (!(this instanceof ApplicationMenu)) {
    return new ApplicationMenu();
  }

  ipc.on('processStarted', this.render.bind(this, true));
  ipc.on('processTerminated', this.render.bind(this, false));

  this.render();
}

/**
 * Builds and renders the application menu
 * #render
 * @param {Boolean} processRunning
 */
ApplicationMenu.prototype.render = function(processRunning) {
  return Menu.setApplicationMenu(
    Menu.buildFromTemplate(this._getMenuTemplate(processRunning))
  );
};

/**
 * Returns the menu template
 * #_getMenuTemplate
 * @param {Boolean} processRunning
 */
ApplicationMenu.prototype._getMenuTemplate = function(processRunning) {
  var file, edit, view, help;

  file = {
    label: 'File',
    submenu: [
      {
        label: processRunning ? 'Stop' : 'Start',
        accelerator: 'CmdOrCtrl+Return',
        click: function() {
          ipc.send(processRunning ? 'terminateProcess' : 'farm');
        }
      },{
        label: 'Quit',
        accelerator: 'CmdOrCtrl+Q',
        click: function () {
          app.quit();
        }
      }
    ]
  };

  edit = {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        click: function() {
          BrowserWindow.getFocusedWindow().webContents.undo();
        }
      },{
        label: 'Redo',
        accelerator: 'CmdOrCtrl+Y',
        click: function() {
          BrowserWindow.getFocusedWindow().webContents.redo();
        }
      },{
        type: 'separator'
      },{
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        click: function() {
          BrowserWindow.getFocusedWindow().webContents.cut();
        }
      },{
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        click: function() {
          BrowserWindow.getFocusedWindow().webContents.copy();
        }
      },{
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        click: function() {
          BrowserWindow.getFocusedWindow().webContents.paste();
        }
      },{
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        click: function() {
          BrowserWindow.getFocusedWindow().webContents.selectAll();
        }
      }
    ]
  };

  view = {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: function() {
          BrowserWindow.getFocusedWindow().reloadIgnoringCache();
        }
      },{
        label: 'Logs',
        accelerator: 'CmdOrCtrl+L',
        click: function() {
          ipc.send('showLogs');
        }
      },{
        label: 'Toggle Dev Tools',
        accelerator: 'Shift+CmdOrCtrl+J',
        click: function() {
          BrowserWindow.getFocusedWindow().toggleDevTools();
        }
      }
    ]
  };

  help = {
    label: 'Help',
    submenu: [
      {
        label: 'Check for Updates',
        click: function() {
          ipc.send('checkForUpdates');
        }
      },{
        label: 'About DriveShare',
        click: function() {
          ipc.send('showAboutDialog');
        }
      }
    ]
  };

  return [file, edit, view, help];
};

module.exports = ApplicationMenu;
