/**
 * @module driveshare-gui/diskspace
 */

// DISCLAIMER:
//
// THIS MODULE IS A HACK THAT ALLOWS THE `DISKSPACE` NODE MODULE TO EXECUTE THE
// BUNDLED DRIVESPACE.EXE FILE FROM ELECTRON BY COPYING IT TO APPDATA AND
// CALLING IT DIRECTLY.
//
// THIS IS ALMOST CERTAINLY NOT THE BEST WAY TO HANDLE THIS ISSUE, PLEASE TAKE
// CARE TO FIX ME LATER.

'use strict';

var remote = require('remote');
var app = remote.require('app');
var fs = require('fs');
var os = require('os');
var path = require('path');
var exec = require('child_process').exec;
var diskspace = require('diskspace');
var userdata = app.getPath('userData');

/**
 * If Windows, then return a wrapper function that moves the drivespace.exe
 * to a path where it is executable and then re-implement the diskspace.js
 * logic. o.O
 *
 * Please fix me one day.
 */
module.exports = os.platform() !== 'win32' ? diskspace : {
  check: function(drive, callback) {
    // Check if we have copied the drivespace.exe file to userdata before
    if (!fs.existsSync(userdata + '\\diskspace.exe')) {

      // Resolve the relative path to the executable
      var diskspaceExePath = path.resolve(
        __dirname,
        '../node_modules/diskspace/drivespace.exe'
      );

      // Prepare to copy executable
      var readStream = fs.createReadStream(diskspaceExePath);
      var writeStream = fs.createWriteStream(userdata + '\\diskspace.exe');

      // Copy the file then call check()
      return readStream.pipe(writeStream).on('end', function() {
        check(drive, callback);
      });
    }

    check(drive, callback);

    function check(drive, callback) {
      var exepath = userdata + '\\diskspace.exe';
      var disk_info, total, free, status;

      if (drive.length <= 3) {
        drive = drive.charAt(0);
      }

      exec(exepath + ' drive-' + drive, function(err, stdout) {
        if (err) {
          status = 'STDERR';
        } else {
          disk_info = stdout.trim().split(',');
          total = disk_info[0];
          free = disk_info[1];
          status = disk_info[2];

          if (status === 'NOTFOUND') {
            err = new Error('Drive not found');
          }
        }

        if (callback) {
          callback(err, total, free, status);
        }
      });
    }
  }
};
