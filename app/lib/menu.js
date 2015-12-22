/**
 * @module driveshare-gui/menu
 */

'use strict';

var app = require('app');
var Menu = require('menu');
var BrowserWindow = require('browser-window');
const ipc = require('electron').ipcMain;

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
 */
ApplicationMenu.prototype.render = function() {
  return Menu.setApplicationMenu(
    Menu.buildFromTemplate(this._getMenuTemplate())
  );
};

/**
 * Returns the menu template
 * #_getMenuTemplate
 */
ApplicationMenu.prototype._getMenuTemplate = function() {
  var file, edit, view, help;

  file = {
    label: 'File',
    submenu: [
      {
        label: 'Start/Stop',
        accelerator: 'CmdOrCtrl+Return',
        click: function() {
          BrowserWindow.getFocusedWindow().webContents.send('toggle_dataserv');
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
        label: 'Debug Console',
        accelerator: 'CmdOrCtrl+L',
        click: function() {
          BrowserWindow.getFocusedWindow().webContents.send('showLogs');
        }
      },{
        label: 'Developer Tools',
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
          BrowserWindow.getFocusedWindow().webContents.send('checkForUpdates');
        }
      },{
        label: 'About DriveShare',
        click: function() {
          BrowserWindow.getFocusedWindow().webContents.send('showAboutDialog');
        }
      }
    ]
  };

  return [file, edit, view, help];
};

module.exports = ApplicationMenu;
