/**
 * @module driveshare-gui/views
 */

'use strict';

var $ = window.jQuery = require('jquery');
var bs = require('bootstrap');
var Vue = require('vue');

var ipc = require('electron-safe-ipc/guest');
var shell = require('shell');
var about = require('../package');
var logger = require('./logger');
var Updater = require('./updater').Updater;

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
    tabs: []
  },
  methods: {
    // implement interaction from userdata.js
    addTab: function(event) {
      if (event) {
        event.preventDefault();
      }

    }
  },
  created: function() {
    // load tab data and populate view
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
