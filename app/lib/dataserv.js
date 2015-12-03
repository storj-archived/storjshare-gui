/**
 * @module dataserv-client/dataserv
 */

'use strict';

var os = require('os');
var child_process = require('child_process');
var exec = child_process.execFile;
var spawn = child_process.spawn;
var ipc = require('electron-safe-ipc/guest');
var logger = require('./logger');
var remote = require('remote');
var app = remote.require('app');
var fs = require('fs');
var Installer = require('./installer'), installer = new Installer();

/**
 * DataServ Client Wrapper
 * @constructor
 */
function DataServWrapper() {
  this._children = {};
  this._current = {};
  this._exec = installer.getDataServClientPath();
}

/**
 * Bootstraps a new dataserv-client process
 * #_bootstrap
 * @param {String} executable
 * @param {String} name
 * @param {Array} args
 */
DataServWrapper.prototype._bootstrap = function(id, name, args) {
  logger.append(this._exec + ' ' + args.join(' '));

  this._current[id] = name;
  var proc = this._children[id] = spawn(this._exec, args);

  proc.stdout.on('data', function(data) {
    logger.append(data.toString());
  });

  proc.stderr.on('data', function(data) {
    logger.append(data.toString());
    ipc.send('processTerminated');
  });

  ipc.send('processStarted');

  return proc;
};

/**
 * Starts DataServClient `farm`
 * #farm
 * @param {Object} tab
 */
DataServWrapper.prototype.farm = function(tab) {
  return this._bootstrap(tab.id, 'FARMING', [
    '--config_path=' + this._getConfigPath(tab.id),
    '--store_path=' + tab.storage.path,
    '--max_size=' + tab.storage.size + tab.storage.unit,
    'farm'
  ]);
};

/**
 * Starts DataServClient `build`
 * #build
 * @param {Object} tab
 */
DataServWrapper.prototype.build = function(tab) {
  return this._bootstrap(tab.id, 'BUILDING', [
    '--config_path=' + this._getConfigPath(tab.id),
    '--store_path=' + tab.storage.path,
    '--max_size=' + tab.storage.size + tab.storage.unit,
    'build'
  ]);
};

/**
 * Starts DataServClient `register`
 * #register
 */
DataServWrapper.prototype.register = function() {
  return this._bootstrap(null, 'REGISTERING', ['register']);
};

/**
 * Starts DataServClient `poll`
 * #poll
 * @param {String} execname - dataservclient executable name
 */
DataServWrapper.prototype.poll = function() {
  return this._bootstrap(null, 'POLLING', ['poll']);
};

/**
 * Calls DataServClient config setting
 * #setAddress
 * @param {String} address
 * @param {String} id - tab id for config
 */
DataServWrapper.prototype.setAddress = function(address, id) {
  return exec(id, [
    '--config_path=' + this._getConfigPath(id),
    'config',
    '--set_payout_address=' + address
  ]);
};

/**
 * Validates the dataservclient executable by asking for it's version
 * #validateClient
 * @param {String} execname - dataservclient executable name
 * @param {Function} callback
 */
DataServWrapper.prototype.validateClient = function(execname, callback) {
  exec(execname, ['version'], function(err, stdout, stderr) {
    if (err) {
      return callback(err);
    }

    var version = os.platform() !== 'darwin' ? stdout : stderr;

    if (!version) {
      return callback(new Error('Invalid dataserv-client'));
    }

    logger.append(version);
    callback(null);
  });
};

/**
 * Terminates the given DataServClient process
 * #terminate
 * @param {String} id
 */
DataServWrapper.prototype.terminate = function(id) {
  var proc = this._children[id];

  if (typeof proc !== 'undefined') {
    logger.append(proc.pid + ' terminated');
    proc.kill();

    this._children[execname] = null;
    this._current[execname] = null;

    ipc.send('processTerminated');
  }
};

/**
 * Returns the config path for the given ID
 * #_getConfigPath
 * @param {String} id
 */
DataServWrapper.prototype._getConfigPath = function(id) {
  var datadir = app.getPath('userData') + '/drives';

  if (!fs.existsSync(datadir)) {
    fs.mkdirSync(datadir);
  }

  return datadir + '/' + id;
};

module.exports = new DataServWrapper();
module.exports.DataServWrapper = DataServWrapper;
