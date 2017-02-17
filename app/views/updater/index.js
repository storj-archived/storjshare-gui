/**
 * @module storjshare/views/updater
 */

'use strict';

const {$} = window;
const {app, shell, ipcRenderer: ipc} = require('electron');
const updater = require('../../lib/updater');

module.exports = {
  el: '#updater',
  data: {
    update: false,
    releaseURL: '',
    releaseTag: ''
  },
  methods: {
    download: function(event) {
      if (event) {
        event.preventDefault();
      }

      if (window.confirm('You must quit Storj Share to upgrade. Continue?')) {
        shell.openExternal(this.releaseURL);
        app.quit();
      }
    }
  },
  created: function() {
    const view = this;

    ipc.on('checkForUpdates', function() {
      updater.checkForUpdates();
      $('#updater').modal('show');
    });

    updater.checkForUpdates();

    updater.on('update_available', function(meta) {
      view.update = true;
      view.releaseTag = meta.releaseTag;
      view.releaseURL = meta.releaseURL;

      $('#updater').modal('show');
    });

    updater.on('error', function(err) {
      console.log(err);
    });
  },
  template: `
<div class="modal fade text-center" id="updater" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h4 v-if="update" class="modal-title">Update Storj Share</h4>
        <h4 v-if="!update" class="modal-title">No Update Available</h4>
      </div>
      <div v-if="!update" class="modal-body">
        <p>You are already using the latest version.</p>
      </div>
      <div v-if="update" class="modal-body">
        <p>Storj Share {{releaseTag}} is available!</p>
        <p>Would you like to download the update now?</p>
      </div>
      <div class="modal-footer">
        <button v-if="!update" type="button" class="btn btn-blue" data-dismiss="modal">Close</button>
        <div v-if="update">
          <div class="col-xs-6">
            <button type="button" class="btn btn-green btn-block" data-dismiss="modal" v-on:click="download">Yes</button>
          </div>
          <div class="col-xs-6">
            <button type="button" class="btn btn-blue btn-block" data-dismiss="modal">No</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  `
};
