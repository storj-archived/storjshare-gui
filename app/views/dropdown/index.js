/**
 * @module storjshare/views/error
 */

'use strict';

module.exports = {
  data: () => {
    return {
      isOpen: false
    }
  },
  methods: {
    toggle: function() {
      if(!this.isOpen) {
        window.addEventListener('click', () => {
          this.isOpen = false;
        }, {
          once: true
        });
      }

      this.isOpen = !this.isOpen;
    }
  },
  props: ['id'],
  template: `
<div class="dropdown" v-bind:class="{show: isOpen}">
  <button v-on:click.stop.prevent="toggle" v-bind:id="id" class="dropdown-toggle node-options btn-secondary" aria-haspopup="true" v-bind:aria-expanded="isOpen">
    <slot name="img"></slot>
  </button>

  <div class="dropdown-menu" v-bind:aria-labelledby="id">
    <slot name="links"></slot>
  </div>
</div>
  `
}
