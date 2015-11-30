/**
 * @module driveshare-gui/tab
 */

'use strict';

/**
 * Represent an individual tab's data for dataserv-client
 * @constructor
 * @param {String} addr - payout address
 * @param {Object} storage - storage config
 */
function Tab(addr, storage) {
  storage = storage || {};

  this.address = addr || '';
  this.storage = {
    path: storage.path || '',
    size: storage.size || 0,
    unit: storage.unit || 'GB'
  };
  this.active = true;
}

module.exports = Tab;
