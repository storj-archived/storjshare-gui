'use strict';

var app = require('app');
var Menu = require('menu');
var shell = require('shell');
var request = require('request');
var BrowserWindow = require('browser-window');
var ipc = require("electron-safe-ipc/host");
var env = require('./electron_boilerplate/env_config');

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

	// View
	var viewSubmenu = [{
			label: 'Reload',
			accelerator: 'CmdOrCtrl+R',
			click: function () {
				BrowserWindow.getFocusedWindow().reloadIgnoringCache();
			}
		}];

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
			label: 'About Steamminer',
			click: function () {
				ipc.send("showAboutDialog");
			}
		},]
	});

	var appMenu = Menu.buildFromTemplate(menuTemplate);
	Menu.setApplicationMenu(appMenu);
};
