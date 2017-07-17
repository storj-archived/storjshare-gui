'use strict';
const path = require('path');

module.exports = {
  data: function() {
    return {
      newShare: window.Store.newShare,
      shareList: window.Store.shareList,
      buttonText: 'Select Location'
    };
  },
  methods: {
    handleFileInput: function(event) {
      this.$set(this.newShare.config, 'storagePath', event.target.files[0].path);
      this.newShare.actions.getFreeDiskSpace(this.newShare.config.storagePath, () => {});
    },
    pathIsValid: function() {
      for(let i = 0; i < this.shareList.shares.length; i++) {
        let share = this.shareList.shares[i];
        if(share.config.storagePath === this.newShare.config.storagePath) {
          this.buttonText = 'Location In Use';
          return false;
        }
      }
      if(!path.isAbsolute(this.newShare.config.storagePath)) {
        this.buttonText = 'Invalid Location';
        return false;
      }
      this.buttonText = 'Select Location';
      return true;
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
        <small>Step 2 of 5</small>
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
        <router-link :to="{path: '/share-wizard/wizard3'}" class="btn" v-bind:disabled="!pathIsValid()">{{buttonText}}</router-link>
      </div>
    </div>
  </div>
</section>

  `
};
