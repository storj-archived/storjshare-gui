'use strict'
const convert = require('bytes');

module.exports = {
  toUnit: function(bytes, unit) {
    return convert(Number(bytes), {unit: unit});
  },
  parseFloat: function(string) {
    return parseFloat(string);
  }
};
