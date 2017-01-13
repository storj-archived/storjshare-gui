/**
 * @module storjshare/renderer
 */

'use strict';

const {ipcRenderer: ipc} = require('electron');
const {EventEmitter} = require('events');
const userData = require('./lib/userdata').toObject();

window.$ = window.jQuery = require('jquery');
window.Vue = require('vue');
window.ViewEvents = new EventEmitter(); // NB: For view-to-view communication

require('bootstrap');
require('./lib/helpers')
  .ExternalLinkListener().bind(document);

/**
 * Registers the views from their schemas
 */
function registerView(schemaPath) {
  return new window.Vue(require(schemaPath));
}

module.exports.about = registerView('./views/about');
module.exports.updater = registerView('./views/updater');
module.exports.overview = registerView('./views/overview');
module.exports.footer = registerView('./views/footer');
module.exports.terms = registerView('./views/terms');

// NB: Check user data for application settings and signal appropriate
// NB: messages to the main process
if (!userData.appSettings.silentMode) {
  ipc.send('showApplicationWindow');
}

