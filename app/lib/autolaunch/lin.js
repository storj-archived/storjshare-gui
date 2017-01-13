/**
 * @module storjshare/autolaunch/lin
 */

'use strict';

const fs = require('fs');
const mkdirp = require('mkdirp');
const untildify = require('untildify');
const configDir = untildify('~/.config/autostart/');
const {existsSync} = require('storjshare-daemon').utils;

module.exports = {
  enable: function(opts) {
    var file = configDir + opts.appName + '.desktop';

    var data = [
      '[Desktop Entry]',
      'Type=Application',
      'Vestion=1.0',
      'Name='+opts.appName,
      'Comment=' + opts.appName + ' startup script',
      'Exec=' + opts.appPath,
      'StartupNotify=false',
      'Terminal=false'
    ].join('\n');

    var promise = new Promise(function(resolve, reject) {
      mkdirp.sync(configDir);

      fs.writeFile(file, data, function(err, data) {
        if(err) {
          return reject(err);
        }
        return resolve(data);

      });
    });

    return promise;
  },
  disable: function(opts) {
    var file = configDir + opts.appName + '.desktop';
    var promise = new Promise(function(resolve) {
      if(existsSync(file)) {
        fs.unlinkSync(file);
        return resolve();
      }
    });
    return promise;
  },
  isEnabled: function(opts) {
    var file = configDir + opts.appName + '.desktop';
    var promise = new Promise(function(resolve) {
      if(existsSync(file)) {
        return resolve(true);
      }
      else {
        return resolve(false);
      }
    });
    return promise;
  }
};
