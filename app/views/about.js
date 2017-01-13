/**
 * @module storjshare/views/about
 */

const {$} = window;
const about = require('../package');
const storj = require('storj-lib');
const daemonPackage = require('storjshare-daemon/package');
const {ipcRenderer: ipc} = require('electron');

module.exports = {
  el: '#about',
  data: {
    version: about.version,
    core: storj.version.software,
    protocol: storj.version.protocol,
    daemon: daemonPackage.version
  },
  methods: {
    show: function(event) {
      if (event) {
        event.preventDefault();
      }

      $('#about').modal('show');
    }
  },
  created: function() {
    ipc.on('showAboutDialog', () => this.show());
  }
};
