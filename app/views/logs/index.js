/** TODO: enhanced log features
 * @module storjshare/views/error
 */

'use strict';

module.exports = {
  props: ['shareId'],
  data: function() {
    return {
      uiState: {
        curr: 0,
        isRdy: false,
        currTxt: ''
      },
      store: new window.Store.Logs(this.shareId))
    };
  },
  computed: {

  },
  watch: {
    'uiState.curr': function() {
      if(this.uiState.isRdy) {
        this.store.read();
      }
    }
  },
  created: function() {
    this.store.on('readable', () => {
      this.uiState.currTxt = this.store.read();
      this.uiState.isRdy = true;
    });
  },
  methods: {
    tail: () => {

    }
  },
  //total-rows=filsize/pageSize
  template: `
    <textarea v-model="uiState.currTxt" readonly>
    </textarea>
    <div v-if="uiState.isRdy">
      <b-pagination size="md"
        v-model="uiState.curr"
        :total-rows="100"
        :per-page="100"
      />
    </div>
  `
}
