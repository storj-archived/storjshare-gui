/**
 * @module storjshare/views/external-anchor
 */

'use strict';
const {shell} = require('electron');

module.exports = {
  props: ['href'],
  methods: {
    openExternal: function(event) {
      shell.openExternal(this.href);
    }
  },
  template: `
<a v-on:click.prevent="openExternal()" :href="href">
  <slot></slot>
</a>
  `
}
