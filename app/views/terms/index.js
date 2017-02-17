/**
 * @module storjshare/views/terms
 */

'use strict';

const path = require('path');
const {$} = window;
const {readFileSync} = require('fs');
const marked = require('marked');
const {localStorage: _localStorage} = window;
const TERMS_KEY = '__TERMS_READ';

module.exports = {
  el: '#terms',
  data: {
    terms: marked(
      readFileSync(path.join(__dirname, '../TERMS.md')).toString()
    )
  },
  methods: {
    accepted: function() {
      _localStorage.setItem(TERMS_KEY, '1');
    }
  },
  created: function() {
    if (!_localStorage.getItem(TERMS_KEY)) {
      $('#terms').modal();
    }
  },
  template: `
<div class="modal fade text-left" id="terms" tabindex="-1" role="dialog" aria-labelledby="modalTerms">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h4 class="modal-title">Storage Sharing Terms</h4>
      </div>
      <div class="modal-body">{{{terms}}}</div>
      <div class="modal-footer">
        <button v-on:click='accepted' type="button" class="btn btn-green" data-dismiss="modal">I Accept</button>
      </div>
    </div>
  </div>
</div>
  `
};
