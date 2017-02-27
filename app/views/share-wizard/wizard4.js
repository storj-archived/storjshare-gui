'use strict';

module.exports = {
  data: function() {
    return window.Store.newShare;
  },
  methods: {
    saveToDisk: function() {
      let hasSaved = this.actions.createShareConfig();
      if(hasSaved) {
        return this.$router.push({ path: '/share-wizard/wizard5' });
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
        <input v-model="config.rpcPort" type="number" id="portNumber" placeholder="" class="port-number text-center">
        <a href="" class="btn btn-secondary mr-3">Random</a>
        <button v-on:click="saveToDisk" class="btn">Next</button>
      </div>
    </div>
  </div>
</section>
  `
};
