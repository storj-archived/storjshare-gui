'use strict';

var applescript = require('applescript');
var tellTo = 'tell application "System Events" to ';

module.exports = {
  enable: function(opts) {
    var props = {
      path: opts.appPath,
      hidden: opts.isHiddenOnLaunch,
      name: opts.appName
    };

    var command = tellTo +
      'make login item at end with properties ' +
       JSON.stringify(props);

    var promise = new Promise(function(resolve, reject) {
      applescript.execString(command, function(err, resp) {
        if(err) {
          return reject(err);
        }
        return resolve(resp);
      });
    });

    return promise;
  },

  disable: function(opts) {
    var command = tellTo +
      'delete login item \"' +
      opts.appName + '\"';

    var promise = new Promise(function(resolve, reject) {
      applescript.execString(command, function(err, resp) {
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
      var command = tellTo + 'get the name of every login item';

      applescript.execString(command, function(err, loginItems) {
        if(err) {
          return reject(err);
        }
        return resolve(loginItems.indexOf(opts.appName) > -1);
      });
    });

    return promise;
  }
};
