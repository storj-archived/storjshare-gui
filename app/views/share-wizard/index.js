'use strict';

const { ViewEvents, daemonRpc: rpc } = window;

module.exports = {
  data: function() {
    return {
      newShare: {
        paymentAddress: '',
        storagePath: '',
        storageAllocation: '',
        rpcPort: ''
      },
      currStep: 0
    };
  },
  methods: {
    saveToDisk: function() {
      rpc.create(this.newShare, (err) => {
        if (err) {
          return ViewEvents.emit('error', err);
        }
      });
    },
  },
  template: `
<transition name="fade">
  <router-view></router-view>
</transition>
  `
};
