'use strict';

const assert = require('assert');
const {app} = require('electron');
const win = require('./win');
const mac = require('./mac');
const lin = require('./lin');
const platformCheckFailed = new Error('OS-specific startup options not found');

/**
 * Cross-platform interface for Application Boot Options
 */
class AutoLaunch {

  constructor(optsObj) {
    assert(optsObj.name, 'Application name must be specified');
    this.opts = {
      appName: optsObj.name,
      isHiddenOnLaunch: !!optsObj.isHidden,
      appPath: (optsObj.path) ?
        optsObj.path :
        app.getPath('exe')
    };
    this.api = (/^win/.test(process.platform))    ? win :
               (/^darwin/.test(process.platform)) ? mac :
               (/^linux/.test(process.platform))  ? lin : null;
  }

  enable() {
    return new Promise((resolve, reject) => {
      if (!this.api) {
        return reject(platformCheckFailed);
      }

      this.api.enable(this.opts).then(resolve, reject);
    });
  }

  disable() {
    return new Promise((resolve, reject) => {
      if (!this.api) {
        return reject(platformCheckFailed);
      }

      this.api.disable(this.opts).then(resolve, reject);
    });
  }

  isEnabled() {
    return new Promise((resolve, reject) => {
      if (!this.api) {
        return reject(platformCheckFailed);
      }

      this.api.isEnabled(this.opts).then(resolve, reject);
    });
  }

}

module.exports = AutoLaunch;
