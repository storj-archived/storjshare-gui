/**
 * @module storjshare-gui/client
 */

'use strict';

var $ = window.jQuery = require('jquery');
var Vue = require('vue');

require('bootstrap'); // init bootstrap js

var pkginfo = require('./package');
var utils = require('./lib/utils');
var helpers = require('./lib/helpers');
var electron = require('electron');
var remote = electron.remote;
var app = remote.app;
var ipc = electron.ipcRenderer;
var shell = electron.shell;
var about = require('./package');
var Updater = require('./lib/updater');
var UserData = require('./lib/userdata');
var Tab = require('./lib/tab');
var diskspace = require('fd-diskspace').diskSpaceSync;
var storj = require('storj');
var request = require('request');
var SpeedTest = require('myspeed').Client;
var userdata = new UserData(app.getPath('userData'));
var Logger = require('kad-logger-json');
var FsLogger = require('./lib/fslogger');
var TelemetryReporter = require('storj-telemetry-reporter');

// bootstrap helpers
helpers.ExternalLinkListener().bind(document);

/**
 * About View
 */
var about = new Vue({
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
    userdata: userdata._parsed
  },
  methods: {
    changeSettings: function() {
      ipc.send('appSettingsChanged', JSON.stringify(userdata.toObject()));
      userdata.saveConfig(function(err) {
        if (err) {
          return window.alert(err.message);
        }
      });
    }
  },
  ready: function() {
    var self = this;
    //check for OS-specific boot launch option
    ipc.send('checkBootSettings');
    ipc.on('checkAutoLaunchOptions', function(ev, isEnabled) {
      self.userdata.appSettings.launchOnBoot = isEnabled;
      userdata.saveConfig(function(err) {
        if (err) {
          return window.alert(err.message);
        }
      });
    });
    //remove default bootstrap UI dropdown close behavior
    $('#app-settings > .dropdown-menu input,' +
      '#app-settings > .dropdown-menu label')
      .on('click', function(e) {
        e.stopPropagation();
      }
    );
  },
  beforeDestroy: function() {
    $('#app-settings > .dropdown-menu input,' +
      '#app-settings > .dropdown-menu label').off('click');
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
    },
    logwindow: '',
    telemetry: {},
    telemetryWarningDismissed: localStorage.getItem('telemetryWarningDismissed')
  },
  methods: {
    dismissTelemetryWarning: function() {
      this.telemetryWarningDismissed = true;
      localStorage.setItem('telemetryWarningDismissed', true);
    },
    scrollLogs: function() {
      var self = this;

      setInterval(function() {
        var logs = document.getElementById('logs');

        if (!logs) {
          return;
        }

        var end = logs.scrollHeight - logs.clientHeight <= logs.scrollTop + 1;

        self.logwindow = self.userdata.tabs[self.current].logs._output;

        if (end) {
          setTimeout(function() {
            logs.scrollTop = logs.scrollHeight - logs.clientHeight;
          }, 10);
        }
      }, 250);
    },
    addTab: function(event) {
      if (event) {
        event.preventDefault();
      }
      this.showTab(this.userdata.tabs.push(new Tab()) - 1);
      ipc.send('appSettingsChanged', JSON.stringify(userdata.toObject()));
    },
    showTab: function(index) {
      var self = this;

      createTabIfNoneFound();
      setPreviousTabToInactive();

      self.transitioning = false;

      function createTabIfNoneFound(){
        if (!self.userdata.tabs[index]) {
          return self.addTab();
        }
      }

      function setPreviousTabToInactive(){
        if (self.userdata.tabs[self.current]) {
          self.userdata.tabs[self.current].active = false;
        }
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
    },
    removeTab: function(event) {
      if (event) {
        event.stopPropagation();
      }

      if (!window.confirm('Are you sure you want to remove this drive?')) {
        return;
      }

      this.stopFarming();
      this.userdata.tabs.splice(this.current, 1);
      this.showTab((this.current - 1) === -1 ? 0 : this.current - 1);

      ipc.send('appSettingsChanged', JSON.stringify(userdata.toObject()));
      userdata.saveConfig(function(err) {
        if (err) {
          return window.alert(err.message);
        }
      });
    },
    selectStorageDirectory: function() {
      ipc.send('selectStorageDirectory');
    },
    startFarming: function(event, index) {
      var self = this;
      var current = (index) ? index : this.current;
      var tab = this.userdata.tabs[current];
      var fslogger = new FsLogger(app.getPath('userData'), 'Drive-'+current);

      fslogger.on('error', function(err) {
        console.log(err.message);
      });

      if (event) {
        event.preventDefault();
      }

      try {
        userdata.validate(current);
      } catch(err) {
        return window.alert(err.message);
      }

      this.transitioning = true;

      tab.telemetry = { enabled: self.userdata.appSettings.reportTelemetry };

      var logger = new Logger(3);
      var reporter = new TelemetryReporter(
        'https://status.storj.io',
        storj.KeyPair(tab.key)
      );
      var farmerconf = {
        keypair: storj.KeyPair(tab.key),
        payment: { address: tab.address },
        storage: tab.storage,
        address: '127.0.0.1',
        port: 0,
        noforward: false,
        logger: logger,
        tunport: 0
      };
      var farmer = new storj.FarmerInterface(farmerconf);

      tab.farmer = function() {
        return farmer;
      };

      tab.reporter = function() {
        return reporter;
      };

      logger.on('log', function(data) {
        fslogger.log(data.level, data.timestamp, data.message);
        tab.logs.append(
          '<div><span class="' + data.level + '">{' + data.level + '}</span> ' +
          '<span class="ts">[' + data.timestamp + ']</span></div>' +
          '<div><em>' + data.message + '</em></div>'
        );
      });

      tab.wasRunning = true;
      ipc.send('appSettingsChanged', JSON.stringify(userdata.toObject()));

      if (self.userdata.appSettings.reportTelemetry) {
        self.startReportingTelemetry(tab);
      }

      userdata.saveConfig(function(err) {
        if (err) {
          self.transitioning = false;
          return window.alert(err.message);
        }

        farmer.join(function(err) {
          self.transitioning = false;

          if (err) {
            return window.alert(err.message);
          }
        });
      });
    },
    stopFarming: function(event) {
      var self = this;

      if (event) {
        event.preventDefault();
      }

      var tab = this.userdata.tabs[this.current];

      if (tab.farmer) {
        tab.wasRunning = false;
        tab.farmer().leave();

        if (self.userdata.appSettings.reportTelemetry) {
          self.stopReportingTelemetry(tab);
        }

        tab.farmer = null;
      }

      ipc.send('appSettingsChanged', JSON.stringify(userdata.toObject()));

      userdata.saveConfig(function(err) {
        self.transitioning = false;

        if (err) {
          return window.alert(err.message);
        }
      });
    },
    startReportingTelemetry: function(tab) {
      var farmer = tab.farmer();
      var id = farmer._contact.nodeID;
      var reporter = tab.reporter();

      if (this.telemetry[id]) {
        clearInterval(this.telemetry[id]);
      }

      function report() {
        var bandwidth = localStorage.getItem('telemetry_speedtest');
        var needstest = false;
        var hours25 = 60 * 60 * 25 * 1000;

        function send() {
          utils.getDirectorySize(tab.storage.path, function(err, size) {
            if (err) {
              return console.error('Failed to collect telemetry data');
            }

            var totalSpace = Number(tab.storage.size);

            switch (tab.storage.unit) {
              case 'MB':
                totalSpace = totalSpace * Math.pow(1024, 2);
                break;
              case 'GB':
                totalSpace = totalSpace * Math.pow(1024, 3);
                break;
              case 'TB':
                totalSpace = totalSpace * Math.pow(1024, 4);
                break;
              default:
                // NOOP
            }

            var report = {
              storage: {
                free: Number((totalSpace - size).toFixed()),
                used: Number(size.toFixed())
              },
              bandwidth: {
                upload: Number(bandwidth.upload),
                download: Number(bandwidth.download)
              },
              contact: farmer._contact,
              payment: tab.address
            };

            console.log('[telemetry] sending report', report);
            reporter.send(report, function(err, result) {
              console.log('[telemetry]', err, result);
            });
          });
        }

        if (!bandwidth) {
          needstest = true;
        } else {
          bandwidth = JSON.parse(bandwidth);

          if ((new Date() - new Date(bandwidth.timestamp)) > hours25) {
            needstest = true;
          }
        }

        if (needstest && pkginfo.config.speedTestURL) {
          SpeedTest({
            url: pkginfo.config.speedTestURL
          }).test(function(err, result) {
            if (err) {
              return console.error('[telemetry]', err);
            }

            bandwidth = {
              upload: result.upload,
              download: result.download,
              timestamp: Date.now()
            };

            localStorage.setItem(
              'telemetry_speedtest',
              JSON.stringify(bandwidth)
            );

            send();
          });
        } else {
          send();
        }
      }

      this.telemetry[id] = setInterval(report, 5 * (60 * 1000));

      report();
    },
    stopReportingTelemetry: function(tab) {
      var farmer = tab.farmer();
      var id = farmer._contact.nodeID;

      if (this.telemetry[id]) {
        clearInterval(this.telemetry[id]);
        this.telemetry[id] = null;
      }
    },
    getFreeSpace: function() {
      var tab = this.userdata.tabs[this.current];
      var freespace = 0;

      this.freespace = '...';

      var disks = diskspace().disks;
      var free = 0;

      for (var disk in disks) {
        if (tab.storage.path.indexOf(disk) !== -1) {
          // The `df` command on linux returns KB by default, so we need to
          // convert to bytes.
          free = process.platform === 'win32' ?
                 disks[disk].free :
                 disks[disk].free * 1024;
        }
      }

      switch (tab.storage.unit) {
        case 'MB':
          freespace = utils.bytesToSize(free, 0);
          break;
        case 'GB':
          freespace = utils.bytesToSize(free, 1);
          break;
        case 'TB':
          freespace = utils.bytesToSize(free, 2);
          break;
      }

      this.freespace = 'Free Space: ' + freespace;
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
            if (asset === 'SJCX' || Number(body.data[0].balance)) {
              self.balance[asset.toLowerCase()] = body.data[0].balance;
            }
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
      handleRunDrivesOnBoot(this.userdata.appSettings.runDrivesOnBoot);
    }

    this.scrollLogs();

    function handleRunDrivesOnBoot(isEnabled){
      //iterate over drives and run or iterate over and remove flags
      self.userdata.tabs.forEach(function(tab, index) {
        if (tab.wasRunning && isEnabled) {
          self.startFarming(null, index);
        } else if(tab.wasRunning && !isEnabled){
          tab.wasRunning = false;
        }
      });

      userdata.saveConfig(function(err) {
        if (err) {
          return window.alert(err.message);
        }
      });
    }

    this.showTab(this.current);

    ipc.on('selectDriveFromSysTray', function(ev, tabIndex){
      self.showTab(tabIndex);
    });

    ipc.on('storageDirectorySelected', function(ev, path) {
      self.userdata.tabs[self.current].storage.path = path[0];
      self.getFreeSpace();
      ipc.send('appSettingsChanged', JSON.stringify(userdata.toObject()));
    });

    ipc.on('toggleFarmer', function() {
      var isRunning = !!self.userdata.tabs[self.current].farmer;

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

  }
});

/**
 * Expose view objects
 * #exports
 */
module.exports = {
  updater: updater,
  about: about,
  appSettings: appSettings,
  main: main,
  footer: footer
};
