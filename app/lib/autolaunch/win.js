'use strict';

const WinReg = require('winreg');
const registry = new WinReg({
  hive: WinReg.HKCU,
  key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'
});

module.exports.enable = function(opts) {
  return new Promise((resolve, reject) => {
    registry.set(opts.appName, WinReg.REG_SZ, `"${opts.appPath}"`,
      (err, resp) => {
        if (err) {
          return reject(err);
        }

        resolve(resp);
      }
    );
  });
};

module.exports.disable = function(opts) {
  return new Promise((resolve, reject) => {
    registry.remove(opts.appName, (err, resp) => {
      if (err) {
        return reject(err);
      }

      resolve(resp);
    });
  });
};

module.exports.isEnabled = function(opts) {
  return new Promise((resolve, reject) => {
    registry.get(opts.appName, function(err, resp) {
      if (err) {
        return reject(err);
      }

      resolve(!!resp);
    });
  });
};
