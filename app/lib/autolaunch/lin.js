/**
 * @module storjshare/autolaunch/lin
 */

'use strict';

const fs = require('fs');
const mkdirp = require('mkdirp');
const untildify = require('untildify');
const configDir = untildify('~/.config/autostart/');
const {existsSync} = require('storjshare-daemon').utils;
const path = require('path');

module.exports.enable = function(opts) {
  const file = path.join(configDir, opts.appName + '.desktop');
  const data = [
    '[Desktop Entry]',
    'Type=Application',
    'Vestion=1.0',
    `Name=${opts.appName}`,
    `Comment=${opts.appName} startup script`,
    `Exec=${opts.appPath}`,
    'StartupNotify=false',
    'Terminal=false'
  ].join('\n');

  return new Promise((resolve, reject) => {
    mkdirp.sync(configDir);
    fs.writeFile(file, data, (err, data) => {
      if (err) {
        return reject(err);
      }

      return resolve(data);
    });
  });
};

module.exports.disable = function(opts) {
  const file = path.join(configDir, opts.appName + '.desktop');

  return new Promise((resolve) => {
    if (existsSync(file)) {
      fs.unlinkSync(file);
      resolve();
    }
  });
};

module.exports.isEnabled = function(opts) {
  const file = path.join(configDir, opts.appName + '.desktop');

  return new Promise((resolve) => resolve(existsSync(file)));
};
