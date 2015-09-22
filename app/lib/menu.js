'use strict';

var app = require('app');
var Menu = require('menu');
var shell = require('shell');
var BrowserWindow = require('browser-window');
var ipc = require("electron-safe-ipc/host");
var env = require('./electron_boilerplate/env_config');

exports.initMenu = function () {
	
	// File
	var menuTemplate = [{
		label: 'File',
		submenu: [{
			label: 'Preferences',
			accelerator: 'CmdOrCtrl+P',
			click: function () {
				ipc.send("openPreferencesPopup");
			}
		},{
			label: 'Start',
			click: function () {
				ipc.send("farm");
			}
		},{
			label: 'Stop',
			click: function () {
				ipc.send("terminateProcess");
			}
		},{
			label: 'Quit',
			accelerator: 'CmdOrCtrl+Q',
			click: function () {
				app.quit();
			}
		}]
	}];
	
	// Edit
	menuTemplate.push({
		label: 'Edit',
		submenu: [{
			label: 'Undo',
			accelerator: 'CmdOrCtrl+Z',
			click: function () {
				BrowserWindow.getFocusedWindow().webContents.undo();
			}
		},{
			label: 'Redo',
			accelerator: 'CmdOrCtrl+Y',
			click: function () {
				BrowserWindow.getFocusedWindow().webContents.redo();
			}
		},{
			type: 'separator'
		},{
			label: 'Cut',
			accelerator: 'CmdOrCtrl+X',
			click: function () {
				BrowserWindow.getFocusedWindow().webContents.cut();
			}
		},{
			label: 'Copy',
			accelerator: 'CmdOrCtrl+C',
			click: function () {
				BrowserWindow.getFocusedWindow().webContents.copy();
			}
		},{
			label: 'Paste',
			accelerator: 'CmdOrCtrl+V',
			click: function () {
				BrowserWindow.getFocusedWindow().webContents.paste();
			}
		},{
			label: 'Select All',
			accelerator: 'CmdOrCtrl+A',
			click: function () {
				BrowserWindow.getFocusedWindow().webContents.selectAll();
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

	menuTemplate.push({
		label: 'View',
		submenu: viewSubmenu
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