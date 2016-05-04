'use strict';

var electron = require('electron');
var Menu = electron.Menu;
var Tray = electron.Tray;

var PLATFORM = require('./platform');

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
}

/**
 * Builds and renders the system tray and context menu
 * #render
 */
SysTrayIcon.prototype.render = function() {
  var self = this;
  this.contextMenu = Menu.buildFromTemplate(this._getMenuTemplate());

  if(typeof this.trayIcon === 'undefined') {
    
    var trayImage;
    switch (PLATFORM) {
      case 'lin':
        trayImage = this.trayIconPath + '/linux/icon.png';
        this.trayIcon = new Tray(trayImage);

        this.trayIcon.setContextMenu(this.contextMenu);

        break;
      case 'win':
        trayImage = this.trayIconPath + '/windows/tray.ico';
        this.trayIcon = new Tray(trayImage);

        this.trayIcon.on('click', function() {
          restoreAll(self.rootWindow);
        });

        this.trayIcon.on('right-click', function() {
          self.trayIcon.popUpContextMenu(self.contextMenu);
        });

        break;
      case 'mac':
        trayImage = this.trayIconPath + '/osx/trayTemplate.png';
        this.trayIcon = new Tray(trayImage);
        this.trayIcon.setPressedImage(
          this.trayIconPath + '/osx/trayHighlight.png'
        );

        this.trayIcon.on('click', function() {
          restoreAll(self.rootWindow);
        });

        this.trayIcon.on('right-click', function() {
          self.trayIcon.popUpContextMenu(self.contextMenu);
        });

        break;
      default:
        // NOOP
    }

    this.trayIcon.setToolTip('Storj Share');
  }
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
          restoreAll(self.rootWindow);
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
    } else if(typeof ind === 'number') {
      return 'Drive #' + ind;
    } else {
      return 'unknown drive';
    }
  }

  restore = {
    label: 'Restore',
    click: function handleRestoration() {
      restoreAll(self.rootWindow);
    }
  };

  drives = {
    label: 'Drives',
    submenu: enumerateDrives()
  };

  quit = {
    label: 'Quit',
    click: function handleQuit() {
      self.app.quit();
    }
  };

  return [restore, drives, quit];
};

function restoreAll(appWin) {
  appWin.show();
  if(appWin.isMinimized()) {
    appWin.restore();
  }
}

module.exports = SysTrayIcon;
