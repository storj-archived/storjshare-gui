/**
 * @module storjshare/views/about
 */

'use strict';

const {$} = window;
const about = require('../../package');
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
  },
  template: `
<div class="modal fade text-center" id="about" tabindex="-1" role="dialog" aria-labelledby="modalAbout">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
        <h4 class="modal-title">About Storj Share</h4>
      </div>
      <div class="modal-body">
        <p>GUI {{version}}</p>
        <p>Daemon {{daemon}}</p>
        <p>Core {{core}}</p>
        <p>Protocol {{protocol}}</p>
      </div>
    </div>
  </div>
</div>
  `
};
