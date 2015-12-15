/**
 * @module drivshare-gui/updater
 */

'use strict';

var events = require('events');
var util = require('util');
var request = require('request');
var about = require('../package');
var assert = require('assert');
var semver = require('semver');

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
}

util.inherits(Updater, events.EventEmitter);

/**
 * Fetches remote package metadata and determines if update is available
 * #check
 */
Updater.prototype.check = function() {
  var self = this;

  var options = {
    url: this._versionCheckURL,
    headers: { 'User-Agent': 'storj/driveshare-gui' },
    json: true
  };

  request(options, function(err, res, body) {
    if (err || res.statusCode !== 200) {
      return self.emit('error', err || new Error('Failed to check updates'));
    }

    try {
      self._validateResponse(body);
    } catch (err) {
      return self.emit('error', new Error('Failed to parse update info'));
    }

    var meta = {
      releaseTag: body[0].tag_name,
      releaseURL: body[0].html_url
    };

    if (semver.lt(about.version, meta.releaseTag)) {
      self.emit('update_available', meta);
    }
  });
};

/**
 * Validates the response body from version check
 * #_validateResponse
 * @param {Object} body
 */
Updater.prototype._validateResponse = function(body) {
  assert(Array.isArray(body));
  assert(typeof body[0] === 'object');
  assert(typeof body[0].html_url === 'string');
  assert(typeof body[0].tag_name === 'string');
};

module.exports = Updater;
