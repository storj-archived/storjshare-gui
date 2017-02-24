'use strict';

module.exports = {
  components: {
    'error': require('../error')
  },
  data: function() {
    return window.Store.newShare;
  },
  template: `
<transition name="fade">
  <section>
    <!--error handling-->
    <transition name="fade">
      <error v-bind:errors="errors" v-bind:dismiss-action="actions.clearErrors"></error>
    </transition>

    <router-view></router-view>

  </section>
</transition>
  `
};
