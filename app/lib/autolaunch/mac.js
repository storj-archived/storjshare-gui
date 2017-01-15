'use strict';

const assert = require('assert');
const applescript = require('applescript');
const tellTo = 'tell application "System Events" to ';

// NB: AppleScript doesn't use valid JSON
// NB: instead, property names are not quoted
function toAppleJSON(opts) {
  assert.ok(opts.appPath, 'Invalid `appPath`');
  assert.ok(opts.appName, 'Invalid `appName`');

  var props = {
    path: opts.appPath.split('/Contents/MacOS/StorjShare')[0],
    hidden: opts.isHiddenOnLaunch,
    name: opts.appName
  };

  return `{name:"${props.name}",path:"${props.path}",hidden:${props.hidden}}`;
}

module.exports.enable = function(opts) {
  const props = toAppleJSON(opts);
  const command = `${tellTo} make login item at end with properties ${props}`;

  return new Promise((resolve, reject) => {
    applescript.execString(command, (err, resp) => {
      if (err) {
        return reject(err);
      }

      resolve(resp);
    });
  });
};

module.exports.disable = function(opts) {
  const command = `${tellTo} delete login item "${opts.appName}"`;

  return new Promise((resolve, reject) => {
    applescript.execString(command, (err, resp) => {
      if (err) {
        return reject(err);
      }

      resolve(resp);
    });
  });
};

module.exports.isEnabled = function(opts) {
  const command = `${tellTo} get the name of every login item`;

  return new Promise(function(resolve, reject) {
    applescript.execString(command, (err, loginItems) => {
      if (err || !loginItems) {
        return reject(err);
      }

      resolve(loginItems.indexOf(opts.appName) > -1);
    });
  });
};
