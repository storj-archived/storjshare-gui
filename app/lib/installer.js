/**
 * @module dataserv-client/installer
 */

'use strict';

var assert = require('assert');
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var os = require('os');
var Logger = require('./logger');
var exec = require('child_process').exec;
var request = require('request');
var fs = require('fs-extra');
var ZipFile = require('adm-zip');
var path = require('path');
var config = require('../config');

/**
 * Represents a dataserv-client installer
 * @constructor
 * @param {String} datadir
 */
function DataServInstaller(datadir) {
  if (!(this instanceof DataServInstaller)) {
    return new DataServInstaller(datadir);
  }

  assert(fs.existsSync(datadir), 'Invalid data directory');

  this._logger = new Logger();
  this._platform = os.platform();
  this._userdir = datadir;
  this._destination = this._userdir + '/tmp/dataserv-client.zip';

  this._targets = {
    linux: {
      install: null, // this is handled by debian package management
      check: this._checkGnuLinux.bind(this),
      path: 'dataserv-client'
    },
    darwin: {
      install: this._installMacintosh.bind(this),
      check: this._checkMacintosh.bind(this),
      path: this._userdir +
            '/dataserv-client.app/Contents/MacOS/dataserv-client'
    },
    win32: {
      install: this._installWindows.bind(this),
      check: this._checkWindows.bind(this),
      path: this._userdir + '\\dataserv-client\\dataserv-client.exe'
    }
  };
}

inherits(DataServInstaller, EventEmitter);

/**
 * Initializes the installer and begins emitting events
 * #install
 */
DataServInstaller.prototype.install = function() {
  if (Object.keys(this._targets).indexOf(this._platform) === -1) {
    return this.emit('error', new Error('This platform is not supported'));
  }

  var self = this;
  var platform = this._targets[this._platform];

  this._logger.append('Checking if dataserv-client is installed...');
  platform.check(function(err, installed) {
    if (err) {
      self._logger.append(err.message);
      return self.emit('error', err);
    }

    if (!installed) {
      if (self._platform === 'linux') {
        return self.emit(
          'error',
          new Error('Dependencies must be installed via APT on GNU/Linux')
        );
      }

      return platform.install();
    }

    self._logger.append('The dataserv-client is installed!');
    self.emit('end');
  });
};

/**
 * Checks if the dataserv-client is already installed
 * #check
 * @param {Function} callback
 */
DataServInstaller.prototype.check = function(callback) {
  if (Object.keys(this._targets).indexOf(this._platform) === -1) {
    return callback(new Error('This platform is not supported'));
  }

  this._targets[this._platform].check(callback);
};

/**
 * Returns the path to the dataserv-client executable
 * #getDataServClientPath
 */
DataServInstaller.prototype.getDataServClientPath = function() {
  return this._targets[this._platform].path;
};

/**
 * Installs dataserv-client on macintosh systems
 * #_installMacintosh
 */
DataServInstaller.prototype._installMacintosh = function() {
  var self = this;
  var path = this.getDataServClientPath();

  this._downloadAndExtract(function() {
    fs.chmodSync(path, 755);
    self.emit('end');
  });
};

/**
 * Installs dataserv-client on windows systems
 * #_installWindows
 */
DataServInstaller.prototype._installWindows = function() {
  var self = this;

  this._downloadAndExtract(function() {
    self.emit('end');
  });
};

/**
 * Checks if dataserv-client is installed on gnu+linux systems
 * #_checkGnuLinux
 * @param {Function} callback
 */
DataServInstaller.prototype._checkGnuLinux = function(callback) {
  exec('which dataserv-client', function(err, stdout, stderr) {
    if (err || stderr) {
      return callback(null, false);
    }

    callback(null, true);
  });
};

/**
 * Checks if dataserv-client is installed on macintosh systems
 * #_checkMacintosh
 * @param {Function} callback
 */
DataServInstaller.prototype._checkMacintosh = function(callback) {
  fs.exists(this.getDataServClientPath(), function(exists) {
    callback(null, exists);
  });
};

/**
 * Checks if dataserv-client is installed on windows systems
 * #_checkWindows
 * @param {Function} callback
 */
DataServInstaller.prototype._checkWindows = function(callback) {
  fs.exists(this.getDataServClientPath(), function(exists) {
    callback(null, exists);
  });
};

/**
 * Fetches the download URL for dataserv-client
 * #_getDownloadURL
 * @param {Function} callback
 */
DataServInstaller.prototype._getDownloadURL = function(callback) {
  var platform;
  var options = {
    url: config.dataservClientURL,
    headers: { 'User-Agent': 'Storj' },
    json: true
  };

  if (this._platform === 'darwin') {
    platform = 'osx64';
  } else if (this._platform === 'linux') {
    platform = 'debian32';
  } else {
    platform = 'win32';
  }

  this._logger.append('Resolving download URL for dataserv-client...');

  request(options, function(err, res, body) {
    if (err) {
      return callback(err);
    }

    if (res.statusCode !== 200) {
      return callback(new Error('Failed to fetch download URL'));
    }

    for (var i = 0; i < body.assets.length; i++) {
      if (body.assets[i].name.indexOf(platform) !== -1) {
        return callback(null, body.assets[i].browser_download_url);
      }
    }

    callback(new Error('Download URL not resolved'));
  });
};

/**
 * Returns a download stream of the given url
 * #_getDownloadStream
 * @param {String} url
 */
DataServInstaller.prototype._getDownloadStream = function(url) {
  var self = this;
  var download = request.get(url);
  var position = 0;

  download.on('error', function(err) {
    self.emit('error', err);
  });

  download.on('data', function(data) {
    position += data.length;
    var amount = (position / 1048576).toFixed(2);
    self.emit('status', 'Downloading ' + '(' + amount + 'mb)');
  });

  return download;
};

/**
 * Downloads and extracts the dataserv-client executable
 * #_downloadAndExtract
 * @param {Function} callback
 */
DataServInstaller.prototype._downloadAndExtract = function(callback) {
  var self = this;
  var tmpdir = path.dirname(this._destination);

  if (!fs.existsSync(tmpdir)) {
    fs.mkdirSync(tmpdir);
  }

  var writeStream = fs.createWriteStream(this._destination);

  writeStream.on('finish', function() {
    self._logger.append('Download complete, installing...');

    writeStream.close(function() {
      var zipfile = new ZipFile(self._destination);

      zipfile.extractAllTo(self._userdir, true);
      fs.remove(tmpdir);
      callback();
    });
  });

  this._getDownloadURL(function(err, url) {
    if (err) {
      return self.emit('error', err);
    }

    self._getDownloadStream(url).pipe(writeStream);
  });
};

module.exports = DataServInstaller;
