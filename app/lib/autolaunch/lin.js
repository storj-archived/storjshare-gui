'use strict';

var fs = require('fs');
var mkdirp = require('mkdirp');
var untildify = require('untildify');
var configDir = untildify('~/.config/autostart/');
var utils = require('./../utils');

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
      if(utils.existsSync(file)) {
        utils.unlinkSync(file);
        return resolve();
      }
    });
    return promise;
  },
  isEnabled: function(opts) {
    var file = configDir + opts.appName + '.desktop';
    var promise = new Promise(function(resolve) {
      if(utils.existsSync(file)) {
        return resolve(true);
      }
      else {
        return resolve(false);
      }
    });
    return promise;
  }
};
