/**
 * @module storjshare/views/allocator
 */

'use strict';
const convert = require('bytes');

module.exports = {
  model: {
    prop: 'value',
    event: 'change'
  },
  props: ['step', 'available'],
  data: function() {
    return {
      byteVal: 100000,
      selectedMetric: 'MB'
    };
  },
  filters: require('../filters/metrics'),
  methods: {
    changeAllocation: function(ev) {
      console.log(ev)
      this.byteVal = ev.target.value;
    }
  },
  template: `
<section>

  <input type="number"
    v-bind:step="step"
    v-on:change="changeAllocation"
    v-bind:value="byteVal | toUnit(selectedMetric) | parseFloat"
    min="0"
    v-bind:max="available | toUnit(selectedMetric) | parseFloat">
  </input>

  <span> / {{available | toUnit(selectedMetric)}} Available</span>

  <div class="row">
    <div class="col-6 text-right">
        <select v-model="selectedMetric" class="form-control">
          <option>kB</option>
          <option>MB</option>
          <option>GB</option>
          <option>TB</option>
        </select>
      </p>
    </div>
  </div>

</section>
  `
}
