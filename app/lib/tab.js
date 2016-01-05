/**
 * @module driveshare-gui/tab
 */

'use strict';

var crypto = require('crypto');

/**
 * Represent an individual tab's data for dataserv-client
 * @constructor
 * @param {Object} options - tab options object
 * @param {String} options.addr - payout address
 * @param {Object} options.storage - storage config
 * @param {Object} options.id - sha1 ID of tab or label
 * @param {Object} options.active - current state of tab focus
 * @param {Boolean} options.wasRunning - running state of drive at exit
 */
function Tab(options) {
  /* jshint maxcomplexity:false */
  if (!(this instanceof Tab)) {
    return new Tab(options);
  }
  options = options || {};
  options.storage = options.storage || {};

  this.address = options.addr || '';
  this.storage = {
    path: options.storage.path || '',
    size: options.storage.size || 0,
    unit: options.storage.unit || 'GB',
    tree: options.storage.tree || false
  };
  this.id = options.id || this.createID();
  this.active = typeof options.active === 'undefined' ? false : options.active;
  this.wasRunning = options.wasRunning || false;
  this._process = null;
}

/**
 * Creates a unique ID
 * #createID
 */
Tab.prototype.createID = function() {
  return crypto.createHash('sha1').update(
    this.address + this.storage.path + Date.now()
  ).digest('hex');
};

/**
 * Returns an abject suitable for commiting to disk
 * #toObject
 */
Tab.prototype.toObject = function() {
  return {
    address: this.address,
    storage: this.storage,
    id: this.id,
    wasRunning: this.wasRunning
  };
};

module.exports = Tab;
