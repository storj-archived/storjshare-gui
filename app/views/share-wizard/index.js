'use strict';

module.exports = {
  components: {
    'error': require('../notification')
  },
  data: function() {
    return {
      newShare: window.Store.newShare,
      shareList: window.Store.shareList
    };
  },
  template: `
<transition name="fade">
  <section>
    <transition name="fade">
      <error class="error-stream alert alert-danger alert-dismissible" v-bind:notes="newShare.errors" v-bind:dismiss-action="newShare.actions.clearErrors"></error>
    </transition>
    
    <transition>
      <error class="error-stream alert alert-danger alert-dismissible" v-bind:notes="shareList.errors" v-bind:dismiss-action="shareList.actions.clearErrors"></error>
    </transition>

    <router-view></router-view>

  </section>
</transition>
  `
};
