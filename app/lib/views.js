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
var dataserv = require('./dataserv');
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
    current: 0,
    running: []
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

        if (!this.userdata.tabs[this.current]) {
          this.addTab();
          this.userdata.tabs[this.current].active = true;
        }
      } else {
        this.userdata.tabs[index].active = true;
        this.current = index;
      }

      var isRunning = !!this.running[this.current];

      ipc.send('tabChanged', isRunning);
    },
    removeTab: function() {
      this.userdata.tabs.splice(this.current, 1);
      this.showTab(this.current - 1);
      this.stopFarming();

      this.saveTabToConfig(function(err) {
        if (err) {
          return window.alert(err.message);
        }
      });
    },
    validateCurrentTab: function() {
      userdata.validate(this.current);
    },
    saveTabToConfig: function(callback) {
      userdata.saveConfig(callback);
    },
    selectStorageDirectory: function() {
      ipc.send('selectStorageDirectory');
    },
    startFarming: function(event) {
      var self = this;
      var current = this.current;
      var addr = this.userdata.tabs[current].address;
      var conf = this.userdata.tabs[current].storage;
      var dscli = 'dataserv-client'; // TODO: this is different on OSX and WIN

      if (event) {
        event.preventDefault();
      }

      try {
        userdata.validate(this.current);
      } catch(err) {
        return window.alert(err.message);
      }

      this.saveTabToConfig(function(err) {
        if (err) {
          return window.alert(err.message);
        }

        dataserv.validateClient(dscli, function(err) {
          if (err) {
            return window.alert(err.message);
          }

          dataserv.setAddress(dscli, addr);

          Vue.set(self.running, current, dataserv.farm(
            dscli,
            conf.path,
            conf.size,
            conf.unit
          ));

          self.running[current].on('error', function() {
            self.running[current] = false;
            ipc.send('processTerminated');
          });

          self.running[current].on('exit', function() {
            self.running[current] = false;
            ipc.send('processTerminated');
          });
        });
      });
    },
    stopFarming: function(event) {
      if (event) {
        event.preventDefault();
      }

      this.running[this.current].kill();
      this.running[this.current] = false;
    }
  },
  created: function() {
    var self = this;

    if (!this.userdata.tabs.length) {
      this.addTab();
    } else {
      this.userdata.tabs.forEach(function(tab, index) {
        if (tab.active) {
          self.current = index;
        }
      });
    }

    ipc.on('storageDirectorySelected', function(path) {
      self.userdata.tabs[self.current].storage.path = path[0];
    });

    ipc.on('farm', this.startFarming.bind(this));
    ipc.on('terminateProcess', this.stopFarming.bind(this));
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
