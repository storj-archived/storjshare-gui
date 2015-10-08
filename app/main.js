/* global __dirname */
'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');
var env = require('./lib/electron_boilerplate/env_config');
var windowStateKeeper = require('./lib/electron_boilerplate/window_state');

var mainWindow;

// Preserver of the window size and position between app launches.
var mainWindowState = windowStateKeeper('main', {
	width: 800,
	height: 660
});

app.on('ready', function () {

	mainWindow = new BrowserWindow({
		x: mainWindowState.x,
		y: mainWindowState.y,
		width: mainWindowState.width,
		height: mainWindowState.height
	});

	if (mainWindowState.isMaximized) {
		mainWindow.maximize();
	}

	require('./lib/menu').initMenu();
	mainWindow.loadUrl('file://' + __dirname + '/driveshare.html');
	
	if (env.showDevTools) {
		mainWindow.openDevTools();
	}

	mainWindow.on('close', function () {
		mainWindowState.saveState(mainWindow);
	});
});

app.on('window-all-closed', function () {
	app.quit();
});
