/**
 * @module storjshare/views/overview
 */

const fs = require('fs');
const prettyms = require('pretty-ms');
const {homedir} = require('os');
const path = require('path');
const storjshare = require('storjshare-daemon');
const {ViewEvents, daemonRpc: rpc} = window;

const STATUS_POLL_INTERVAL = 10000;
const SNAPSHOT_PATH = path.join(homedir(), '.config/storjshare/gui.snapshot');

module.exports = {
  el: '#overview',
  data: {
    shares: []
  },
  methods: {
    /**
     * Takes a single share status object and returns a view model's version of
     * the share status - this method is automatically applied in the status
     * polling results.
     * @private
     * @param {Object} shareStatus
     */
    _mapStatus: function(share) {
      share.isErrored = share.state === 2;
      share.isRunning = share.state === 1;
      share.isStopped = share.state === 0;
      share.meta.uptimeReadable = prettyms(share.meta.uptimeMs);

      return share;
    },
    /**
     * Takes the current state of a share's configuration and writes it to the
     * configuration path for the share to persist it
     * @param {Number} shareIndex
     */
    saveShareConfig: function(shareIndex) {
      if (!this.shares[index]) {
        return ViewEvents.emit(
          'error',
          new Error('Cannot update configuration for invalid share')
        );
      }

      let configPath = this.shares[shareIndex].path;
      let configBuffer = Buffer.from(
        JSON.stringify(this.shares[shareIndex].config, null, 2)
      );

      try {
        storjshare.utils.validate(this.shares[shareIndex].config);
        fs.writeFileSync(configPath, configBuffer);
      } catch (err) {
        ViewEvents.emit('error', err);
      }
    },
    /**
     * Updates the snapshot file with the current list of shares, this should
     * be called anytime a share is added or removed
     */
    saveCurrentSnapshot: function() {
      rpc.save(SNAPSHOT_PATH, (err) => {
        if (err) {
          return ViewEvents.emit('error', err);
        }
      });
    },
    /**
     * Imports a share from the supplied configuration file path
     * @param {String} configPath
     */
    importShareConfig: function(configPath) {
      rpc.start(configPath, (err) => {
        if (err) {
          return ViewEvents.emit('error', err);
        }

        this.saveCurrentSnapshot();
      });
    },
    /**
     * Starts/Restarts the share with the given index
     * @param {Number} shareIndex
     */
    startShare: function(shareIndex) {
      if (!this.shares[shareIndex]) {
        return ViewEvents.emit('error', new Error('Cannot restart share'));
      }

      rpc.restart(this.shares[shareIndex].id, (err) => {
        if (err) {
          return ViewEvents.emit('error', err);
        }
      });
    },
    /**
     * Stops the running share at the given index
     * @param {Number} shareIndex
     */
    stopShare: function(shareIndex) {
      if (!this.shares[shareIndex]) {
        return ViewEvents.emit('error', new Error('Cannot stop share'));
      }

      rpc.stop(this.shares[shareIndex].id, (err) => {
        if (err) {
          return ViewEvents.emit('error', err);
        }
      });
    },
    /**
     * Removes the share at the given index from the snapshot
     * @param {Number} shareIndex
     */
    removeShareConfig: function(shareIndex) {
      if (!this.shares[shareIndex]) {
        return ViewEvents.emit('error', new Error('Cannot remove share'));
      }

      rpc.destroy(this.shares[shareIndex].id, (err) => {
        if (err) {
          return ViewEvents.emit('error', err);
        }

        this.saveCurrentSnapshot();
      });
    }
  },
  /**
   * Lifecycle hook: executed when the view is created and initialized
   */
  created: function() {
    const self = this;

    function pollForShares() {
      rpc.status((err, shares) => self.shares = shares.map(self._mapStatus));
    }

    function maybeResurrectSnapshot(callback) {
      rpc.load(SNAPSHOT_PATH, () => callback());
    }

    maybeResurrectSnapshot(() => pollForShares());
    setInterval(pollForShares, STATUS_POLL_INTERVAL);
  }
};
