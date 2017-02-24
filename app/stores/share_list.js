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

class ShareList {
  constructor(rpc) {
    this.rpc = rpc;
    this.shares = [];
    this.errors = [];
    this.pollInterval = 10000;
    this.actions = {};

    this.actions.status = (callback) => {
      this.rpc.status((err, shares) => {
        this.error = err;
        this.shares = shares.map(_mapStatus);
        return callback(err, shares);
      });
    };

    this.actions.load = (path, callback) => {
      this.rpc.load(path, (err)=> {
        this.errors.push(err);
        return callback(err);
      });
    };

    this.actions.poll = () => {
      let timer;
      return {
        start: (interval) => {
          this.pollInterval = interval || this.pollInterval;
          timer = setInterval(this.status, this.pollInterval);
        },
        stop: () => {
          clearInterval(timer);
        }
      };
    };
    /**
     * Takes the current state of a share's configuration and writes it to the
     * configuration path for the share to persist it
     * @param {Number} shareIndex
     */
    this.actions.updateShareConfig = (shareIndex) => {
      if (!this.shares[shareIndex]) {
        return this.errors.push(new Error('Cannot update configuration for invalid share'));
      }

      let configPath = this.shares[shareIndex].path;
      let configBuffer = Buffer.from(
        JSON.stringify(this.shares[shareIndex].config, null, 2)
      );

      try {
        storjshare.utils.validate(this.shares[shareIndex].config);
        fs.writeFileSync(configPath, configBuffer);
      } catch (err) {
        return this.errors.push(err);
      }
    };
    /**
     * Updates the snapshot file with the current list of shares, this should
     * be called anytime a share is added or removed
     */
    this.actions.saveCurrentSnapshot = (path) => {
      this.rpc.save(path, (err) => {
        if (err) {
          return this.errors.push(err);
        }
      });
    };
    /**
     * Imports a share from the supplied configuration file path
     * @param {String} configPath
     */
    this.actions.importShareConfig = (configPath) => {
      this.rpc.start(configPath, (err) => {
        if (err) {
          return this.errors.push(err);
        }

        this.saveCurrentSnapshot();
      });
    };
    /**
     * Starts/Restarts the share with the given index
     * @param {Number} shareIndex
     */
    this.actions.startShare = (shareIndex) => {
      if (!this.shares[shareIndex]) {
        return this.errors.push(new Error('Cannot restart share'));
      }

      this.rpc.restart(this.shares[shareIndex].id, (err) => {
        if (err) {
          return this.errors.push(err);
        }
      });
    };
    /**
     * Stops the running share at the given index
     * @param {Number} shareIndex
     */
    this.actions.stopShare = (shareIndex) => {
      if (!this.shares[shareIndex]) {
        return this.errors.push(new Error('Cannot stop share'));
      }

      this.rpc.stop(this.shares[shareIndex].id, (err) => {
        if (err) {
          return this.errors.push(err);
        }
      });
    };
    /**
     * Removes the share at the given index from the snapshot
     * @param {Number} shareIndex
     */
    this.actions.removeShareConfig = (shareIndex) => {
      if (!this.shares[shareIndex]) {
        return this.errors.push(new Error('Cannot remove share'));
      }

      this.rpc.destroy(this.shares[shareIndex].id, (err) => {
        if (err) {
          return this.errors.push(err);
        }

        this.saveCurrentSnapshot();
      });
    };

    this.actions.clearErrors = () => {
      this.errors = [];
    };
  }
}

  /**
   * Takes a single share status object and returns a view model's version of
   * the share status - this method is automatically applied in the status
   * polling results.
   * @private
   * @param {Object} shareStatus
   */
function _mapStatus(share) {
  share.isErrored = share.state === 2;
  share.isRunning = share.state === 1;
  share.isStopped = share.state === 0;
  share.meta.uptimeReadable = prettyms(share.meta.uptimeMs);

  return share;
}


module.exports = ShareList;
