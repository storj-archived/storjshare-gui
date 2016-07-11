/**
 * @module storjshare-gui/menu
 */

'use strict';

var electron = require('electron');
var app = electron.app;
var Menu = electron.Menu;
var BrowserWindow = electron.BrowserWindow;
var ipc = electron.ipcMain;

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
 * Returns the focused window or the first open window if none are focused
 * #getWindow
 */
ApplicationMenu.prototype.getWindow = function() {
  var win = BrowserWindow.getFocusedWindow();

  if (!win) {
    win = BrowserWindow.getAllWindows()[0];
  }

  return win;
};

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
  var self = this;
  var file, edit, view, help;

  file = {
    label: 'File',
    submenu: [
      {
        label: 'Start/Stop',
        accelerator: 'CmdOrCtrl+Return',
        click: function() {
          self.getWindow().webContents.send('toggleFarmer');
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
          self.getWindow().webContents.undo();
        }
      },{
        label: 'Redo',
        accelerator: 'CmdOrCtrl+Y',
        click: function() {
          self.getWindow().webContents.redo();
        }
      },{
        type: 'separator'
      },{
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        click: function() {
          self.getWindow().webContents.cut();
        }
      },{
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        click: function() {
          self.getWindow().webContents.copy();
        }
      },{
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        click: function() {
          self.getWindow().webContents.paste();
        }
      },{
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        click: function() {
          self.getWindow().webContents.selectAll();
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
          self.getWindow().reload();
        }
      },{
        label: 'Developer Tools',
        accelerator: 'Shift+CmdOrCtrl+J',
        click: function() {
          self.getWindow().toggleDevTools();
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
          self.getWindow().webContents.send('checkForUpdates');
        }
      },{
        label: 'About Storj Share',
        click: function() {
          self.getWindow().webContents.send('showAboutDialog');
        }
      }
    ]
  };

  return [file, edit, view, help];
};

module.exports = ApplicationMenu;
