/**
 * @module dataserv-client/installer
 */

'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var os = require('os');
var logger = require('./logger');
var exec = require('child_process').exec;
var remote = require('remote');
var app = remote.require('app');
var request = require('request');
var fs = require('fs-extra');
var ZipFile = require('adm-zip');

/**
 * Represents a dataserv-client installer
 * @constructor
 */
function DataServInstaller() {
  if (!(this instanceof DataServInstaller)) {
    return new DataServInstaller();
  }

  this._platform = os.platform();
  this._userdir = app.getPath('userData');
  this._destination = this._userdir + '/tmp/dataserv-client.zip';
  this._targets = {
    linux: {
      install: this._installGnuLinux,
      check: this._checkGnuLinux,
      path: 'dataserv-client'
    },
    darwin: {
      install: this._installMacintosh,
      check: this._checkMacintosh,
      path: this._userdir +
            '/dataserv-client.app/Contents/MacOS/dataserv-client'
    },
    win32: {
      install: this._installWindows,
      check: this._checkWindows,
      path: this._userdir + '/dataserv-client/dataserv-client.exe'
    }
  };

}

inherits(DataServInstaller, EventEmitter);

/**
 * Initializes the installer and begins emitting events
 * #install
 * @param {String} password - gnu/linux only
 */
DataServInstaller.prototype.install = function(password) {
  if (Object.keys(this._targets).indexOf(this._platform) === -1) {
    return this.emit('error', new Error('This platform is not supported'));
  }

  var self = this;
  var platform = this._targets[this._platform];

  logger.append('Checking if dataserv-client is installed...');
  platform.check(function(err, installed) {
    if (err) {
      logger.append(err.message);
      return self.emit('error', err);
    }

    if (!installed) {
      return platform.install(password);
    }

    logger.append('The dataserv-client is installed!');
    self.emit('end');
  });
};

/**
 * Checks if the dataserv-client is alread installed
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
 * Installs dataserv-client on gnu+linux systems
 * #_installGnuLinux
 * @param {String} passwd
 */
DataServInstaller.prototype._installGnuLinux = function(passwd) {
  var self = this;
  var pipinstall = 'echo ' + passwd + ' | sudo -S apt-get install python-pip';
  var dsinstall = 'echo ' + passwd + ' | sudo -S pip install dataserv-client';

  this._checkPythonPipGnuLinux(function(err, installed) {
    if (err) {
      return self.emit('error', err);
    }

    if (!installed) {
      logger.append('Installing python-pip...');

      return exec(pipinstall, function(err, stdout) {
        if (err) {
          return self.emit('error', err);
        }

        logger.append(stdout);
        _installDataservClient();
      });
    }

    _installDataservClient();
  });

  function _installDataservClient() {
    logger.append('Installing dataserv-client...');
    exec(dsinstall, function(err, stdout) {
      if (err) {
        return self.emit('error', err);
      }

      logger.append(stdout);
      self.emit('end');
    });
  }
};

/**
 * Installs dataserv-client on macintosh systems
 * #_installMacintosh
 */
DataServInstaller.prototype._installMacintosh = function() {
  var self = this;
  var path = this.getDataServClientPath();

  this._downloadAndExtract(path, function() {
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
  var path = this.getDataServClientPath();

  this._downloadAndExtract(path, function() {
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
    if (err) {
      return callback(err);
    }

    if (stderr) {
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
 * Check if python-pip is installed on gnu+linux
 * #_checkPythonPipGnuLinux
 * @param {Function} callback
 */
DataServInstaller.prototype._checkPythonPipGnuLinux = function(callback) {
  exec('which pip', function(err, stdout, stderr) {
    if (err) {
      return callback(err);
    }

    if (stderr) {
      return callback(null, false);
    }

    callback(null, true);
  });
};

/**
 * Fetches the download URL for dataserv-client
 * #_getDownloadURL
 * @param {Function} callback
 */
DataServInstaller.prototype._getDownloadURL = function(callback) {
  var platform = (this._platform === 'darwin') ? 'osx32' : platform;
  var options = {
    url: window.env.dataservClientURL,
    headers: { 'User-Agent': 'Storj' },
    json: true
  };

  logger.append('Resolving download URL for dataserv-client...');

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
  var length = 0;

  download.on('error', function(err) {
    self.emit('error', err);
  });

  download.on('response', function() {
    length = parseInt(download.headers['content-length'], 10);
  });

  download.on('data', function(data) {
    position += data.length;

    if (length !== 0) {
      var percent = (100.0 * position / length).toFixed(2);
      self.emit('status', 'Downloading ' + '(' + percent + '%)');
    } else {
      var amount = (position / 1048576).toFixed(2);
      self.emit('status', 'Downloading ' + '(' + amount + 'mb)');
    }
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
  var writeStream = fs.createWriteStream(this._destination);

  writeStream.on('finish', function() {
    logger.append('Download complete, installing...');

    writeStream.close(function() {
      var zipfile = new ZipFile(self._destination);

      zipfile.extractAllTo(self._userdir, true);
      fs.remove(self._userdir + '/tmp');
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
