/**
 * @module storjshare/app
 */

'use strict';
const {homedir} = require('os');
const VueRouter = require('vue-router');
const router = new VueRouter(require('./routes'));

module.exports = {
  router,
  el: '#app',
  data: window.Store.shareList,
  components: {
    'updater': require('./views/updater'),
    'about': require('./views/about')
  },
  created: function() {
    this.actions.load((err) => {
      this.actions.status(() => {
        if(this.shares.length === 0) {
          router.replace('share-wizard');
        } else {
          router.replace('overview');
        }
      });
    });
  }
};
