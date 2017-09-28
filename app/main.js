/**
 * @module storjshare/main
 */

'use strict';

const {connect} = require('net');
const path = require('path');
const { fork } = require('child_process');
const {app, BrowserWindow, ipcMain: ipc} = require('electron');
//const isCommandLaunched = /(electron(\.exe|\.app)?)$/.test(app.getPath('exe'));
const ApplicationMenu = require('./lib/menu');
const TrayIcon = require('./lib/trayicon');
//const AutoLauncher = require('./lib/autolaunch');
const FatalExceptionDialog = require('./lib/fatal-exception-dialog');
const {dialog} = require('electron');
const protocol = (process.env.isTestNet === 'true') ? 'testnet' : '';
/*
const autoLauncher = new AutoLauncher({
  name: app.getName(),
  path: app.getPath('exe'),
  isHidden: false
});
*/
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
  event.preventDefault();
  main.hide();
}

/**
 * Toggles main process options based on received updates for the
 * application settings from the renderer
 */
function updateSettings(ev, data) {
  userData = tray.userData = JSON.parse(data);
/*
  if (userData.appSettings.launchOnBoot && !isCommandLaunched) {
    autoLauncher.enable();
  } else if(!userData.appSettings.launchOnBoot && !isCommandLaunched) {
    autoLauncher.disable();
  }
*/
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
    sock.removeAllListeners();
    initRPCServer(callback);
  });
}

function initRPCServer(callback) {
  let RPCServer = fork(`${__dirname}/lib/rpc-server.js`, {env: {STORJ_NETWORK: protocol}});
  process.on('exit', () => {
    RPCServer.kill();
  })

  RPCServer.on('message', (msg) => {
    if(msg.state === 'init') {
      return callback();
    } else {
      RPCServer.removeAllListeners();
      let killMsg = new FatalExceptionDialog(app, main, new Error(msg.error));
      if(tray && tray.destroy) {
        tray.destroy();
      }

      killMsg.render();
    }
  });
}

/**
 * Establishes the app window, menu, tray, and other components
 * Setup IPC listeners and handlers
 */
function initRenderer() {
  menu = new ApplicationMenu();
  main = new BrowserWindow({
    width: 1448,
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
