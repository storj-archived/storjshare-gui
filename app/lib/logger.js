/**
 * @module storjshare-gui/logs
 */

'use strict';

var events = require('events');
var util = require('util');

/**
 * Creates a logger and bind to view
 * @constructor
 */
function Logger() {
  if (!(this instanceof Logger)) {
    return new Logger();
  }

  events.EventEmitter.call(this);

  this._output = '';
  this._maxLength = 1048576 / 16; // approximately 1 MB of string memory
}

util.inherits(Logger, events.EventEmitter);

/**
 * Sets the logger output and trims if over maximum length
 * #_realize
 */
Logger.prototype._realize = function() {
  var entries = this._output.split('\n');

  while (this._output.length > this._maxLength) {
    entries.shift();
    this._output = entries.join('\n');
  }

  this.emit('log');
};

/**
 * Adds given message to the log output
 * #append
 * @param {String} record
 */
Logger.prototype.append = function(record) {
  this._output += record + '\n';
  this._realize();
};

/**
 * Inserts given message to the front of log output
 * #prepend
 * @param {String} record
 */
Logger.prototype.prepend = function(record) {
  this._output = record + '\n' + this._output;
  this._realize();
};

/**
 * Empties the logger output
 * #clear
 */
Logger.prototype.clear = function() {
  this._output = '';
  this._realize();
};

module.exports = Logger;
