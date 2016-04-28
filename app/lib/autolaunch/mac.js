'use strict';

var assert = require('assert');
var applescript = require('applescript');
var tellTo = 'tell application "System Events" to ';

// AppleScript doesn't use valid JSON, instead, property names are not quoted
function toAppleJSON(opts) {
  assert.ok(opts.appPath, 'Invalid `appPath`');
  assert.ok(opts.appName, 'Invalid `appName`');

  var props = {
    path: opts.appPath.split('/Contents/MacOS/StorjShare')[0],
    hidden: opts.isHiddenOnLaunch,
    name: opts.appName
  };

  return ('{name:"{%name%}",path:"{%path%}",hidden:{%hidden%}}')
         .replace('{%name%}', props.name)
         .replace('{%path%}', props.path)
         .replace('{%hidden%}', props.hidden);
}

module.exports = {
  enable: function(opts) {
    var props = toAppleJSON(opts);

    var command = tellTo + 'make login item at end with properties ' + props;

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
        if (err || !loginItems) {
          return reject(err);
        }
        return resolve(loginItems.indexOf(opts.appName) > -1);
      });
    });

    return promise;
  }
};
