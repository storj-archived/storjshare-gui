/**
 * @module storjshare/main
 */

'use strict';

const storjshare = require('storjshare-daemon');
const dnode = require('dnode');
const {connect} = require('net');
const path = require('path');
const {app, BrowserWindow, ipcMain: ipc} = require('electron');
const isCommandLaunched = /(electron(\.exe|\.app)?)$/.test(app.getPath('exe'));
const ApplicationMenu = require('./lib/menu');
const TrayIcon = require('./lib/trayicon');
const AutoLauncher = require('./lib/autolaunch');

const autoLauncher = new AutoLauncher({
  name: app.getName(),
  path: app.getPath('exe'),
  isHidden: false
});

let main;
let tray;
let menu;
let userData;

const isSecondAppInstance = app.makeSingleInstance(function() {
  if (main) {
    if (main.isMinimized()) {
      main.restore();
    }
    main.show();
  }
  return true;
});

if (isSecondAppInstance) {
  app.quit();
}

/**
 * Prevents application from exiting on close, instead hiding it
 */
function minimizeToSystemTray(event) {
  if (isCommandLaunched) {
    return app.quit();
  }

  event.preventDefault();
  main.hide();
}

/**
 * Toggles main process options based on received updates for the
 * application settings from the renderer
 */
function updateSettings(ev, data) {
  userData = tray.userData = JSON.parse(data);

  if (userData.appSettings.launchOnBoot && !isCommandLaunched) {
    autoLauncher.enable();
  } else if(!userData.appSettings.launchOnBoot && !isCommandLaunched) {
    autoLauncher.disable();
  }
}

/**
 * Check if the daemon is online and starts it if not running
 */
function maybeStartDaemon(callback) {
  const sock = connect(45015);

  sock.on('connect', () => {
    sock.end();
    sock.removeAllListeners();
    callback();
  });

  sock.on('error', () => {
    let api = new storjshare.RPC();

    sock.removeAllListeners();
    dnode(api.methods).listen(45015, callback);
  });
}

/**
 * Establishes the app window, menu, tray, and other components
 * Setup IPC listeners and handlers
 */
function initRenderer() {
  menu = new ApplicationMenu();
  main = new BrowserWindow({
    width: 970,
    height: 600,
    show: false // NB: Always hidden, wait for renderer to signal show
  });
  tray = new TrayIcon(app, main, path.join(__dirname, 'imgs'), userData);


  main.on('close', (e) => minimizeToSystemTray(e));
  app.on('activate', () => main.show());
  ipc.on('appSettingsChanged', (event, data) => updateSettings(event, data));
  ipc.on('showApplicationWindow', () => main.show());

  // NB: Start the daemon if not running, then render the application
  maybeStartDaemon((/* err */) => {
    menu.render();
    main.loadURL('file://' + __dirname + '/index.html');
    tray.render();
  });
}

app.on('ready', initRenderer);
