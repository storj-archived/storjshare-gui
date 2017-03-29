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
    }
  },
  filters: require('../filters/metrics'),
  created: function() {
    if(!this.store.storageAvailable) {
      this.store.errors.push(new Error('Invalid directory selected'));
    }
  },
  methods: {
    changeAllocation: function(ev) {
      console.log(ev.target.value)
      console.log(bytes(ev.target.value))
      this.$set(this.store.config, 'storageAllocation', bytes(ev.target.value))
      this.store.config.storageAllocation = bytes(ev.target.value);
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
        <input type="number"
          v-bind:step="uiState.increments[uiState.selectedMetric]"
          v-on:change="changeAllocation"
          v-bind:value="store.config.storageAllocation | toUnit(uiState.selectedMetric) | parseFloat"
          min="0"
          v-bind:max="store.storageAvailable | toUnit(uiState.selectedMetric)">
        </input>
        <span> / {{store.storageAvailable | toUnit(uiState.selectedMetric)}} Available</span>
        <div class="row">
          <div class="col-6 text-right">
              <select v-model="uiState.selectedMetric" class="form-control">
                <option>kB</option>
                <option>MB</option>
                <option>GB</option>
                <option>TB</option>
              </select>
            </p>
          </div>
        </div>

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
