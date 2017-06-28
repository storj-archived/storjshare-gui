'use strict';
const path = require('path');

module.exports = {
  data: function() {
    return window.Store.newShare;
  },
  methods: {
    handleFileInput: function(event) {
      this.$set(this.config, 'storagePath', event.target.files[0].path);
      this.actions.getFreeDiskSpace(this.config.storagePath, () => {});
    },
    pathIsValid: function() {
      return path.isAbsolute(this.config.storagePath);
    }
  },
  template: `
<section>
  <div class="container">
    <div class="row wizard-nav">
      <div class="col-6">
        <router-link :to="{path: '/share-wizard/wizard1'}"><small>&lt; Go Back</small></router-link>
      </div>
      <div class="col-6 text-right">
        <small>Step 2 of 3</small>
      </div>
    </div>
    <div class="row">
      <div class="col-12">
        <img src="imgs/logo.svg" alt="Storj Share" class="logo">
      </div>
    </div>
    <div class="row text-center">
      <div class="col-12">
        <h2>Step 2 - Storage Location</h2>
        <p>Storj Share uses the free space on your drive, <br class="hidden-sm-down">to save encrypted bits of files while you are online.</p>
      </div>
    </div>
    <div class="row text-center mt-3">
      <div class="col-12">
        <input v-on:change="handleFileInput" type="file" placeholder="Select a location for the data" webkitdirectory directory multiple/>
        <router-link :to="{path: '/share-wizard/wizard3'}" class="btn" v-bind:disabled="!pathIsValid()">Select Location</router-link>
      </div>
    </div>
  </div>
</section>

  `
};
