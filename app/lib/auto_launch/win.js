'use strict';

var Winreg = require('winreg');
var regKey = new Winreg({
  hive: Winreg.HKCU,
  key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'
});

module.exports = {
  enable: function(opts) {
    var promise = new Promise(function(resolve, reject) {
      regKey.set(opts.appName, Winreg.REG_SZ, '\"' + opts.appPath + '\"',
        function(err, resp) {
          if(err) {
            return reject(err);
          }
          return resolve(resp);
        }
      );
    });

    return promise;
  },

  disable: function(opts) {
    var promise = new Promise(function(resolve, reject) {
      regKey.remove(opts.appName, function(err, resp){
        if(err) {
          return reject(err);
        }
        return resolve(resp);
      });
    });

    return promise;
  },

  isEnabled: function(opts) {
    var promise = new Promise(function(resolve, reject) {
      regKey.get(opts.appName, function(err, resp) {
        if(err) {
          return reject(err);
        }
        return resolve(resp);
      });
    });

    return promise;
  }
};
