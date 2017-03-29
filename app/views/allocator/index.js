/**
 * @module storjshare/views/allocator
 */

'use strict';
const convert = require('bytes');

module.exports = {
  props: ['value', ],
  
  template: `
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
  `
}
