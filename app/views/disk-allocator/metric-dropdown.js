/**
 * @module storjshare/views/allocator
 */

'use strict';

const convert = require('bytes');

module.exports = {
  props: ['value'],
  methods: {
    updateMetric: function(format) {
      this.$emit('input', format);
    }
  },
  template: `
<select v-bind:value="value"
  @change="updateMetric($event.target.value)"
  class="form-control"
>

  <option>kb</option>
  <option>mb</option>
  <option>gb</option>
  <option>tb</option>

</select>
  `
}
