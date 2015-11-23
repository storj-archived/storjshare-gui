/**
 * @module driveshare-gui/tray
 */

'use strict';

var path = require('path');
var app = require('app');
var Menu = require('menu');
var Tray = require('tray');
var tray = new Tray(path.resolve(__dirname, '../../resources/icon.png'));

tray.setContextMenu(Menu.buildFromTemplate([
  {
    label: 'Show/Hide DriveShare',
    type: 'normal',
    click: function(item, window) {
      if (window.isVisible()) {
        window.hide();
      } else {
        window.show();
      }
    }
  }
]));

module.exports = tray;
