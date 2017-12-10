'use strict';

module.exports = {
  data: function() {
    return {
      newShare: window.Store.newShare,
      shareList: window.Store.shareList,
      MAXPORTNUM: 65536,
      MINPORTNUM: 1024,
      uiState: {
        isChecking: false
      },
      invalidPort: {
        port: -1,
        message: ''
      },
      continueButtonText: 'Next'
    };
  },
  components: {
    'numeric-input': require('../components/numeric-input')
  },
  created: function() {
    //If the user already has a share, start out their port number as the one after
    //the one their last share is using
    let numShares = this.shareList.shares.length;
    if(numShares > 0) {
      this.newShare.config.rpcPort = this.shareList.shares[numShares - 1].config.rpcPort + 1;
    }
  },
  methods: {
    chooseRandomPort: function() {
      this.$set(this.newShare.config, 'rpcPort', this.getRandomValidPort());
    },
    getRandomValidPort: function() {
      return Math.floor(Math.random() * (this.MAXPORTNUM - this.MINPORTNUM)) + this.MINPORTNUM;
    },
    portIsAvailable: function(port, callback) {
      const utils = require('storjshare-daemon').utils;
      return utils.portIsAvailable(port, callback);
    },
    checkPort: function() {
      this.continueButtonText = 'Checking...';
      this.uiState.isChecking = true;
      let self = this;
      this.portIsAvailable(this.newShare.config.rpcPort, function(err, result) {
        if(err || !result) {
          self.invalidPort.port = self.newShare.config.rpcPort;
          self.invalidPort.message = err || `Port ${self.invalidPort.port} appears to be in use`;
          self.uiState.isChecking = false;
          self.continueButtonText = 'Next';
        } else {
          self.uiState.isChecking = false;
          return self.$router.push({ path: '/share-wizard/wizard5' });
        }
      });
    }
  },
  template: `
<section>
  <div class="container">
    <div class="row wizard-nav">
      <div class="col-6">
        <router-link :to="{path: '/share-wizard/wizard3'}"><small>&lt; Go Back</small></router-link>
      </div>
      <div class="col-6 text-right">
        <small>Step 4 of 5</small>
      </div>
    </div>
    <div class="row">
      <div class="col-12">
        <img src="imgs/logo.svg" alt="Storj Share" class="logo">
      </div>
    </div>
    <div class="row text-center">
      <div class="col-12">
        <h2>Step 4 - Connection Settings</h2>
        <p>Port to bind for RPC server, make sure this is forwarded if behind <br class="hidden-sm-down">a NAT or firewall - otherwise Storj Share will try to punch out.</p>
      </div>
    </div>
    <div class="row text-center mt-3">
      <div class="col-12">
        <label for="portNumber">Port Number</label>
        <numeric-input v-model.number="newShare.config.rpcPort"
          v-bind:max="MAXPORTNUM"
          v-bind:min="MINPORTNUM"
          id="portNumber"
          class="port-number text-center">
        </numeric-input>
        <label for="doNotTraverseNat">Reachable</label>
        <input v-b-tooltip title="This checkbox disables NAT traversal. Only check if you have port forwarded or are otherwise reachable from the Internet" type="checkbox" v-model="newShare.config.doNotTraverseNat">
        <button v-on:click="chooseRandomPort" class="btn btn-secondary mr-3">Random</button>
        <button v-on:click="checkPort" class="btn" v-bind:disabled="uiState.isChecking">{{invalidPort.port === newShare.config.rpcPort ? 'Continue Anyways' : continueButtonText}}</button>
      </div>
    </div>
    <div class="row text-center">
      <div class="col-12">
        <p class="error-text">{{invalidPort.message}}</p>
      </div>
    </div>
  </div>
</section>
  `
};
