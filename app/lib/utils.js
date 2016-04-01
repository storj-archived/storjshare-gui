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
