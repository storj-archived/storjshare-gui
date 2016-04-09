'use strict';

/**
 * @static {String} platform
 */
module.exports = (/^win/.test(process.platform)) ? 'win' :
  (/^darwin/.test(process.platform)) ? 'mac' :
  (/^linux/.test(process.platform))  ? 'lin' : null;
