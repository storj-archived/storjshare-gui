/**
 * @module storjshare/views/uploader
 */

'use strict';

module.exports = {
  props: ['selectAction'],
  methods: {
    proxyFileInput: function(event) {
      document.getElementById('fileProxyTarget' + this._uid).click();
    }
  },
  template: `
<section>
  <input :id="'fileProxyTarget'+_uid" v-on:change="selectAction" type="file" placeholder="Import existing share configurations" style="overflow: hidden; visibility: hidden; display: none" multiple />
  <small><a v-on:click.prevent="proxyFileInput" href="">Import Config</a></small>
<section>
  `
}
