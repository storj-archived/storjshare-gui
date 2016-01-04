/**
 * @module dataserv-client/dataserv
 */

'use strict';

var child_process = require('child_process');
var exec = child_process.execFile;
var spawn = child_process.spawn;
var Logger = require('./logger');
var fs = require('fs');
var Installer = require('./installer');

/**
 * DataServ Client Wrapper
 * @constructor
 * @param {String} datadir
 * @param {Object} ipc - ipc interface
 */
function DataServWrapper(datadir, ipc) {
  if (!(this instanceof DataServWrapper)) {
    return new DataServWrapper(datadir, ipc);
  }

  this._ipc = ipc;
  this._datadir = datadir;
  this._children = {};
  this._current = {};
  this._exec = Installer(datadir).getDataServClientPath();

  process.on('exit', this._clean.bind(this));
}

/**
 * Bootstraps a new dataserv-client process
 * #_bootstrap
 * @param {String} executable
 * @param {String} name
 * @param {Array} args
 */
DataServWrapper.prototype._bootstrap = function(id, name, args) {
  var self = this;
  var proc = this._children[id] = spawn(this._exec, args);

  this._current[id] = name;
  proc._logger = new Logger();

  proc._logger.append(this._exec + ' ' + args.join(' '));

  proc.stdout.on('data', function(data) {
    proc._logger.append(data.toString());
  });

  proc.stderr.on('data', function(data) {
    proc._logger.append(data.toString());
    self._ipc.send('processTerminated');
  });

  self._ipc.send('processStarted');

  return proc;
};

/**
 * Starts DataServClient `farm`
 * #farm
 * @param {Object} tab
 */
DataServWrapper.prototype.farm = function(tab) {
  var args = [
    '--config_path=' + this._getConfigPath(tab.id),
    '--store_path=' + tab.storage.path,
    '--max_size=' + tab.storage.size + tab.storage.unit
  ];

  if (tab.storage.tree) {
    args.push('--use_folder_tree');
  }

  return this._bootstrap(tab.id, 'FARMING', args.concat(['farm']));
};

/**
 * Starts DataServClient `build`
 * #build
 * @param {Object} tab
 */
DataServWrapper.prototype.build = function(tab) {
  var args = [
    '--config_path=' + this._getConfigPath(tab.id),
    '--store_path=' + tab.storage.path,
    '--max_size=' + tab.storage.size + tab.storage.unit
  ];

  if (tab.storage.tree) {
    args.push('--use_folder_tree');
  }

  return this._bootstrap(tab.id, 'BUILDING', args.concat(['build']));
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
 * @param {Function} callback
 */
DataServWrapper.prototype.setAddress = function(address, id, callback) {
  var configPath = this._getConfigPath(id);
  var configFile = null;

  if (fs.existsSync(configPath)) {
    configFile = fs.readFileSync(configPath).toString();

    if (configFile.indexOf(address) === -1) {
      fs.unlinkSync(configPath);
    }
  }

  return exec(this._exec, [
    '--config_path=' + this._getConfigPath(id),
    'config',
    '--set_payout_address=' + address
  ], callback);
};

/**
 * Validates the dataservclient executable by asking for it's version
 * #validateClient
 * @param {String} execname - dataservclient executable name
 * @param {Function} callback
 */
DataServWrapper.prototype.validateClient = function(execname, callback) {
  exec(execname, ['version'], function(err, stdout) {
    if (err) {
      return callback(err);
    }

    if (!stdout) {
      return callback(new Error('Invalid dataserv-client'));
    }

    callback(null, stdout);
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
    proc._logger.append(proc.pid + ' terminated');
    proc.kill();

    this._children[id] = null;
    this._current[id] = null;

    this._ipc.send('processTerminated');
  }
};

/**
 * Returns the config path for the given ID
 * #_getConfigPath
 * @param {String} id
 */
DataServWrapper.prototype._getConfigPath = function(id) {
  var datadir = this._datadir + '/drives';

  if (!fs.existsSync(datadir)) {
    fs.mkdirSync(datadir);
  }

  return datadir + '/' + id;
};

/**
 * Kills all managed processes
 * #_clean
 */
DataServWrapper.prototype._clean = function() {
  for (var proc in this._children) {
    if (this._children[proc]) {
      this._children[proc].kill();
    }
  }
};

module.exports = DataServWrapper;
