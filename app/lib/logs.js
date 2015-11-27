/**
 * @module driveshare-gui/logs
 */

'use strict';

var $ = require('jquery');
var ipc = require('electron-safe-ipc/guest');

/**
 * Creates a logger and bind to view
 * @constructor
 */
function Logger() {
  this._output = '';
  this._maxLength = 1048576 / 16; // approximately 1 MB of string memory
  this._view = $('#modalLogs');
  this._log = $('#modalLogsCode');
  this._showTrigger = $('#view-output');

  this._showTrigger.click(this.show.bind(this));
  ipc.on('showLogs', this.show.bind(this));
}

/**
 * Sets the logger output and trims if over maximum length
 * #_realize
 */
Logger.prototype._realize = function() {
  var index = this._output.indexOf('\n') + 1;

  if (this.output.length > this.maxLength) {
    this._output = this._output.substr(index, this._output.length);
  }

  this.log.text(this._output);
};

/**
 * Opens the logger window
 * #show
 * @param {Object} event - optional dom event to prevent
 */
Logger.prototype.show = function(event) {
  if (event) {
    event.preventDefault();
  }

  this.view.modal('show');
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

module.exports = new Logger();
module.exports.Logger = Logger;
