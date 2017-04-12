'use strict';

module.exports = {
  data: function() {
    return {
      newShare: window.Store.newShare,
      shareList: window.Store.shareList,
      MAXPORTNUM: 65536,
      MINPORTNUM: 1023
    };
  },
  components: {
    'numeric-input': require('../numeric-input')
  },
  methods: {
    chooseRandomPort: function() {
      this.$set(this.newShare.config, 'rpcPort', this.getRandomValidPort());
    },
    getRandomValidPort: function() {
      return Math.floor(Math.random() * (this.MAXPORTNUM - this.MINPORTNUM)) + this.MINPORTNUM;
    },
    saveToDisk: function() {
      let configPath = this.newShare.actions.createShareConfig();
      if(configPath) {
        this.shareList.actions.import(configPath, (err) => {
          if(!err) {
            return this.$router.push({ path: '/share-wizard/wizard5' });
          }
        });
      }
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
        <small>Step 4 of 4</small>
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
        <button v-on:click="chooseRandomPort" class="btn btn-secondary mr-3">Random</button>
        <button v-on:click="saveToDisk" class="btn">Next</button>
      </div>
    </div>
  </div>
</section>
  `
};
