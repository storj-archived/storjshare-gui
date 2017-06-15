'use strict';

module.exports = {
  data: function() {
    return window.Store.newShare;
  },
  components: {
    'ext-a' : require('../components/external-anchor')
  },
  created: function() {
    this.actions.reset();
  },
  mixins: [{
    methods: {
      //Checks a string to determine whether it is a valid Ethereum address
      //This is fairly easy, because Ethereum address have no checksum
      //All we have to check is that it starts with "0x" and 20 bytes (40 hex digits) follow
      checkEthereumAddress: function(teststring){
        if(typeof teststring != 'string') {
          return false;
        }
        if(teststring.length !== 42) {
          return false;
        }
        if(teststring.substring(0,2) !== '0x') {
          return false;
        }
        //Check to make sure the string is valid hex
        let hex = '0123456789abcdef';
        let lowercase = teststring.toLowerCase().substring(2,42);
        for(let i = 0; i < lowercase.length; i++) {
          if(hex.indexOf(lowercase.substring(i,i+1)) < 0) {
            return false;
          }
        }
        //All clear
        return true;
      }
    }
  }],
  template: `
<section>
  <div class="container">
    <div class="row wizard-nav">
      <div class="col-6">
        <span v-if="!$route.query.edit"><router-link :to="{path: '/share-wizard'}"><small>&lt; Go Back</small></router-link></span>
        <span v-if="$route.query.edit"><router-link :to="{path: '/overview'}"><small>&lt; Go Back</small></router-link></span>
      </div>
      <div class="col-6 text-right">
        <small>Step 1 of 3</small>
      </div>
    </div>
    <div class="row">
      <div class="col-12">
        <img src="imgs/logo.svg" alt="Storj Share" class="logo">
      </div>
    </div>
    <div class="row text-center">
      <div class="col-12">
        <h2>Step 1 - Payout Address</h2>
        <p>To receive your SJCX earnings, you need a <br class="hidden-sm-down">valid bitcoin address generated in <ext-a href="https://counterwallet.io/" target="_blank">Counterwallet</ext-a>.</p>
      </div>
    </div>
    <div class="row text-center mb-4 mt-3">
      <div class="col-12">
        <input v-model="config.paymentAddress" type="text" class="address" placeholder="0xETHEREUM_ADDRESS_HERE">
        <router-link :to="{path: '/share-wizard/wizard2'}" class="btn" :disabled="!checkEthereumAddress(config.paymentAddress)">Next</router-link>
      </div>
    </div>
    <div class="row text-center">
      <div class="col-12">
        <small><ext-a href="https://storj.io/share.html#faq-1-3">How to create a wallet?</ext-a> &middot; <ext-a href="https://storj.io/share.html#faq-1-4">Where do I find the address?</ext-a></small>
      </div>
    </div>
  </div>
</section>
  `
};
