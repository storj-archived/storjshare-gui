/**
 * @module storjshare-gui/tab
 */

'use strict';

var crypto = require('crypto');
var KeyPair = require('storj-lib').KeyPair;

/**
 * Represent an individual tab's data
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
  options.network = options.network || {};
  options.tunnels = options.tunnels || {};
  options.usedspace = options.usedspace || {};
  options.remainingspace = options.remainingspace || {};
  options.contracts = options.contracts || {};

  this.contracts = {
    total: options.contracts.total || 0
  };
  
  this.usedspace = {
    size: options.usedspace.size || 0,
    unit: options.usedspace.unit || 'B'
  };

  this.remainingspace = {
    size: options.remainingspace.size || 0,
    unit: options.remainingspace.unit || 'B'
  };

  this.key = KeyPair(options.key).getPrivateKey();
  this.address = options.addr || '';
  this.storage = {
    path: options.storage.path || '',
    size: options.storage.size || 0,
    unit: options.storage.unit || 'GB'
  };
  this.network = {
    hostname: options.network.hostname || '127.0.0.1',
    port: options.network.port || 0,
    seed: options.network.seed || '',
    nat: options.network.nat || 'true'
  };

  var numcx = (isNaN(Number(options.tunnels.numConnections)))  ?
    0 :
    options.tunnels.numConnections;

  this.tunnels = {
    numConnections: numcx,
    tcpPort: options.tunnels.tcpPort || 0,
    startPort: options.tunnels.startPort || 0,
    endPort: options.tunnels.endPort || 0
  };

  this.transitioning = false;
  this.id = options.id || this.createID();
  this.shortId = this.id.substr(0, 6);
  this.active = typeof options.active === 'undefined' ? false : options.active;
  this.wasRunning = options.wasRunning || false;
  this.farmer = null;
  this.spaceUsedPercent = 0;
  this.connectedPeers = 0;
  this.lastChange = options.lastChange || 'Pending...';
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
    key: this.key,
    address: this.address,
    storage: this.storage,
    id: this.id,
    wasRunning: this.wasRunning,
    network: this.network,
    tunnels: this.tunnels,
    usedspace: this.usedspace,
    remainingspace: this.remainingspace,
    contracts: this.contracts
  };
};

/**
 * Returns a trimmed address
 * #getAddress
 */
Tab.prototype.getAddress = function() {
  return this.address.trim();
};

module.exports = Tab;
