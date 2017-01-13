/**
 * @module storjshare-gui/client
 */

'use strict';

const {EventEmitter} = require('events');

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

exports.about = registerView('./views/about');
exports.updater = registerView('./views/updater');
exports.overview = registerView('./views/overview');
exports.footer = registerView('./views/footer');
exports.terms = registerView('./views/terms');
