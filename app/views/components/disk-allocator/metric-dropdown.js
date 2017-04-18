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

  <option>KB</option>
  <option>MB</option>
  <option>GB</option>
  <option>TB</option>

</select>
  `
}
