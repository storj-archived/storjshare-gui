/**
 * @module driveshare-gui/sysTrayIcon
 */

'use strict';

var app = require('app');
var Menu = require('menu');
var BrowserWindow = require('browser-window');
var Tray = require('tray');
var ipc = require('electron-safe-ipc/host');
var UserData = require('./userdata');
var user = new UserData(app.getPath('userData'));

/**
 * Dynamically builds system tray context-menu based on application state. Will
 * not display until render() is called.
 * @constructor
 */
function SysTrayIcon(appRoot, appRootWindow, icoPath) {
  if (!(this instanceof SysTrayIcon)) {
    return new SysTrayIcon();
  }
  this.rootWindow = appRootWindow;
  this.app = appRoot;
  this.contextMenu = null;
  this.trayIcon = null;
  this.trayIconPath = icoPath;
}

/**
 * Builds and renders the system tray and context menu
 * #render
 */
SysTrayIcon.prototype.render = function() {
  var self = this;
  this.trayIcon = new Tray(this.trayIconPath);
  this.trayIcon.setToolTip('DriveShare');
  this.contextMenu = Menu.buildFromTemplate(this._getMenuTemplate());
  this.trayIcon.setContextMenu(this.contextMenu);

  this.trayIcon.on('clicked', function(e) {
    self.rootWindow.restore();
  })
};

/**
 * Kills the system tray and context menu
 * #destroy
 */
SysTrayIcon.prototype.destroy = function() {
  if(this.trayIcon) {
    this.trayIcon.removeAllListeners();
    this.trayIcon.destroy();
  }
};

/**
 * Returns the system tray menu template
 * #_getMenuTemplate
 */
SysTrayIcon.prototype._getMenuTemplate = function() {
  var restore, quit, drives;
  var self = this;

  restore = {
    label: 'Restore',
    click: function handleRestoration(e) {
      self.rootWindow.restore();
    }
  };

  quit = {
    label: 'Quit',
    click: function handleQuit(e) {
      self.app.quit();
    }
  };

  drives = {
    label: 'Drives',
    submenu: enumerateDrives(user)
  };


  function enumerateDrives(userData) {
    var drives = userData._parsed.tabs;

    drives.forEach(function(elem, ind, arr) {
      drivesArr.push({
        label: elem.id
      });
    });

    return drivesArr;
  }

  return [restore, quit, drives];
};

module.exports = SysTrayIcon;
