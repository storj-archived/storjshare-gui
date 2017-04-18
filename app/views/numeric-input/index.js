/**
 * @module storjshare/views/numeric-input
 */

'use strict';

module.exports = {
  props: ['value', 'max', 'min', 'step'],
  methods: {
    changeInput: function(val) {
      let numericVal = String(val).replace(/\D/g,'');
      numericVal = (numericVal > this.max)
        ? this.max
        : (numericVal < this.min )
        ? this.min
        : numericVal;

      this.$forceUpdate();
      this.$emit('input', numericVal);
    },
  },
  template: `
<input v-bind:value="value"
  v-bind:max="max"
  v-bind:min="min"
  v-bind:step="step"
  v-on:blur="changeInput($event.target.value)"
  ref="input"
  type="number"
>
</input>
  `
}
