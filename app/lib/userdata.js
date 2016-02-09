/**
 * @module dataserv-client/userdata
 */

'use strict';

var assert = require('assert');
var fs = require('fs');
var request = require('request');
var Installer = require('./installer');
var Tab = require('./tab');
var merge = require('merge');

/**
 * Initializes user data handler
 * @constructor
 * @param {String} datadir - user data directory
 */
function UserData(datadir) {
  if (!(this instanceof UserData)) {
    return new UserData(datadir);
  }

  assert(fs.existsSync(datadir), 'Invalid data directory');

  this._dataserv = Installer(datadir).getDataServClientPath();
  this._path = datadir + '/settings.json';
  this._parsed = this._read();
}

UserData.DEFAULTS = {
  tabs: [],
  appSettings: {
    minToTask: true,
    launchOnBoot: false,
    runDrivesOnBoot: true
  }
};
/**
 * Loads the userdata from disk
 * #_read
 */
UserData.prototype._read = function() {
  if (!fs.existsSync(this._path)) {
    fs.writeFileSync(this._path, JSON.stringify(UserData.DEFAULTS));
  }

  var parsed = JSON.parse(fs.readFileSync(this._path));

  if (this._isLegacyConfig(parsed)) {
    parsed = this._migrateLegacyConfig(parsed);
  }

  parsed.tabs = parsed.tabs.map(function(tabdata) {
    return new Tab({
      addr       : tabdata.address,
      storage    : tabdata.storage,
      id         : tabdata.id,
      active     : tabdata.active,
      wasRunning : tabdata.wasRunning
    });
  });

  return merge(UserData.DEFAULTS, parsed);
};

/**
 * Checks if the given config uses the legacy format
 * #_isLegacyConfig
 * @param {Object} config
 */
UserData.prototype._isLegacyConfig = function(config) {
  var isLegacy = true;
  var legacyKeys = [
    'payoutAddress',
    'dataservDirectory',
    'dataservSize',
    'dataservSizeUnit'
  ];
  var configKeys = Object.keys(config);

  legacyKeys.forEach(function(key) {
    if (configKeys.indexOf(key) === -1) {
      isLegacy = false;
    }
  });

  if (!Array.isArray(config.dataservDirectory)) {
    isLegacy = false;
  }

  return isLegacy;
};

/**
 * Returns a converted config from legacy config
 * #_migrateLegacyConfig
 * @param {Object} config
 */
UserData.prototype._migrateLegacyConfig = function(config) {
  return {
    tabs: [new Tab({
      addr : config.payoutAddress,
      storage : {
        path: config.dataservDirectory[0],
        size: config.dataservSize,
        unit: config.dataservSizeUnit
      }
    })]
  };
};

/**
 * Validate the instance dataserv client path
 * #_isValidDataservClient
 */
UserData.prototype._isValidDataservClient = function() {
  return !!(this._dataserv && typeof this._dataserv !== 'undefined');
};

/**
 * Validate the given payout address
 * #_isValidPayoutAddress
 * @param {String} address
 */
UserData.prototype._isValidPayoutAddress = function(address) {
  return !!(address && typeof address !== 'undefined');
};

/**
 * Validate the given dataserv directory
 * #_isValidDataservDirectory
 * @param {String} directory
 */
UserData.prototype._isValidDataservDirectory = function(directory) {
  return fs.existsSync(directory);
};

/**
 * Validate the given size
 * #_isValidDataservSize
 * @param {String} size
 */
UserData.prototype._isValidDataservSize = function(size) {
  return Number(size) > 0 && typeof size !== 'undefined';
};

/**
 * Validates a given tab config
 * #validate
 * @param {Number} tabindex
 */
UserData.prototype.validate = function(tabindex) {
  var tab = this._parsed.tabs[tabindex];

  assert(this._isValidPayoutAddress(tab.address), 'Invalid payout address');
  assert(this._isValidDataservDirectory(tab.storage.path), 'Invalid directory');
  assert(this._isValidDataservSize(tab.storage.size), 'Invalid storage size');
};

/**
 * Fetches the balance for the given address
 * #getBalance
 * @param {String} address
 */
UserData.prototype.getBalance = function(address, callback) {
  if (!this._isValidPayoutAddress(address)) {
    return callback(new Error('Invalid payout address'));
  }

  var options = {
    url: 'http://xcp.blockscan.com/api2',
    qs: {
      module: 'address',
      action: 'balance',
      btc_address: address,
      asset: 'SJCX',
      json: true
    }
  };

  request(options, function(err, res, body) {
    if (err) {
      return callback(err);
    }

    if (body.status === 'error') {
      return callback(new Error(body.message));
    }

    var balance = body.data[0] ? body.data[0].balance : 0;

    callback(null, balance);
  });
};

/**
 * Save the configuration at the given index
 * #saveConfig
 * @param {Function} callback
 */
UserData.prototype.saveConfig = function(callback) {
  fs.writeFileSync(this._path, JSON.stringify(this.toObject(), null, 2));
  callback();
};

/**
 * Save the configuration at the given index
 * #toObject
 * @returns {Object}
 */
UserData.prototype.toObject = function(){
  return {
    tabs: this._parsed.tabs.map(function(tab) {
      return tab.toObject();
    }),
    appSettings: this._parsed.appSettings
  };
};

module.exports = UserData;
