'use strict';

var storj = require('storj');
var portastic = require('portastic');
var JSONLogger = require('kad-logger-json');

/**
 * Returns a new Storj farmer
 * @param {Tab} tab
 * @param {Function} callback
 * @returns {storj.Network}
 */
module.exports.createFarmer = function(tab, callback) {
  var keypair = storj.KeyPair(tab.key);
  var store = storj.FSStorageAdapter(tab.storage.path);
  var manager = storj.Manager(store);

  portastic.find({ min: 4000, max: 4999 }).then(function(ports) {
    var logger = new JSONLogger();
    var farmer = storj.Network({
      keypair: keypair,
      manager: manager,
      contact: {
        address: '127.0.0.1', // TODO: Be smarter about this
        port: ports.pop()
      },
      seeds: [
        'storj://api.metadisk.org:8443/593844dc7f0076a1aeda9a6b9788af17e67c1052'
      ],
      logger: logger,
      datadir: tab.storage.path,
      farmer: [
        // TODO: Make configurable
        '01020202',
        '02020202',
        '03020202'
      ]
    });

    tab.farmer = function() {
      return farmer;
    };

    logger.on('log', function(data) {
      tab.logs.append(
        '<div><span class="' + data.type + '">{' + data.type + '}</span> ' +
        '<span class="ts">[' + data.timestamp + ']</span></div>' +
        '<div><em>' + data.message + '</em></div>'
      );
    });

    callback(null, tab.farmer);
  });
};
