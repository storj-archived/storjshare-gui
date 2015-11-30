/**
 * @module driveshare-gui/views
 */

'use strict';

var $ = window.jQuery = require('jquery');
var Vue = require('vue');

require('bootstrap'); // init bootstrap js

var ipc = require('electron-safe-ipc/guest');
var shell = require('shell');
var about = require('../package');
var logger = require('./logger');
var Updater = require('./updater').Updater;
var UserData = require('./userdata');
var Tab = require('./tab');
var userdata = UserData();

/**
 * Logger View
 */
var logs = new Vue({
  el: '#logs',
  data: {
    output: ''
  },
  methods: {
    show: function(event) {
      if (event) {
        event.preventDefault();
      }

      $('#logs').modal('show');
    }
  },
  created: function() {
    var view = this;

    logger.on('log', function() {
      view.output = logger._output;
    });

    ipc.on('showLogs', this.show.bind(this));
  }
});

/**
 * About View
 */
var about = new Vue({
  el: '#about',
  data: {
    version: about.version
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
    var view = this;

    ipc.on('showAboutDialog', function() {
      view.show();
    });
  }
});

/**
 * Updater View
 */
var updater = new Vue({
  el: '#updater',
  data: {
    update: false
  },
  methods: {
    download: function(event) {
      if (event) {
        event.preventDefault();
      }

      shell.openExternal('https://github.com/Storj/driveshare-gui/releases');
    }
  },
  created: function() {
    var view = this;
    var updater = new Updater();

    updater.on('update_available', function() {
      view.update = true;
    });
  }
});

/**
 * Main View
 */
var main = new Vue({
  el: '#main',
  data: {
    userdata: userdata._parsed,
    current: 0
  },
  methods: {
    addTab: function(event) {
      if (event) {
        event.preventDefault();
      }

      this.showTab(this.userdata.tabs.push(new Tab()) - 1);
    },
    showTab: function(index) {
      if (this.userdata.tabs[this.current]) {
        this.userdata.tabs[this.current].active = false;
      }

      if (index === -1) {
        this.current = 0;
        this.userdata.tabs[this.current].active = true;

        if (!this.userdata.tabs[this.current]) {
          this.addTab();
        }
      } else {
        this.userdata.tabs[index].active = true;
        this.current = index;
      }
    },
    removeTab: function() {
      this.userdata.tabs.splice(this.current, 1);
      this.showTab(this.current - 1);
    },
    validateCurrentTab: function() {
      try {
        userdata.validate(this.current);
      } catch(err) {
        // inform user of the error
      }
    },
    saveTabToConfig: function() {
      try {
        this.userdata.tabs.forEach(function(val, i) {
          userdata.validate(i);
        });
        userdata.saveConfig(function(err) {
          if (err) {
            // notify user of the error
          }
        });
      } catch(err) {
        // inform user of the error
      }
    },
    selectStorageDirectory: function() {
      ipc.send('selectStorageDirectory');
    },
    startFarming: function() {
      // party on bitches
    }
  },
  created: function() {
    var self = this;

    if (!this.userdata.tabs.length) {
      this.addTab();
    }

    ipc.on('storageDirectorySelected', function(path) {
      self.userdata.tabs[self.current].storage.path = path;
    });
  }
});

/**
 * Footer View
 */
var footer = new Vue({
  el: '#footer',
  data: {},
  methods: {
    showLogs: function(event) {
      if (event) {
        event.preventDefault();
      }

      logs.show();
    }
  }
});

/**
 * Expose view objects
 * #exports
 */
module.exports = {
  logs: logs,
  updater: updater,
  about: about,
  main: main,
  footer: footer
};
