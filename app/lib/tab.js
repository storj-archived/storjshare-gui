/**
 * @module driveshare-gui/tab
 */

'use strict';

var crypto = require('crypto');

/**
 * Represent an individual tab's data for dataserv-client
 * @constructor
 * @param {String} addr - payout address
 * @param {Object} storage - storage config
 */
function Tab(addr, storage, id, active) {
  /* jshint maxcomplexity:false */
  if (!(this instanceof Tab)) {
    return new Tab(addr, storage, id, active);
  }

  storage = storage || {};

  this.address = addr || '';
  this.storage = {
    path: storage.path || '',
    size: storage.size || 0,
    unit: storage.unit || 'GB'
  };
  this.id = id || this.createID();
  this.active = typeof active === 'undefined' ? false : active;
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
    id: this.id
  };
};

module.exports = Tab;
