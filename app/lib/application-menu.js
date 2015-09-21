'use strict';

var app = require('app');
var Menu = require('menu');
var shell = require('shell');
var BrowserWindow = require('browser-window');
var env = require('./electron_boilerplate/env_config');

module.exports.initMenu = function () {
	
	var menuTemplate = [];
	
	// File
	menuTemplate.push({
		label: 'File',
		submenu: [{
			label: 'Preferences',
			accelerator: 'CmdOrCtrl+P',
			click: function () {
				// TODO
			}
		},{
			label: 'Quit',
			accelerator: 'CmdOrCtrl+Q',
			click: function () {
				app.quit();
			}
		}]
	});

	// Edit
	menuTemplate.push({
		label: 'Edit',
		submenu: [{
			label: 'Undo',
			accelerator: 'CmdOrCtrl+Z',
			click: function () {
				// TODO
			}
		},{
			label: 'Redo',
			accelerator: 'CmdOrCtrl+Y',
			click: function () {
				// TODO
			}
		},{
			type: 'separator'
		},{
			label: 'Cut',
			accelerator: 'CmdOrCtrl+X',
			click: function () {
				// TODO
			}
		},{
			label: 'Copy',
			accelerator: 'CmdOrCtrl+C',
			click: function () {
				// TODO
			}
		},{
			label: 'Paste',
			accelerator: 'CmdOrCtrl+V',
			click: function () {
				// TODO
			}
		},{
			label: 'Select All',
			accelerator: 'CmdOrCtrl+A',
			click: function () {
				// TODO
			}
		}]
	});

	// View
	var viewSubmenu = [{
			label: 'Reload',
			accelerator: 'CmdOrCtrl+R',
			click: function () {
				BrowserWindow.getFocusedWindow().reloadIgnoringCache();
			}
		},{
			label: 'Toggle Full Screen',
			accelerator: 'CmdOrCtrl+Shift+F',
			click: function () {
				BrowserWindow.getFocusedWindow().toggleFullScreen();
			}
		}];

	if(env.name == 'development') {
		viewSubmenu.push({
			label: 'Toggle Dev Tools',
			accelerator: 'Shift+CmdOrCtrl+J',
			click: function () {
				BrowserWindow.getFocusedWindow().toggleDevTools();
			}
		})
	}

	viewSubmenu = viewSubmenu.concat([{
		 type: 'separator'
		},{
			label: 'Actual Size',
			accelerator: 'CmdOrCtrl+O',
			click: function () {
				// TODO
			}
		}, {
			label: 'Zoom In',
			accelerator: 'CmdOrCtrl+Shift+=',
			click: function () {
				// TODO
			}
		}, {
			label: 'Zoom Out',
			accelerator: 'CmdOrCtrl+Shift+-',
			click: function () {
				// TODO
			}
		}
	]);
		
	menuTemplate.push({
		label: 'View',
		submenu: viewSubmenu
	});
	
	menuTemplate.push({
		label: 'Window',
		submenu: [{
			label: 'Always show Menu Bar',
			click: function () {
				// TODO
			}
		}]
	});
	
	menuTemplate.push({
		label: 'Help',
		submenu: [{
			label: 'Check for Updates',
			click: function () {
				// TODO
			}
		},{
			 type: 'separator' 
		},{
			label: 'About DriveShare',
			click: function () {
				shell.openExternal('http://driveshare.org/');
			}
		},{
			label: 'About Storj',
			click: function () {
				shell.openExternal('http://storj.io/');
			}
		}]
	});
	
    var appMenu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(appMenu);
};