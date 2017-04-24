'use strict';

const {app, Menu, ipcMain: ipc, BrowserWindow} = require('electron');

class ApplicationMenu {

  /**
   * Dynamically builds menu based on application state
   */
  constructor() {
    ipc.on('processStarted', () => this.render());
    ipc.on('processTerminated', () => this.render());
    this.render();
  }

  /**
   * Returns the focused window or the first open window
   * if none are focused
   */
  getWindow() {
    var win = BrowserWindow.getFocusedWindow();

    if (!win) {
      win = BrowserWindow.getAllWindows()[0];
    }

    return win;
  }

  /**
   * Builds and renders the application menu
   */
  render() {
    return Menu.setApplicationMenu(
      Menu.buildFromTemplate(this._getMenuTemplate())
    );
  }

  /**
   * Returns the menu template
   */
  _getMenuTemplate() {
    const self = this;

    let file = {
      label: 'File',
      submenu: [
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: function () {
            app.quit();
          }
        }
      ]
    };

    let edit = {
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

    let view = {
      label: 'View',
      submenu: [
        {
          label: 'Developer Tools',
          accelerator: 'Shift+CmdOrCtrl+J',
          click: function() {
            self.getWindow().toggleDevTools();
          }
        }
      ]
    };

    let help = {
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
  }

}

module.exports = ApplicationMenu;
