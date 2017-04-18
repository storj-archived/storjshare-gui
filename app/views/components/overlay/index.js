/**
 * @module storjshare/views/component/
 */

'use strict';

module.exports = {
  props: ['class', 'isShowing'],
  data: function() {
    return {
      overlayClass: ['', this.class]
    };
  },
  template: `
<section v-show="isShowing" v-bind:class="overlayClass">
  <slot><slot>
</section>
  `
};
