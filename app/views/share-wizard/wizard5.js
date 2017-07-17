'use strict';

module.exports = {
  data: function() {
    return {
      newShare: window.Store.newShare,
      shareList: window.Store.shareList,
      uiState: {
        isCreating: false
      }
    };
  },
  components: {
    'ext-a' : require('../components/external-anchor')
  },
  created: function() {
    //If the user has doNotTraverseNat set to false, skip this page to keep things simple
    if(!this.newShare.config.doNotTraverseNat) {
      return this.saveToDisk();
    }
    //If the user already has a share, start out their address to be the one
    //they're currently using
    let numShares = this.shareList.shares.length;
    if(numShares > 0) {
      this.newShare.config.rpcAddress = this.shareList.shares[numShares - 1].config.rpcAddress;
    }
  },
  methods: {
    saveToDisk: function() {
      this.uiState.isCreating = true;
      let configPath = this.newShare.actions.createShareConfig();
      if(configPath) {
        this.shareList.actions.import(configPath, (err) => {
          this.uiState.isCreating = false;
          if(!err) {
            return this.$router.push({ path: '/share-wizard/wizard6' });
          }
        });
      }
    },
    validAddress: function() {
      return this.newShare.config.rpcAddress && this.newShare.config.rpcAddress.length !== 0;
    }
  },
  template: `
<section>
  <div class="container">
    <div class="row wizard-nav">
      <div class="col-6">
        <router-link :to="{path: '/share-wizard/wizard4'}"><small>&lt; Go Back</small></router-link>
      </div>
      <div class="col-6 text-right">
        <small>Step 5 of 5</small>
      </div>
    </div>
    <div class="row">
      <div class="col-12">
        <img src="imgs/logo.svg" alt="Storj Share" class="logo">
      </div>
    </div>
    <div class="row text-center">
      <div class="col-12">
        <h2>Step 5 - Host Address</h2>
        <p>Please enter your external public IP address or a valid hostname so that other nodes will be able to connect to you. It is recommended to use a hostname service like <ext-a href="https://www.noip.com/">No-IP</ext-a> if your external public IP address is not static.</p>
        <p>If you don't know what your external public IP address is, use a site like <ext-a href="https://www.whatismyip.com/">whatismyip.com</ext-a>.</p>
      </div>
    </div>
    <div class="row text-center mb-4 mt-3">
      <div class="col-12">
        <input v-model="newShare.config.rpcAddress" type="text" placeholder="127.0.0.1">
        <button v-on:click="saveToDisk()" class="btn" :disabled="!validAddress()">Next</button>
        <img v-if="uiState.isCreating" class="loader"></img>
      </div>
    </div>
  </div>
</section>
  `
};
