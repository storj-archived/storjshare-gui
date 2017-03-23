/**
 * @module storjshare/views/about
 */

'use strict';

const about = require('../../package');
const storj = require('storj-lib');
const daemonPackage = require('storjshare-daemon/package');
const {ipcRenderer: ipc} = require('electron');

module.exports = {
  components: {
    'modal': require('../modal')
  },
  data: function() {
    return {
      version: about.version,
      core: storj.version.software,
      protocol: storj.version.protocol,
      daemon: daemonPackage.version,
      isVisible: false
    };
  },
  methods: {
    close: function() {
      this.isVisible = false;
    }
  },
  created: function() {
    ipc.on('showAboutDialog', () => {
      this.isVisible = true;
    });
  },
  template: `
<modal v-bind:show="isVisible">
  <div slot="header">
    <h4 class="modal-title">About Storj Share</h4>
  </div>

  <div slot="body">
    <p>GUI {{version}}</p>
    <p>Daemon {{daemon}}</p>
    <p>Core {{core}}</p>
    <p>Protocol {{protocol}}</p>
  </div>

  <div slot="footer">
    <button type="button" class="btn btn-blue" v-on:click="close">Close</button>
  </div>
</modal>
  `
};
