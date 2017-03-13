/**
 * @module storjshare/views/error
 */

'use strict';

module.exports = {
  props: ['shareId'],
  data: function() {
    return {
      uiState: {
        curr: 0,
        currTxt: ,
        pageCache: {}
      },
      store: window.Store.shareList
    };
  },
  watch: {
    'uiState.curr': function() {
      //update state
    }
  },
  created: function() {

  },
  methods: {
    tail: () => {

    }
  },
  //total-rows=filsize/pageSize
  template: `
    <textarea v-model="uiState.currTxt" readonly>
    </textarea>
    <b-pagination size="md"
      v-model="uiState.curr"
      :total-rows="100"
      :per-page="100"
    />

  `
}
