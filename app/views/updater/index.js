/**
 * @module storjshare/views/updater
 */

'use strict';

const {app, shell, ipcRenderer: ipc} = require('electron');
const updater = require('../../lib/updater');

module.exports = {
  components: {
    'modal': require('../modal')
  },
  data: function() {
    return {
      update: false,
      releaseURL: '',
      releaseTag: '',
      show: false
    };
  },
  methods: {
    download: function(event) {
      if (event) {
        event.preventDefault();
      }

      this.close();

      if (window.confirm('You must quit Storj Share to upgrade. Continue?')) {
        shell.openExternal(this.releaseURL);
        app.quit();
      }
    },
    close: function() {
      this.show = false;
    }
  },
  created: function() {
    const view = this;

    ipc.on('checkForUpdates', function() {
      updater.checkForUpdates();
      view.show = true;
    });

    updater.checkForUpdates();

    updater.on('update_available', function(meta) {
      view.update = true;
      view.releaseTag = meta.releaseTag;
      view.releaseURL = meta.releaseURL;

      view.show = true;
    });

    updater.on('error', function(err) {
      console.log(err);
    });
  },
  template: `
<modal v-bind:show="show">
  <div slot="header">
    <h4 v-if="update" class="modal-title">Update Storj Share</h4>
    <h4 v-if="!update" class="modal-title">No Update Available</h4>
  </div>

  <div slot="body">
    <div v-if="!update">
      <p>You are already using the latest version.</p>
    </div>
    <div v-if="update">
      <p>Storj Share {{releaseTag}} is available!</p>
      <p>Would you like to download the update now?</p>
    </div>
  </div>

  <div slot="footer">
    <button v-if="!update" type="button" class="btn btn-blue" v-on:click="close">Close</button>
    <div v-if="update">
      <div class="col-xs-6">
        <button type="button" class="btn btn-green btn-block" v-on:click="download">Yes</button>
      </div>
      <div class="col-xs-6">
        <button type="button" class="btn btn-blue btn-block" v-on:click="close">No</button>
      </div>
    </div>
  </div>
</modal>
`
};
