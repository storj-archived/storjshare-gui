'use strict';

var app = require('app');
var Menu = require('menu');
var shell = require('shell');
var request = require('request');
var BrowserWindow = require('browser-window');
var ipc = require("electron-safe-ipc/host");
var env = require('./electron_boilerplate/env_config');
var pjson = require('../package.json');

exports.init = function () {
	ipc.on('processStarted', function() { exports.buildMenu(true); });
	ipc.on('processTerminated', function() { exports.buildMenu(false); });
	exports.buildMenu();
}

exports.buildMenu = function (processRunning) {
	// File
	var menuTemplate = [{
		label: 'File',
		submenu: [{
			label: processRunning ? 'Stop' : 'Start',
			accelerator: 'CmdOrCtrl+Return',
			click: function () {
				ipc.send(processRunning ? "terminateProcess" : "farm");
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
			label: 'Logs',
			accelerator: 'CmdOrCtrl+L',
			click: function() { ipc.send('showLogs'); }
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
				ipc.send("checkForUpdates");
			}
		},{
			label: 'About DriveShare',
			click: function () {
				require('dialog').showMessageBox({ 
					title: 'About', 
					message: 'Storj DriveShare version ' + pjson.version,
					buttons: ["Close"] });
			}
		},]
	});
	
	var appMenu = Menu.buildFromTemplate(menuTemplate);
	Menu.setApplicationMenu(appMenu);
};