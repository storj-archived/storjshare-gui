/**
 * @module storjshare/views/terms
 */

const path = require('path');
const {$} = window;
const {readFileSync} = require('fs');
const marked = require('marked');
const {localStorage} = window;
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
      localStorage.setItem(TERMS_KEY, '1');
    }
  },
  created: function() {
    if (!localStorage.getItem(TERMS_KEY)) {
      $('#terms').modal();
    }
  }
};
