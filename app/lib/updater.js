/**
 * @module drivshare-gui/updater
 */

'use strict';

const about = require('../package');
const {EventEmitter} = require('events');
const request = require('request');
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
      url: 'https://api.github.com/repos/Storj/storjshare-gui/releases/latest',
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
        releaseTag: body.tag_name,
        releaseURL: body.html_url
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
    assert(typeof body === 'object');
    assert(typeof body.html_url === 'string');
    assert(typeof body.tag_name === 'string');
  }

}

module.exports = new Updater();
