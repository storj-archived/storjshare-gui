/**
 * @module storjshare/views/updater
 */

const {$} = window;
const {app, shell, ipcRenderer: ipc} = require('electron');
const updater = require('../lib/updater');

exports = {
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
      updater.check();
      $('#updater').modal('show');
    });

    updater.check();

    updater.on('update_available', function(meta) {
      view.update = true;
      view.releaseTag = meta.releaseTag;
      view.releaseURL = meta.releaseURL;

      $('#updater').modal('show');
    });

    updater.on('error', function(err) {
      console.log(err);
    });
  }
};
