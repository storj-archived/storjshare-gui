/**
 * @module drivshare-gui/updater
 */

'use strict';

const {EventEmitter} = require('events');
const request = require('request');
const {versionCheckURL} = require('../package').config;
const assert = require('assert');
const semver = require('semver');

class Updater extends EventEmitter {

  constructor() {
    super();
  }

  /**
   * Fetches remote package metadata and determines if update is available
   */
  checkForUpdates() {
    const self = this;
    const options = {
      url: versionCheckURL,
      headers: { 'User-Agent': 'storj/storjshare-gui' },
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
  }

  /**
   * Validates the response body from version check
   * @param {Object} body
   */
  _validateResponse(body) {
    assert(Array.isArray(body));
    assert(typeof body[0] === 'object');
    assert(typeof body[0].html_url === 'string');
    assert(typeof body[0].tag_name === 'string');
  }

}

module.exports = new Updater();
