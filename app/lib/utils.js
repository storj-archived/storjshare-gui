'use strict';

var du = require('du');
var fs = require('fs');
var kfs = require('kfs');
var diskspace = require('fd-diskspace').diskSpace;
var path = require('path');

/**
 * Recursively determines the size of a directory
 * @param {String} dir - Directory to traverse
 * @param {Function} callback
 */
module.exports.getDirectorySize = function(dir, callback) {
  du(dir, function (err, size) {
    callback(err,size);
  });
};

/**
 * Converts to a reasonable unit of bytes
 * @param {Object} bytes
 * @param {Number} precision
 */
module.exports.autoConvert = function(object, precision) {
  var kilobyte = 1000;
  var megabyte = kilobyte * 1000;
  var gigabyte = megabyte * 1000;
  var terabyte = gigabyte * 1000;

  var byteobject = (this.manualConvert(object, 'B'));
  var bytes = byteobject.size;

  if ((bytes >= kilobyte) && (bytes < megabyte)) {
    return this.manualConvert(byteobject, 'KB', (precision || 1));
  } else if ((bytes >= megabyte) && (bytes < gigabyte)) {
    return this.manualConvert(byteobject, 'MB', (precision || 2));
  } else if ((bytes >= gigabyte) && (bytes < terabyte)) {
    return this.manualConvert(byteobject, 'GB', (precision || 3));
  } else if (bytes >= terabyte) {
    return this.manualConvert(byteobject, 'TB', (precision || 4));
  }

  return byteobject;

};

/**
 * Converts units of bytes to other units
 * @param {Object} object to be converted
 * @param {String} Unit Object will be converted to
 */
module.exports.manualConvert = function(object, unit, precision) {
  var table = {
    'B': 0,
    'KB': 1,
    'MB': 2,
    'GB': 3,
    'TB': 4
  };

  precision = (!precision) ? (table[unit] ? table[unit] : 6) : precision;

  var diff = table[object.unit] - table[unit];

  if (diff < 0) {
    return {
      size: (object.size / Math.pow(1000, Math.abs(diff))).toFixed(precision),
      unit: unit
    };
  } else if (diff > 0) {
    return {
      size: (object.size * Math.pow(1000, Math.abs(diff))).toFixed(precision),
      unit: unit
    };
  } else {
    return object;
  }
};

/**
 * find the difference between two file sizes
 * @param {Object} object
 * @param {Object} object
 */
module.exports.subtract = function(object1, object2) {
  var bytes1 = this.manualConvert(object1, 'B');
  var bytes2 = this.manualConvert(object2, 'B');

  var difference = bytes1.size - bytes2.size;

  return this.autoConvert({size: difference, unit: 'B'});
};

/**
 * get free space on disk of path
 * @param {String} path
 */
module.exports.getFreeSpace = function(path, callback) {
  diskspace(function(err, result) {
    if (err) {
      return callback(err);
    }

    var free = 0;

    for (var disk in result.disks) {
      if (path.indexOf(disk) !== -1) {
        // The `df` command on linux returns KB by default, so we need to
        // convert to bytes.
        free = process.platform === 'win32' ?
               result.disks[disk].free :
               result.disks[disk].free * 1000;
      }
    }

    return callback(null, free);
  });
};

/**
 * get used space for a tab
 * @param {Object} tab
 */
module.exports.getUsedSpace = function(tab, callback) {
  var db = kfs(path.join(tab.storage.path, '/sharddata.kfs'));
  var totalBytesUsed = 0;

  db.stat(function(err, results) {
    if (err) {
      callback(err);
    }

    results.forEach(function(result) {
      if (result) {
        totalBytesUsed += result.sBucketStats.size;
      }
    });
  });

  callback(null, this.autoConvert({ size: totalBytesUsed, unit: 'B' }, 16));
};

/**
 * Check if file exists
 * @param {String} file - Path to file
 */
module.exports.existsSync = function(file) {
  try {
    fs.statSync(file);
  } catch(err) {
    return !(err);
  }

  return true;
};
