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

/**
 * DataServ Client Wrapper
 * @constructor
 */
function DataServWrapper() {
  this._children = {};
  this._current = {};
}

/**
 * Bootstraps a new dataserv-client process
 * #_bootstrap
 * @param {String} executable
 * @param {String} name
 * @param {Array} args
 */
DataServWrapper.prototype._bootstrap = function(executable, name, args) {
  this.terminate(executable);
  logger.append(executable + ' ' + args.join(' '));

  this._current[executable] = name;
  var proc = this._children[executable] = spawn(executable, args);

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
 * @param {String} execname - dataservclient executable name
 * @param {String} datadir - path the storage directory
 * @param {String} size
 * @param {String} unit
 */
DataServWrapper.prototype.farm = function(execname, datadir, size, unit) {
  return this._bootstrap(execname, 'FARMING', [
    '--store_path=' + datadir,
    '--max_size=' + size + unit,
    'farm'
  ]);
};

/**
 * Starts DataServClient `build`
 * #build
 * @param {String} execname - dataservclient executable name
 * @param {String} datadir - path the storage directory
 * @param {String} size
 * @param {String} unit
 */
DataServWrapper.prototype.build = function(execname, datadir, size, unit) {
  return this._bootstrap(execname, 'BUILDING', [
    '--store_path=' + datadir,
    '--max_size=' + size + unit,
    'build'
  ]);
};

/**
 * Starts DataServClient `register`
 * #register
 * @param {String} execname - dataservclient executable name
 */
DataServWrapper.prototype.register = function(execname) {
  return this._bootstrap(execname, 'REGISTERING', ['register']);
};

/**
 * Starts DataServClient `poll`
 * #poll
 * @param {String} execname - dataservclient executable name
 */
DataServWrapper.prototype.poll = function(execname) {
  return this._bootstrap(execname, 'POLLING', ['poll']);
};

/**
 * Calls DataServClient config setting
 * #setAddress
 * @param {String} execname - dataservclient executable name
 */
DataServWrapper.prototype.setAddress = function(execname, address) {
  return exec(execname, ['config', '--set_payout_address=' + address]);
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
 * @param {String} execname - dataservclient executable name
 */
DataServWrapper.prototype.terminate = function(execname) {
  var proc = this._children[execname];

  if (typeof proc !== 'undefined') {
    logger.append(proc.pid + ' terminated');
    proc.kill();

    this._children[execname] = null;
    this._current[execname] = null;

    ipc.send('processTerminated');
  }
};

module.exports = new DataServWrapper();
module.exports.DataServWrapper = DataServWrapper;
