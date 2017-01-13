/**
 * @module storjshare/views/terms
 */

const {localStorage} = window;

exports = {
  el: '#terms',
  data: {

  },
  methods: {
    accepted: function() {
      localStorage.setItem('terms', JSON.stringify({ accepted: true }));
    }
  }
};
