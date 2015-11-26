/* global __dirname */
'use strict';

var app = require('app');
var BrowserWindow = require('browser-window');
var env = require('./lib/electron_boilerplate/env_config');
var windowStateKeeper = require('./lib/electron_boilerplate/window_state');
var Tray = require('tray');
var Menu = require('menu');
var MenuItem = require('menu-item');

var mainWindow;

// Preserver of the window size and position between app launches.
var mainWindowState = windowStateKeeper('main', {
	width: 620,
	height: 640
});

var appIcon = null;
app.on('ready', function () {
	showTrayIcon();
});

app.on('window-all-closed', function (e) {
	e.preventDefault();
});

function showTrayIcon(){
	appIcon = new Tray('./resources/icon.png');
	
	var contextMenu = new Menu();
  	contextMenu.append(new MenuItem({ label: 'Show', id: 'show', click: function() {
  		openMainWindow();
  	} }));
  	contextMenu.append(new MenuItem({ label: 'Quit', id: 'quit', click: function() {
  		app.quit();
  	} }));
  	appIcon.setToolTip('Drive share is runing');
  	appIcon.setContextMenu(contextMenu);
}

function openMainWindow(){
	if (mainWindow && mainWindow.isVisible()) {
		return false;
	}
	mainWindow = new BrowserWindow({
		x: mainWindowState.x,
		y: mainWindowState.y,
		width: mainWindowState.width,
		height: mainWindowState.height,
		icon: './resources/icon.png'
	});
	
	if (mainWindowState.isMaximized) {
		mainWindow.maximize();
	}

	require('./lib/menu').init();
	mainWindow.loadUrl('file://' + __dirname + '/driveshare.html');
	
	if (env.showDevTools) {
		mainWindow.openDevTools();
	}

	mainWindow.on('close', function () {
		mainWindowState.saveState(mainWindow);
		showTrayIcon();
	});

	mainWindow.on('minimize', function(){
		mainWindow.close();
	});
}