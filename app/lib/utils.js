'use strict';

var fs = require('fs');
var path = require('path');
var async = require('async');

/**
 * Recursively determines the size of a directory
 * @param {String} dir - Directory to traverse
 * @param {Function} callback
 */
module.exports.getDirectorySize = function(dir, callback) {
  fs.stat(dir, function(err, stats) {
    if (err || !stats.isDirectory()) {
      return callback(err, 0);
    }

    var total = stats.size;

    function done(err) {
      callback(err, total);
    }

    fs.readdir(dir, function(err, list) {
      if (err) {
        return callback(err);
      }

      async.each(list, function(diritem, next) {
        var child = path.join(dir, diritem);

        module.exports.getDirectorySize(child, function(err, size) {
          total = total + size;
          next(err);
        });
      }, done);
    });
  });
};

/**
 * Converts bytes to human readable format
 * @param {Number} bytes
 * @param {Number} precision
 */
module.exports.bytesToSize = function(bytes, precision) {
  var kilobyte = 1024;
  var megabyte = kilobyte * 1024;
  var gigabyte = megabyte * 1024;
  var terabyte = gigabyte * 1024;
  var size = bytes;
  var unit = 'B'

  if ((bytes >= 0) && (bytes < kilobyte)) {
    return { size: size, unit: unit };
  } else if ((bytes >= kilobyte) && (bytes < megabyte)) {
    return { size: (bytes / kilobyte).toFixed(precision), unit: 'KB' };
  } else if ((bytes >= megabyte) && (bytes < gigabyte)) {
    return { size: (bytes / megabyte).toFixed(precision), unit: 'MB' };
  } else if ((bytes >= gigabyte) && (bytes < terabyte)) {
    return { size: (bytes / gigabyte).toFixed(precision), unit: 'GB' };
  } else if (bytes >= terabyte) {
    return { size: (bytes / terabyte).toFixed(precision), unit: 'TB' };
  } else {
    return { size: size, unit: unit };
  }

};
