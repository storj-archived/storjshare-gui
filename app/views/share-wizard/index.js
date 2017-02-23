'use strict';

module.exports = {
  components: {
    'error': require('../error')
  },
  template: `
<transition name="fade">
  <section>
    <error></error>
    <router-view></router-view>
  </section>
</transition>
  `
};
