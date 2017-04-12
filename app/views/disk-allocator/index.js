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

  <metric-input v-on:input="changeAllocation"
    v-bind:value="value"
    v-bind:format="selectedMetric"
    v-bind:step="increments[selectedMetric]"
    v-bind:available="available">
  </metric-input>

  <span> / {{available | toUnit(selectedMetric)}} Available</span>

  <div class="row">
    <div class="col-6 text-right">
        <metric-dropdown v-model="selectedMetric">
        </metric-dropdown>
      </p>
    </div>
  </div>

</section>
  `
}
