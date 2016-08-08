'use strict';

var assert = require('assert');
var fs = require('fs');
var Tab = require('./tab');
var merge = require('merge');
var storj = require('storj');
var bitcore = storj.deps.bitcore;

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

  this._path = datadir + '/settings.json';
  this._parsed = this._read();
  var logfolder = this._parsed.appSettings.logFolder;
  this._parsed.appSettings.logFolder = logfolder || datadir;
}

UserData.DEFAULTS = {
  tabs: [],
  appSettings: {
    minToTask: true,
    launchOnBoot: false,
    runDrivesOnBoot: true,
    reportTelemetry: true,
    logFolder: '',
    logLevel: 3
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
      key: tabdata.key,
      addr: tabdata.address,
      storage: tabdata.storage,
      id: tabdata.id,
      active: tabdata.active,
      wasRunning: tabdata.wasRunning,
      network: tabdata.network,
      tunnels: tabdata.tunnels
    });
  });

  return merge.recursive(UserData.DEFAULTS, parsed);
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
 * Validate the given payout address
 * @param {String} address
 */
UserData.prototype._isValidPayoutAddress = function(address) {
  return bitcore.Address.isValid(address) ||
         bitcore.Address.isValid(address, bitcore.Networks.testnet);
};

/**
 * Validate the given dataserv directory
 * @param {String} directory
 */
UserData.prototype._isValidDirectory = function(directory) {
  return fs.existsSync(directory);
};

/**
 * Validate the given size
 * @param {String} size
 */
UserData.prototype._isValidSize = function(size) {
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
  assert(this._isValidDirectory(tab.storage.path), 'Invalid directory');
  assert(this._isValidSize(tab.storage.size), 'Invalid storage size');
};

/**
 * Save the configuration at the given index
 * @param {Function} callback
 */
UserData.prototype.saveConfig = function(callback) {
  try {
    fs.writeFileSync(this._path, JSON.stringify(this.toObject(), null, 2));
  } catch (err) {
    return callback(err);
  }

  callback();
};

/**
 * Save the configuration at the given index
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
