'use strict';

const assert = require('assert');
const merge = require('merge');
const {EventEmitter} = require('events');

class UserData extends EventEmitter {

  constructor() {
    super();
    this._parsed = this._read();
    this._sync();
  }

  /**
   * Loads the userdata from storage
   */
  _read() {
    return merge.recursive({}, UserData.DEFAULTS, JSON.parse(
      window.localStorage.getItem(UserData.STORAGE_KEY)
    ));
  }

  /**
   * Persists the state to storage
   */
  _sync() {
    return window.localStorage.setItem(
      UserData.STORAGE_KEY,
      JSON.stringify(this._parsed)
    );
  }

  /**
   * Returns a proxy object for auto updating config
   */
  toObject() {
    return {
      appSettings: new Proxy(this._parsed.appSettings, {
        get: (target, name) => {
          if (typeof UserData.DEFAULTS.appSettings[name] === 'undefined') {
            return undefined;
          }
          return target[name];
        },
        set: (target, property, value) => {
          if (typeof UserData.DEFAULTS.appSettings[property] === 'undefined') {
            return undefined;
          }
          target[property] = value;
          this._sync();
          this.emit('settingsUpdated', this._parsed);
          return value;
        }
      })
    };
  }

}

UserData.STORAGE_KEY = '__USER_DATA';
UserData.DEFAULTS = {
  appSettings: {
    launchOnBoot: false,
    runDrivesOnBoot: true,
    reportTelemetry: true,
    silentMode: false
  }
};

module.exports = new UserData();
