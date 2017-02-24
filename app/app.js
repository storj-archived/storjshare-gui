/**
 * @module storjshare/app
 */

'use strict';
const {homedir} = require('os');
const path = require('path');
const SNAPSHOT_PATH = path.join(homedir(), '.config/storjshare/gui.snapshot');
const VueRouter = require('vue-router');
const router = new VueRouter(require('./routes'));

module.exports = {
  router,
  el: '#app',
  data: window.Store.shareList,
  created: function() {
    this.actions.load(SNAPSHOT_PATH, (err) => {
      this.actions.status(() => {
        if(this.shares.length === 0) {
          router.replace('share-wizard');
        }
      });
      this.actions.poll().start(this.pollInterval);
    });
  },
  destroyed: function() {
    this.actions.poll().stop();
  }
};
