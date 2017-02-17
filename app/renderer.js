/**
 * @module storjshare/renderer
 */

'use strict';

const dnode = require('dnode');
const {ipcRenderer: ipc} = require('electron');
const {EventEmitter} = require('events');
const UserData = require('./lib/userdata');
const VueRouter = require('vue-router');

window.UserData = UserData.toObject();
window.$ = window.jQuery = require('jquery');
window.Vue = require('./node_modules/vue/dist/vue.common.js');
window.ViewEvents = new EventEmitter(); // NB: For view-to-view communication
window.Vue.use(VueRouter);
window.Tether = require('tether'); //bootstrap 4 dependency
require('bootstrap');
require('./lib/helpers').ExternalLinkListener().bind(document);

// NB: When settings change, notify the main process
UserData.on('settingsUpdated', (updatedSettings) => {
  ipc.send('appSettingsChanged', updatedSettings);
});

window.daemonSocket = dnode.connect(45015, (rpc) => {
  // NB: Add global reference to the daemon RPC
  window.daemonRpc = rpc;
  window.app = new window.Vue(require('./app'));

  // NB: Check user data for application settings and signal appropriate
  // NB: messages to the main process
  if (!window.UserData.appSettings.silentMode) {
    ipc.send('showApplicationWindow');
  }

});
