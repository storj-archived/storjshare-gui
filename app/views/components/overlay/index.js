/**
 * @module storjshare/views/component/
 */

'use strict';

module.exports = {
  props: ['class'],
  data: function() {
    return {
      overlayClass: ['overlay', 'black', 'glass', this.class]
    };
  },
  template: `
<section v-bind:class="overlayClass">
  <slot></slot>
</section>
  `
};
