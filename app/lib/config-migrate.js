'use strict';

const { homedir } = require('os');
const mkdirpsync = require('./mkdirpsync');
const path = require('path');
const { writeFileSync, readFileSync } = require('fs');
const logdir = path.join(homedir(), '.config/storjshare/logs');
const storj = require('storj-lib');


/**
 * Read a config file, check if it's legacy
 * @function
 * @param {string} filePath
 */
exports.isLegacyConfig = function(filePath) {
  let config = null;

  try {
    config = JSON.parse(readFileSync(filePath).toString());
  } catch (e) {
    return false;
  }

  return Object.keys(config).includes('tabs');
};

/**
 * Convert the config file into the new format in place
 * @function
 * @param {string} filePath
 * @returns {string[]}
 */
exports.convertLegacyConfig = function(filePath) {
  const dir = path.dirname(filePath);
  const config = JSON.parse(readFileSync(filePath).toString());

  function convertTab(tabConf) {
    const id = storj.KeyPair(tabConf.key).getNodeID();

    mkdirpsync(tabConf.storage.dataDir);
    mkdirpsync(logdir);

    return {
      paymentAddress: tabConf.address,
      opcodeSubscriptions: [
        '0f01020202',
        '0f02020202',
        '0f03020202'
      ],
      maxOfferConcurrency: 3,
      bridgeUri: 'https://api.storj.io',
      seedList: [],
      rpcAddress: tabConf.network.hostname,
      rpcPort: tabConf.network.port,
      doNotTraverseNat: tabConf.network.nat === 'true'
        ? false
        : true,
      maxTunnels: 3,
      maxConnections: 150,
      tunnelGatewayRange: {
        min: tabConf.tunnels.startPort,
        max: tabConf.tunnels.endPort
      },
      joinRetry: {
        times: 3,
        interval: 5000
      },
      offerBackoffLimit: 4,
      networkPrivateKey: tabConf.key,
      loggerVerbosity: 3,
      loggerOutputFile: logdir,
      storagePath: tabConf.storage.dataDir,
      storageAllocation: `${tabConf.storage.size}${tabConf.storage.unit}`
    };
  }

  return config.tabs.map((tabConf) => {
    let converted = convertTab(tabConf);
    let file = path.join(dir, `${tabConf.id}.json`);

    writeFileSync(file, JSON.stringify(converted, null, 2));

    return file;
  });
};
