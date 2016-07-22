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
var Monitor = storj.Monitor;
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

      if (window.confirm('You must quit Storj Share to upgrade. Continue?')) {
        shell.openExternal(this.releaseURL);
        app.quit();
      }

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
 * Main View
 */
var main = new Vue({
  el: '#main',
  data: {
    userdata: userdata._parsed,
    current: 0,
    transitioning: false,
    freespace: {size: 0, unit: 'B'},
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
    addTab: function(event) {
      if (event) {
        event.preventDefault();
      }
      this.showTab(this.userdata.tabs.push(new Tab()) - 1);
      ipc.send('appSettingsChanged', JSON.stringify(userdata.toObject()));
    },
    showTab: function(index) {
      var self = this;

      // create Tab If None Found
      if (!self.userdata.tabs[index]) {
        return self.addTab();
      }

      // set Previous Tab To Inactive
      if (self.userdata.tabs[self.current]) {
        self.userdata.tabs[self.current].active = false;
      }

      self.transitioning = false;

      if (index === -1) {
        this.current = 0;

        if (!this.userdata.tabs[this.current]) {
          this.addTab();
        }
      } else {
        this.current = index;
        this.userdata.tabs[this.current].active = true;
      }

      this.getBalance(this.userdata.tabs[this.current]);
      this.getFreeSpace(this.userdata.tabs[this.current]);
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
      var appSettings = this.userdata.appSettings;
      var fslogger;

      try {
        fslogger = new FsLogger(appSettings.logFolder, 'Drive-'+current);
      } catch (err) {
        tab.wasRunning = false;
        return window.alert(err.message);
      }

      fslogger.setLogLevel(Number(appSettings.logLevel));

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

      tab.telemetry = { enabled: appSettings.reportTelemetry };

      var logger = new Logger(Number(appSettings.logLevel));
      var reporter = new TelemetryReporter(
        'https://status.storj.io',
        storj.KeyPair(tab.key)
      );
      var farmerconf = {
        keypair: storj.KeyPair(tab.key),
        payment: { address: tab.getAddress() },
        storage: tab.storage,
        address: tab.network.hostname,
        port: Number(tab.network.port),
        noforward: tab.network.nat === 'false',
        logger: logger,
        tunport: Number(tab.tunnels.tcpPort),
        tunnels: Number(tab.tunnels.numConnections),
        gateways: {
          min: Number(tab.tunnels.startPort),
          max: Number(tab.tunnels.endPort)
        },
        seeds: tab.network.seed ? [tab.network.seed] : []
      };
      var farmer = new storj.FarmerInterface(farmerconf);

      var contractCountKey = 'contractCount_' + tab.id;
      var contracts = localStorage.getItem(contractCountKey);
      if (contracts === null || Number(contracts) === 0 ) {
        self.readingshards = true;
        $('#loading').modal('show');

        Monitor.getContractsDetails(farmer, function(err, stats) {
          localStorage.setItem(
            contractCountKey, stats.contracts.total.toString()
          );
          tab.contracts.total += stats.contracts.total;
          $('#loading').modal('hide');
        });
      } else {
        tab.contracts.total = Number(contracts);
      }

      // Update by drive
      farmer._manager._storage.on('add',function(item){
        var contracts = Number(localStorage.getItem(contractCountKey));
        contracts += Object.keys(item.contracts).length;
        localStorage.setItem(contractCountKey, contracts.toString());
        tab.contracts.total = contracts;
      });

      farmer._manager._storage.on('update',function(previous, next){
        var contracts = Number(localStorage.getItem(contractCountKey));
        previous = Object.keys(previous.contracts).length;
        next = Object.keys(next.contracts).length;
        contracts += next - previous;
        localStorage.setItem(contractCountKey, contracts.toString());
        tab.contracts.total = contracts;
      });

      farmer._manager._storage.on('delete',function(item){
        var contracts = Number(localStorage.getItem(contractCountKey));
        contracts -= Object.keys(item.contracts).length;
        localStorage.setItem(contractCountKey, contracts.toString());
        tab.contracts.total = contracts;
      });

      tab.farmer = function() {
        return farmer;
      };

      tab.reporter = function() {
        return reporter;
      };

      logger.on('log', function(data) {
        fslogger.log(data.level, data.timestamp, data.message);
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
            logger.error(err.message);
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
        tab.farmer().leave(function() {
          if (self.userdata.appSettings.reportTelemetry) {
            self.stopReportingTelemetry(tab);
          }

          tab.farmer = null;
        });
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
              payment: tab.getAddress()
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
    updateTabStats: function(tab, farmer) {

      if (!farmer) {
        return;
      }

      Monitor.getConnectedPeers(farmer, function(err, stats) {
        tab.connectedPeers = stats.peers.connected;
      });

      var used = utils.manualConvert(
        {size: tab.usedspace.size, unit: tab.usedspace.unit},
          'B'
        ).size;

      var allocated = utils.manualConvert(
        {size: tab.storage.size, unit: tab.storage.unit},
          'B'
        ).size;

      var spaceUsedPerc = used / allocated;
      spaceUsedPerc = (spaceUsedPerc > 1) ? 1 : spaceUsedPerc;

      tab.spaceUsedPercent = Number.isNaN(spaceUsedPerc) ?
                             '0' :
                             Math.round(spaceUsedPerc * 100);
    },
    getDiskUsage: function(tab, farmer) {

      if (!farmer) {
        return;
      }

      Monitor.getDiskUtilization(farmer, function(err, stats) {
        var used = {size: stats.disk.used, unit: 'B'};
        var remaining = {size: stats.disk.free, unit: 'B'};

        tab.usedspace = utils.autoConvert(used);
        tab.remainingspace = utils.autoConvert(remaining);
      });

    },
    getBalance: function(tab) {
      var self = this;

      if (!tab.address) {
        this.balance.qualified = false;
        return;
      }

      Monitor.getPaymentAddressBalances({
       _keypair: storj.KeyPair(tab.key),
       _options: { payment: { address: tab.getAddress() } }
      }, function(err, stats) {
       self.balance.sjcx = stats.payments.balances.sjcx || 0;
       self.balance.sjct = stats.payments.balances.sjct || 0;
       self.balance.qualified = true;
      });

    },
    getFreeSpace: function(tab) {
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
      var freespace = utils.autoConvert({size: free, unit: 'B'});
      this.freespace = freespace;
    }
  },
  created: function() {
    var self = this;
    $('.container').addClass('visible');

    //If terms not acceped before
    var terms = JSON.parse(localStorage.getItem('terms'));
    if (terms === null || terms.accepted !== true ) {
      $('#terms').modal('show');
    }

    if (!this.userdata.tabs.length) {
      this.addTab();
    } else {
      handleRunDrivesOnBoot(this.userdata.appSettings.runDrivesOnBoot);
    }

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

    setInterval(function() {
      var tab = self.userdata.tabs[self.current];
      self.getFreeSpace(tab);
      self.getBalance(tab);
      var farmer = typeof tab.farmer === 'function' ? tab.farmer() : null;
      if (farmer) {
        self.getDiskUsage(tab, farmer);
        self.updateTabStats(tab, farmer);
      }
    }, 3000);

    ipc.on('selectDriveFromSysTray', function(ev, tabIndex){
      self.showTab(tabIndex);
    });

    ipc.on('storageDirectorySelected', function(ev, path) {
      self.userdata.tabs[self.current].storage.path = path[0];
      self.getFreeSpace(this.userdata.tabs[this.current]);
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
 * App Settings View
 */
var appSettings = new Vue({
  el:'#settings',
  data: {
    userdata: userdata._parsed,
    current: main.current
  },
  methods: {
    changeSettings: function() {
      ipc.send('appSettingsChanged', JSON.stringify(userdata.toObject()));
      userdata.saveConfig(function(err) {
        if (err) {
          return window.alert(err.message);
        }
      });
    },
    openLogFolder: function() {
      shell.openExternal('file://' + this.userdata.appSettings.logFolder);
    },
    selectLogFolder: function() {
      ipc.send('selectLogFolder');
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
    ipc.on('logFolderSelected', function(ev, path) {
      self.userdata.appSettings.logFolder = path[0];
      ipc.send('appSettingsChanged', JSON.stringify(userdata.toObject()));
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

// appSettings.current updates to be equal to main.current
main.$watch('current', function(val) {
  appSettings.current = val;
});

/**
 * Footer View
 */
var footer = new Vue({
  el: '#footer',
  data: {
    userdata: userdata._parsed
  },
  methods: {
    openLogFolder: function() {
      shell.openExternal('file://' + this.userdata.appSettings.logFolder);
    }
  }
});

/**
 * Terms View
 */
var terms;
terms = new Vue({
  el: '#terms',
  data: {
  },
  methods: {
    accepted: function() {
      localStorage.setItem('terms', JSON.stringify({ accepted: true }));
    }
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
