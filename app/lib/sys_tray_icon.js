/**
 * @module driveshare-gui/sysTrayIcon
 */

'use strict';
var electron = require('electron');
var Menu = electron.Menu;
var Tray = electron.Tray;
var UserData = require('./userdata');
var plat = (/^win/.test(process.platform))    ? 'win' :
           (/^darwin/.test(process.platform)) ? 'mac' :
           (/^linux/.test(process.platform))  ? 'lin' : null;
/**
 * Dynamically builds system tray context-menu based on application state. Will
 * not display until render() is called.
 * @constructor
 */
function SysTrayIcon(appRoot, appRootWindow, icoPath, userdata) {
  if (!(this instanceof SysTrayIcon)) {
    return new SysTrayIcon(appRoot, appRootWindow, icoPath, userdata);
  }
  this.userData = userdata;
  this.rootWindow = appRootWindow;
  this.app = appRoot;
  this.trayIconPath = icoPath;
  this.contextMenu, this.trayIcon;
}

/**
 * Builds and renders the system tray and context menu
 * #render
 */
SysTrayIcon.prototype.render = function() {
  if(typeof this.trayIcon === 'undefined') {
    this.trayIcon = new Tray(this.trayIconPath);
    this.trayIcon.setToolTip('DriveShare');

    if(plat === 'win' || 'mac') {
      this.trayIcon.on('click', function(ev) {
        self.rootWindow.restore();
        this.rootWindow.focus();
      });

      this.trayIcon.on('right-click', function(ev) {
        this.trayIcon.popUpContextMenu();
      });
    }
  }

  this.contextMenu = Menu.buildFromTemplate(this._getMenuTemplate());
  this.trayIcon.setContextMenu(this.contextMenu);
};

/**
 * Kills the system tray and context menu
 * #destroy
 */
SysTrayIcon.prototype.destroy = function() {
  if(this.trayIcon) {
    this.trayIcon.removeAllListeners();
    this.trayIcon.destroy();
    this.trayIcon = undefined;
  }
};

/**
 * Returns the system tray menu template
 * #_getMenuTemplate
 */
SysTrayIcon.prototype._getMenuTemplate = function() {
  var restore, quit, drives;
  var self = this;

  function enumerateDrives() {
    var drives = self.userData.tabs;
    var drivesArr = [];

    drives.forEach(function(elem, ind) {
      drivesArr.push({
        label: getDriveLabelState(elem.wasRunning) + ': ' +
          getDriveLabelName(elem.storage.path, ind),
        click: function handleDriveSelection() {
          self.rootWindow.restore();
          self.rootWindow.focus();
          self.rootWindow.webContents.send('selectDriveFromSysTray', ind);
        }
      });
    });

    return drivesArr;
  }

  function getDriveLabelState(wasRunning) {
    return (wasRunning === true) ? 'Running' : 'Stopped';
  }

  function getDriveLabelName(path, ind) {
    if(path !== '' && typeof path === 'string') {
      return path;
    }
    else if(typeof ind === 'number') {
      return "Drive #" + ind;
    }
    else{
      return 'unknown drive';
    }
  }

  restore = {
    label: 'Restore',
    click: function handleRestoration() {
      self.rootWindow.restore();
    }
  };

  quit = {
    label: 'Quit',
    click: function handleQuit() {
      self.app.quit();
    }
  };

  drives = {
    label: 'Drives',
    submenu: enumerateDrives()
  };

  return [restore, quit, drives];
};

module.exports = SysTrayIcon;
