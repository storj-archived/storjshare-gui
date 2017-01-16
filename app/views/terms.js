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
  }
};
