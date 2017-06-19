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
    'about': require('./views/about'),
    'terms': require('./views/terms')
  },
  created: function() {
    this.actions.load((err) => {
      this.actions.status(() => {
        //Check to see if any of the shares aren't using Ethereum addresses
        let usingBitcoinAddress = false;
        let checkEthereumAddress = require('./lib/eth-address-check.js');
        this.shares.forEach((share) => {
          if(!checkEthereumAddress(share.config.paymentAddress)){
            usingBitcoinAddress = true;
          }
        });
        if(this.shares.length === 0) {
          router.replace('share-wizard');
        } else if(usingBitcoinAddress) {
          router.replace('migration');
        } else {
          router.replace('overview');
        }
      });
    });
  }
};
