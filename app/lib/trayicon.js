'use strict';

const {Menu, Tray} = require('electron');
const PLATFORM = require('./platform');

class TrayIcon {

  /**
   * Dynamically builds system tray context-menu based on application state.
   * Will not display until render() is called.
   * @constructor
   */
  constructor(appRoot, appRootWindow, icoPath, userdata) {
    this.userData = userdata;
    this.rootWindow = appRootWindow;
    this.app = appRoot;
    this.trayIconPath = icoPath;
  }

  /**
   * Builds and renders the system tray and context menu
   */
  render() {
    this.contextMenu = Menu.buildFromTemplate(this._getMenuTemplate());

    if (typeof this.trayIcon === 'undefined') {
      let trayImage;

      switch (PLATFORM) {
        case 'lin':
          trayImage = this.trayIconPath + '/linux/icon.png';
          this.trayIcon = new Tray(trayImage);
          this.trayIcon.setContextMenu(this.contextMenu);
          break;
        case 'win':
          trayImage = this.trayIconPath + '/windows/tray.ico';
          this.trayIcon = new Tray(trayImage);
          this.trayIcon.on('click', () => {
            this._restoreAll(this.rootWindow);
          });
          this.trayIcon.on('right-click', () => {
            this.trayIcon.popUpContextMenu(this.contextMenu);
          });
          break;
        case 'mac':
          trayImage = this.trayIconPath + '/osx/trayTemplate.png';
          this.trayIcon = new Tray(trayImage);
          this.trayIcon.setPressedImage(
            this.trayIconPath + '/osx/trayHighlight.png'
          );
          this.trayIcon.on('click', () => {
            this._restoreAll(this.rootWindow);
          });
          this.trayIcon.on('right-click', () => {
            this.trayIcon.popUpContextMenu(this.contextMenu);
          });
          break;
        default:
          // NOOP
      }

      this.trayIcon.setToolTip('Storj Share');
    }
  }

  /**
   * Kills the system tray and context menu
   */
  destroy() {
    if (this.trayIcon) {
      this.trayIcon.removeAllListeners();
      this.trayIcon.destroy();
      this.trayIcon = undefined;
    }
  }

  /**
   * Returns the system tray menu template
   */
  _getMenuTemplate() {
    return [
      {
        label: 'Restore',
        click: () => this._restoreAll(this.rootWindow)
      },
      {
        label: 'Quit',
        click: () => this.app.exit()
      }
    ];
  }

  /**
   * Restores any application windows that are minimized
   */
  _restoreAll() {
    this.rootWindow.show();

    if (this.rootWindow.isMinimized()) {
      this.rootWindow.restore();
    }
  }

}

module.exports = TrayIcon;
