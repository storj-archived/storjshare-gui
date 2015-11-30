/**
 * @module drivshare-gui/updater
 */

'use strict';

var events = require('events');
var util = require('util');
var request = require('request');
var ipc = require('electron-safe-ipc/guest');
var about = require('../package');

/**
 * Handles update checking
 * @constructor
 */
function Updater() {
  if (!(this instanceof Updater)) {
    return new Updater();
  }

  events.EventEmitter.call(this);

  this._versionCheckURL = about.config.versionCheckURL;

  ipc.on('checkForUpdates', this.check.bind(this));
  this.check(true);
}

util.inherits(Updater, events.EventEmitter);

/**
 * Fetches remote package metadata and determines if update is available
 * #check
 */
Updater.prototype.check = function() {
  var self = this;
  var meta = null;

  request(this._versionCheckURL, function(err, res, body) {
    if (err || res.statusCode !== 200) {
      return self.emit('error', err || new Error('Failed to check updates'));
    }

    try {
      meta = JSON.parse(body);
    } catch(err) {
      return self.emit('error', new Error('Failed to parse update info'));
    }

    if (about.version < meta.version) {
      self.emit('update_available');
    }
  });
};

module.exports = new Updater();
module.exports.Updater = Updater;
