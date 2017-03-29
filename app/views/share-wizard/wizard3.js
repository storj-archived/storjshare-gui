'use strict';
const bytes = require('bytes');

module.exports = {
  data: function() {
    return {
      store: window.Store.newShare,
      uiState: {
        selectedMetric: 'MB',
        increments: {
          kB: 1000,
          MB: 100,
          GB: 1,
          TB: 0.0001
        }
      }
    };
  },
  filters: require('../filters/metrics'),
  components: {
    'size-allocator' : require('../allocator')
  },
  created: function() {
    if(!this.store.storageAvailable) {
      this.store.errors.push(new Error('Invalid directory selected'));
    }
  },
  template: `
<section>
  <div class="container">
    <div class="row wizard-nav">
      <div class="col-6">
        <router-link :to="{path: '/share-wizard/wizard2'}"><small>&lt; Go Back</small></router-link>
      </div>
      <div class="col-6 text-right">
        <small>Step 3 of 3</small>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <img src="imgs/logo.svg" alt="Storj Share" class="logo">
      </div>
    </div>
    <div class="row text-center">
      <div class="col">
        <h2>Step 3 - Storage Sharing</h2>
        <p>Storj Share uses only the storage space you share. <br class="hidden-sm-down">The more storage you share, the more you can earn.</p>
      </div>
    </div>
    <div class="row justify-content-center">
      <div class="col col-md-10 col-lg-8 col-xl-6">
        <size-allocator v-model="store.config.storageAllocation" v-bind:available="store.storageAvailable"></size-allocator>
      </div>
    </div>
    <div class="row text-center justify-content-center">
      <div class="col col-md-10 col-lg-8 col-xl-6">
        <router-link :to="{path: '/share-wizard/wizard4'}" class="btn">Next</router-link>
      </div>
    </div>
  </div>
</section>
  `
};

//$( this ).css( 'background', 'linear-gradient(90deg, #7ED321 ' + this.value + '%, #fff ' + this.value + '%)' );
