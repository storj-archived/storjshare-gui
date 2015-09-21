/* global __dirname */
'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');
var env = require('./lib/electron_boilerplate/env_config');
var menu = require('./lib/application-menu');
var windowStateKeeper = require('./lib/electron_boilerplate/window_state');

var mainWindow;

// Preserver of the window size and position between app launches.
var mainWindowState = windowStateKeeper('main', {
    width: 640,
    height: 480
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

	menu.initMenu();
    mainWindow.loadUrl('file://' + __dirname + '/app.html');
	
	/*
    if (env.name === 'development') {
        mainWindow.openDevTools();
    }
	*/

    mainWindow.on('close', function () {
        mainWindowState.saveState(mainWindow);
    });
});

app.on('window-all-closed', function () {
    app.quit();
});
