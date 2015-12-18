/**
 * @module driveshare-gui/client
 */

'use strict';

var $ = window.jQuery = require('jquery');
var Vue = require('vue');

require('bootstrap'); // init bootstrap js

var helpers = require('./lib/helpers');
var remote = require('remote');
var app = remote.require('app');
var ipc = require('electron-safe-ipc/guest');
var shell = require('shell');
var about = require('./package');
var Updater = require('./lib/updater');
var UserData = require('./lib/userdata');
var Tab = require('./lib/tab');
var DataServWrapper = require('./lib/dataserv');
var Installer = require('./lib/installer');
var fs = require('fs');
var diskspace = require('diskspace');
var request = require('request');

var userdata = new UserData(app.getPath('userData'));
var installer = new Installer(app.getPath('userData'));
var dataserv = new DataServWrapper(app.getPath('userData'), ipc);

// bootstrap helpers
helpers.ExternalLinkListener().bind(document);

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
      this.scrollToBottom();
    },
    scrollToBottom: function() {
      var logoutput = document.getElementById('logoutput');
      logoutput.scrollTop = logoutput.scrollHeight * 2;
    }
  },
  created: function() {
    ipc.on('showLogs', this.show.bind(this));
  }
});

/**
 * Setup View
 */
var setup = new Vue({
  el: '#setup',
  data: {
    title: 'Welcome to DriveShare',
    working: true,
    status: '',
    linux: installer._platform === 'linux',
    password: '',
    error: ''
  },
  methods: {
    setup: function(event) {
      var self = this;

      if (event) {
        event.preventDefault();
      }

      this.working = true;
      this.error = '';

      installer.removeAllListeners();

      installer.on('status', function(status) {
        self.status = status;
      });

      installer.on('error', function(err) {
        self.working = false;

        if (self.linux) {
          self.error = 'It looks like you are missing the required ' +
                       'dependencies for GNU/Linux. Please install ' +
                       'DriveShare using our Debian package.';
        } else {
          self.error = err.message;
        }
      });

      installer.on('end', function() {
        self.working = false;
        $('#setup').modal('hide');
      });

      installer.install(self.password);
    },
    reload: function() {
      location.reload();
    },
    openReleases: function() {
      shell.openExternal('https://github.com/storj/driveshare-gui/releases');
      app.quit();
    }
  },
  created: function() {
    var self = this;

    installer.check(function(err, installed) {
      if (err || !installed) {
        if (err) {
          self.status = err.message;
        }

        self.setup();
        $('#setup').modal('show');
      }
    });
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
    update: false,
    releaseURL: '',
    releaseTag: ''
  },
  methods: {
    download: function(event) {
      if (event) {
        event.preventDefault();
      }

      shell.openExternal(this.releaseURL);
    }
  },
  created: function() {
    var view = this;
    var updater = new Updater();

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
});

/**
 * App Settings View
 */
var appSettings = new Vue({
  el:'#app-settings',
  data: {
    appSettings: (userdata._parsed.appSettings)
      ? userdata._parsed.appSettings
      : userdata._parsed.appSettings = {}
  },
  ready: function() {
    var self = this;
    if(typeof this.appSettings.minToTask === 'undefined') {
      this.appSettings.minToTask = true;
    }

    $('#app-settings').on('hide.bs.dropdown', function() {
      userdata.saveConfig(function(err) {
        if (err) {
          return window.alert(err.message);
        }
        ipc.send('appSettingsChanged', self.appSettings);
      });
    });
  },
  beforeDestroy: function() {
    $('#app-settings').off('hide.bs.dropdown');
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
    transitioning: false,
    freespace: '',
    balance: {
      sjcx: 0,
      sjct: 0,
      qualified: false
    }
  },
  methods: {
    addTab: function(event) {
      if (event) {
        event.preventDefault();
      }

      this.showTab(this.userdata.tabs.push(new Tab()) - 1);
    },
    showTab: function(index) {
      if (!this.userdata.tabs[index]) {
        return this.addTab();
      }

      if (this.userdata.tabs[this.current]) {
        this.userdata.tabs[this.current].active = false;
      }

      if (index === -1) {
        this.current = 0;

        if (!this.userdata.tabs[this.current]) {
          this.addTab();
        }
      } else {
        this.current = index;
        this.userdata.tabs[this.current].active = true;
      }

      this.getFreeSpace();
      this.getBalance();
      this.renderLogs(this.userdata.tabs[this.current]._process);
    },
    renderLogs: function(running) {
      this.userdata.tabs.forEach(function(tab) {
        if (tab._process) {
          tab._process._logger.removeAllListeners('log');
        }
      });

      if (running) {
        running._logger.on('log', function() {
          if (!!running) {
            logs.output = running._logger._output;

            setImmediate(function() {
              logs.scrollToBottom();
            });
          }
        });
      }

      logs.output = !!running ? running._logger._output : '';
    },
    removeTab: function(event) {
      if (event) {
        event.stopPropagation();
      }

      if (!window.confirm('Are you sure you want to remove this drive?')) {
        return;
      }

      var id = this.userdata.tabs[this.current].id;

      this.stopFarming();
      this.userdata.tabs.splice(this.current, 1);
      this.showTab((this.current - 1) === -1 ? 0 : this.current - 1);

      userdata.saveConfig(function(err) {
        if (err) {
          return window.alert(err.message);
        }

        if (fs.existsSync(dataserv._getConfigPath(id))) {
          fs.unlinkSync(dataserv._getConfigPath(id));
        }
      });
    },
    selectStorageDirectory: function() {
      ipc.send('selectStorageDirectory');
    },
    startFarming: function(event) {
      var self = this;
      var current = this.current;
      var tab = this.userdata.tabs[current];
      var dscli = installer.getDataServClientPath();

      if (event) {
        event.preventDefault();
      }

      try {
        userdata.validate(current);
      } catch(err) {
        return window.alert(err.message);
      }

      this.transitioning = true;

      userdata.saveConfig(function(err) {
        if (err) {
          self.transitioning = false;
          return window.alert(err.message);
        }

        dataserv.validateClient(dscli, function(err) {
          if (err) {
            self.transitioning = false;
            return window.alert(err.message);
          }

          dataserv.setAddress(tab.address, tab.id, function(err) {
            if (err) {
              self.transitioning = false;
              return window.alert('Failed to set address ' + tab.address);
            }

            tab._process = dataserv.farm(tab);

            self.transitioning = false;

            tab._process.on('error', function() {
              this._process = null;
              ipc.send('processTerminated');
            });

            tab._process.on('exit', function() {
              this._process = null;
              ipc.send('processTerminated');
            });

            self.showTab(current);
          });
        });
      });
    },
    stopFarming: function(event) {
      if (event) {
        event.preventDefault();
      }

      var tab = this.userdata.tabs[this.current];

      if (tab._process) {
        tab._process.kill();
        tab._process = null;
      }
    },
    getFreeSpace: function() {
      var self = this;
      var tab = this.userdata.tabs[this.current];
      var drive = tab.storage.path.substr(0, 1);
      var freespace = 0;

      this.freespace = '...';

      diskspace.check(drive, function(err, total, free) {
        if (err) {
          self.freespace = 'Free Space: ?';
          return;
        }

        switch (tab.storage.unit) {
          case 'MB':
            freespace = (free * 1e-6).toFixed(0);
            break;
          case 'GB':
            freespace = (free * 1e-9).toFixed(1);
            break;
          case 'TB':
            freespace = (free * 1e-12).toFixed(2);
            break;
        }

        self.freespace = 'Free Space: ' + freespace + ' ' + tab.storage.unit;
      });
    },
    getBalance: function() {
      var self = this;
      var tab = this.userdata.tabs[this.current];

      this.balance.sjcx = 0;
      this.balance.sjct = 0;

      if (!tab.address) {
        this.balance.qualified = false;
        return;
      }

      var url = 'http://xcp.blockscan.com/api2';
      var assets = ['SJCX', 'SJCT'];
      var query = {
        module: 'address',
        action: 'balance',
        btc_address: tab.address
      };

      assets.forEach(function(asset) {
        query.asset = asset;

        request({ url: url, qs: query, json: true }, function(err, res, body) {
          if (err || res.statusCode !== 200) {
            return;
          }

          self.balance.qualified = true;

          if (body && body.data.length) {
            self.balance[asset.toLowerCase()] = body.data[0].balance;
          }
        });
      });
    }
  },
  created: function() {
    var self = this;

    $('.container').addClass('visible');

    if (!this.userdata.tabs.length) {
      this.addTab();
    } else {
      this.userdata.tabs.forEach(function(tab, index) {
        if (tab.active) {
          self.current = index;
        }
      });
    }

    this.showTab(this.current);

    ipc.on('storageDirectorySelected', function(path) {
      self.userdata.tabs[self.current].storage.path = path[0];
      self.getFreeSpace();
    });

    ipc.on('toggle_dataserv', function() {
      var isRunning = !!self.userdata.tabs[self.current]._process;

      if (isRunning) {
        self.stopFarming();
      } else {
        self.startFarming();
      }
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
  setup: setup,
  logs: logs,
  updater: updater,
  about: about,
  appSettings: appSettings,
  main: main,
  footer: footer
};
