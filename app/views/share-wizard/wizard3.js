'use strict';

module.exports = {
  data: function() {
    return {
      store: window.Store.newShare,
      uiState: {
        percent: 10,
        selectedMetric: 'MB'
      }
    }
  },
  filters: require('../filters/data_metrics'),
  created: function() {
    this.updateSlider();
  },
  methods: {
    updateSlider: function() {
      this.store.config.storageAllocation = Math.round((this.uiState.percent / 100) * this.store.storageAvailable);
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
        <div class="range-slider storage-slider">
          <input v-on:input="updateSlider"
            v-model.number="uiState.percent"
            type="range"
            min="0"
            max="100"
            v-bind:style="{background: 'linear-gradient(90deg, #7ED321 ' + uiState.percent + '%, #fff ' + uiState.percent + '%)'}"
          >
          <div class="row">
            <div class="col-6">
              <p class="range-slider__info">Sharing: <span class="range-slider__value range-slider__value-used">{{store.config.storageAllocation | toUnit(uiState.selectedMetric)}}</span></p>
            </div>
            <div class="col-6 text-right">
              <p class="range-slider__info">Available: <span class="range-slider__value range-slider__value-free">{{store.storageAvailable | toUnit(uiState.selectedMetric)}}</span>
                <select v-model="uiState.selectedMetric" class="form-control range-slider__unit-selector">
                  <option>KB</option>
                  <option>MB</option>
                  <option>GB</option>
                  <option>TB</option>
                </select>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row text-center justify-content-center mt-2">
      <div class="col col-md-10 col-lg-8 col-xl-6">
        <router-link :to="{path: '/share-wizard/wizard4'}" class="btn">Next</router-link>
      </div>
    </div>
  </div>
</section>
  `
};

//$( this ).css( 'background', 'linear-gradient(90deg, #7ED321 ' + this.value + '%, #fff ' + this.value + '%)' );
