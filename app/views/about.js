/**
 * @module storjshare/views/about
 */

const {$} = window;
const about = require('../package');
const storj = require('storj-lib');
const {ipcRenderer: ipc} = require('electron');

exports = {
  el: '#about',
  data: {
    version: about.version,
    core: storj.version.software,
    protocol: storj.version.protocol
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
