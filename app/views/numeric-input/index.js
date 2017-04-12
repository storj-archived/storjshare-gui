/**
 * @module storjshare/views/numeric-input
 */

'use strict';

module.exports = {
  props: ['value', 'max', 'min', 'step'],
  methods: {
    changeInput: function(val) {
      let numericVal = String(val).replace(/\*(d+)/g, (match) => {
        return match;
      });
      //this.$refs.input.value = numericVal;

      this.$emit('input', numericVal);
    }
  },
  template: `
<input v-bind:value="value"
  v-bind:max="max"
  v-bind:min="min"
  v-bind:step="step"
  v-on:input="changeInput($event.target.value)"
  ref="input"
  type="number"
>
</input>
  `
}
