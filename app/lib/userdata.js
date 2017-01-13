'use strict';

const assert = require('assert');
const merge = require('merge');

class UserData {

  constructor() {
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
      JSON.stringify(parsed)
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
          return value;
        }
      })
    };
  }

}

UserData.STORAGE_KEY = '__USER_DATA';
UserData.DEFAULTS = {
  appSettings: {
    minToTask: true,
    launchOnBoot: false,
    runDrivesOnBoot: true,
    reportTelemetry: true,
    silentMode: false,
    deleteOldLogs: true
  }
};

module.exports = new UserData();
