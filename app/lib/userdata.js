/**
 * @module dataserv-client/userdata
 */

'use strict';

var assert = require('assert');
var os = require('os');
var fs = require('fs');
var request = require('request');
var diskspace = require('diskspace');
var rootDrive = os.platform() !== 'win32' ? '/' : 'C';
var Installer = require('./installer');
var Tab = require('./tab');

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

/**
 * Loads the userdata from disk
 * #_read
 */
UserData.prototype._read = function() {
  if (!fs.existsSync(this._path)) {
    fs.writeFileSync(this._path, JSON.stringify({
      tabs: []
    }));
  }

  var parsed = JSON.parse(fs.readFileSync(this._path));

  if (this._isLegacyConfig(parsed)) {
    parsed = this._migrateLegacyConfig(parsed);
  }

  parsed.tabs = parsed.tabs.map(function(tabdata) {
    return new Tab(
      tabdata.address,
      tabdata.storage,
      tabdata.id,
      tabdata.active
    );
  });

  return parsed;
};

/**
 * Checks if the given config uses the legacy format
 * #_isLegacyConfig
 * @param {Object} config
 */
UserData.prototype._isLegacyConfig = function(config) {
  return !!(config.payoutAddress && config.dataservDirectory &&
            Array.isArray(config.dataservDirectory) &&
            config.dataservSize && config.dataservSizeUnit);
};

/**
 * Returns a converted config from legacy config
 * #_migrateLegacyConfig
 * @param {Object} config
 */
UserData.prototype._migrateLegacyConfig = function(config) {
  return {
    tabs: [new Tab(config.payoutAddress, {
      path: config.dataservDirectory[0],
      size: config.dataservSize,
      unit: config.dataservSizeUnit
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
 * Determines the amount of free space available measured in the given unit
 * #_queryFreeSpace
 * @param {String} unit
 * @param {Function} callback
 */
UserData.prototype._queryFreeSpace = function(unit, callback) {
  var format = {
    MB: [1e-6, 0],
    GB: [1e-9, 1],
    TB: [1e-12, 2]
  };

  if (!format[unit]) {
    return callback(new Error('Invalid unit of measure'));
  }

  var measure = format[unit];

  diskspace.check(rootDrive, function(total, free) {
    if (isNaN(free)) {
      return callback(new Error('Invalid drive'));
    }

    callback(null, (free * measure[0]).toFixed(measure[1]) + ' ' + unit);
  });
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
  fs.writeFile(this._path, JSON.stringify(this._parsed, null, 2), callback);
};

module.exports = UserData;
