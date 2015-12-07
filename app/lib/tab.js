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
  this.active = typeof active === 'undefined' ? true : active;
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

module.exports = Tab;
