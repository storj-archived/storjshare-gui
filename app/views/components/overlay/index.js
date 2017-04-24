/**
 * @module storjshare/views/component/
 */

'use strict';

module.exports = {
  props: ['class'],
  data: function() {
    return {
      overlayClass: ['overlay', this.class]
    };
  },
  template: `
<section v-bind:class="overlayClass">
  <slot></slot>
</section>
  `
};
