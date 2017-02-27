/**
 * @module storjshare/store
 */

'use strict';
const fs = require('fs');
const path = require('path');
const {homedir} = require('os');
const prettyms = require('pretty-ms');
const storjshare = require('storjshare-daemon');
const storj = require('storj-lib');

const rpc = window.daemonRpc;

class Share {
  constructor() {
    this.errors = [];
    this.actions = {};
    this.config = {};
    this.storageAvailable = 0;

/**
 * Creates a new Share
 */
    this.actions.createShareConfig = () => {
      this.config.networkPrivateKey = storj.KeyPair().getPrivateKey();
      let nodeID = storj.KeyPair(this.config.networkPrivateKey).getNodeID();

      let sharePath = path.join(
        homedir(),
        '.config/storjshare/shares',
        nodeID
      );

      let logPath = path.join(
        homedir(),
        '.config/storjshare/logs',
        nodeID + '.log'
      );

      let configPath = path.join(
        homedir(),
        '.config/storjshare/configs',
        nodeID + '.json'
      );

      this.config.loggerOutputFile = path.normalize(logPath);
      //maybe create this as a default share dir?
      //this.config.storagePath = path.normalize(sharePath);
      let configBuffer = Buffer.from(
        JSON.stringify(this.config, null, 2)
      );

      try {
        storjshare.utils.validate(this.config);
        fs.writeFileSync(configPath, configBuffer);
        //fs.mkdirSync(sharePath);
      } catch (err) {
        this.errors.push(err);
        return false;
      }

      this.config = {};
      return true;
    };

    this.actions.clearErrors = () => {
      this.errors = [];
    };

    this.actions.getFreeDiskSpace = (path, callback) => {
      storjshare.utils.getFreeSpace(path, (err, free) => {
        if(err) {
          errors.push(err);
          return callback(err);
        }
        this.storageAvailable = free;
        return callback(null, free);
      });
    };
  }
}

module.exports = Share;
