/**
 * @module storjshare/views/allocator
 */

'use strict';

const filters = require('../filters/metrics');

module.exports = {
  props: ['value', 'available'],
  filters: filters,
  data: function() {
    return {
      selectedMetric: 'MB',
      increments: {
        KB: 1000,
        MB: 100,
        GB: 1,
        TB: 0.0001
      }
    };
  },
  methods: {
    changeAllocation: function(val) {
      this.$emit('input', val);
    }
  },
  watch: {
    selectedMetric: function(newVal, oldVal) {
      if(newVal !== oldVal) {
        let bVal = filters.toBytes(filters.toUnit(this.value, newVal));
        this.$emit('input', bVal);
      }
    }
  },
  components: {
    'metric-input': require('./metric-input'),
    'metric-dropdown': require('./metric-dropdown')
  },
  template: `
<section>

  <div class="row justify-content-center align-items-center mt-3 mb-4">
      <metric-input v-on:input="changeAllocation"
        v-bind:value="value"
        v-bind:format="selectedMetric"
        v-bind:step="increments[selectedMetric]"
        v-bind:available="available"
        class="col-4">
      </metric-input>
      <metric-dropdown v-model="selectedMetric" class="col-2">
      </metric-dropdown>
      <span class="col-4">of {{available | toUnit(selectedMetric)}} Available</span>
  </div>

</section>
  `
}
