'use strict'
const convert = require('bytes');

module.exports = {
  toUnit: function(bytes, unit) {
    return convert(Number(bytes), {unit: unit});
  },
  toBytes: function(str) {
    return convert.parse(String(str));
  },
  parseFloat: function(string) {
    return parseFloat(string);
  }
};
