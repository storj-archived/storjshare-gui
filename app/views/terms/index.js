/**
 * @module storjshare/views/terms
 */

'use strict';

const {localStorage: _localStorage} = window;
const TERMS_KEY = '__TERMS_READ';
const path = require('path');
const {readFileSync} = require('fs');

module.exports = {
  components: {
    'modal': require('../modal'),
    'terms-contents': require('./content')
  },
  data: function() {
    return {
      isVisible: false
    };
  },
  methods: {
    accepted: function() {
      _localStorage.setItem(TERMS_KEY, '1');
      this.isVisible = false;
    }
  },
  created: function() {
    if (!_localStorage.getItem(TERMS_KEY)) {
      this.isVisible = true;
    }
  },
  template: `
<modal v-bind:show="isVisible" id="terms">
  <div slot="header" class="container">
    <h4 class="modal-title">Storage Sharing Terms</h4>
  </div>

  <div slot="body">
    <p><terms-contents></terms-contents></p>
  </div>

  <div slot="footer">
    <button v-on:click='accepted' type="button" class="btn btn-green">I Accept</button>
  </div>
</modal>
  `
};
