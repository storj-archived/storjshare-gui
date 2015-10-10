'use strict';

var app = require('app');
var Menu = require('menu');
var shell = require('shell');
var request = require('request');
var BrowserWindow = require('browser-window');
var ipc = require("electron-safe-ipc/host");
var env = require('./electron_boilerplate/env_config');
var pjson = require('../package.json');

var logs = '';

var addLog = function(record) {
	logs += record + "\n";
};

var insertLog = function(record) {
	logs = record + "\n" + logs;
};

var clearLogs = function() {
	logs = '';
};

var showLogs = function() {
	require('dialog').showMessageBox({ title: 'Logs', message: logs, buttons: ["Close"] });
};

var processStarted = function() {
	exports.initMenu(true);
}

var processTerminated = function() {
	exports.initMenu(false);
}

exports.init = function (disablePreferences) {
	
	ipc.on('addLog', addLog);
	ipc.on('insertLog', insertLog);
	ipc.on('clearLogs', clearLogs);
	ipc.on('showLogs', showLogs);
	ipc.on('processStarted', processStarted);
	ipc.on('processTerminated', processTerminated);

	// File
	var menuTemplate = [{
		label: 'File',
		submenu: [{
			label: 'Preferences',
			accelerator: 'CmdOrCtrl+P',
			enabled: !disablePreferences,
			click: function () {
				ipc.send("openPreferencesPopup");
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
			click: showLogs
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