'use strict';

var app = require('app');
var Menu = require('menu');
var BrowserWindow = require('browser-window');
var env = require('./electron_boilerplate/env_config');

module.exports.initMenu = function () {
	
	var menuTemplate = [];
	
	// TODO: Add normal options
	
	// Add development options
	if(env.name == 'development') {
		menuTemplate.push({
			label: 'Development',
			submenu: [{
				label: 'Reload',
				accelerator: 'CmdOrCtrl+R',
				click: function () {
					BrowserWindow.getFocusedWindow().reloadIgnoringCache();
				}
			},{
				label: 'Toggle DevTools',
				accelerator: 'Shift+CmdOrCtrl+J',
				click: function () {
					BrowserWindow.getFocusedWindow().toggleDevTools();
				}
			},{
				label: 'Quit',
				accelerator: 'CmdOrCtrl+Q',
				click: function () {
					app.quit();
				}
			}]
		});
	}
	
    var appMenu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(appMenu);
};