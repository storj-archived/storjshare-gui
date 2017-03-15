'use strict';

module.exports = {
  components: {
    'error': require('../notification')
  },
  data: function() {
    return window.Store.newShare;
  },
  template: `
<transition name="fade">
  <section>
    <transition name="fade">
      <error class="error-stream alert alert-danger alert-dismissible" v-bind:notes="errors" v-bind:dismiss-action="actions.clearErrors"></error>
    </transition>

    <router-view></router-view>

  </section>
</transition>
  `
};
