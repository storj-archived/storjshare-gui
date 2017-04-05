/**
 * @module storjshare/views/allocator
 */

'use strict';

const filters = require('../filters/metrics');

module.exports = {
  props: ['value', 'format', 'step', 'available'],
  filters: filters,
  data: function() {
    return {
      displayValue: this.parseUnit(this.value, this.format)
    };
  },
  watch: {
    value: function(newVal, oldVal) {
      if(newVal !== oldVal) {
        this.displayValue = this.parseUnit(newVal, this.format);
      }
    },
    format: function(newVal, oldVal) {
      if(newVal !== oldVal) {
        this.displayValue = this.parseUnit(this.value, newVal);
      }
    }
  },
  methods: {
    changeAllocation: function() {
      let unitString = this.$refs.input.value + this.format;
      this.$emit('input', filters.toBytes(unitString));
    },
    parseUnit: function(val, format) {
      return parseFloat(filters.toUnit(val, format))
    }
  },
  template: `
  <input type="number"
    ref="input"
    v-bind:step="step"
    v-on:change="changeAllocation"
    v-bind:value="displayValue"
    min="0"
    v-bind:max="available | toUnit(format) | parseFloat"
    v-bind:disabled="!available">
  </input>
  `
}
