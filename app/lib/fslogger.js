/**
 * @module storjshare-gui/fslogs
 */

'use strict';

var fs = require('fs');
var assert = require('assert');
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var utils = require('./utils');
var path = require('path');


/**
 * Creates a logger and bind to view
 * @constructor
 */
function FsLogger(logfolder, prefix) {
  if (!(this instanceof FsLogger)) {
    return new FsLogger(logfolder, prefix);
  }

  //need to set defaults
  this._loglevel = 3;
  this._logfolder = (logfolder !== null && logfolder !== undefined) ? logfolder
    : require('os').tmpdir();

  this._prefix = (prefix !== null && prefix !== undefined) ? prefix + '_' : '';
  this._logfile = this._todaysFile();

  assert(utils.existsSync(this._logfolder), 'Invalid Log Folder');

  // Create log if no log exists
  if (!(utils.existsSync(this._logfile))) {
    this._newfile();
  }

  var self = this;
  this.log._logger = function() {
    var type = arguments[0];
    var timestamp = arguments[1];
    var message = arguments[2];

    if (self._shouldLog(type) === true) {
      self.log(type, timestamp, message);
    }
  };

  this.log.info = this.log._logger.bind(null, 'info');
  this.log.debug = this.log._logger.bind(null, 'debug');
  this.log.warn = this.log._logger.bind(null, 'warn');
  this.log.error = this.log._logger.bind(null, 'error');
  this.log.trace = this.log._logger.bind(null, 'trace');

  EventEmitter.call(this);

}

inherits(FsLogger, EventEmitter);

/**
 * Determine the path of the latest log file used today
 * #_todaysFile
 * @return {String} Returns path to last existing log file for today
 */
FsLogger.prototype._todaysFile = function() {

  var today = this._builddate();
  var logname = this._logfolder + path.sep + this._prefix + today;
  var filetype = '.log';

  return logname + filetype;
};

/**
 * Create new Log File
 * #_newfile
 * @return {Boolean} Returns true if success
 */
FsLogger.prototype._newfile = function() {
  var log = this._todaysFile();

  fs.writeFileSync(log, '['+new Date().getTime()+'] Log file created.');
  this._logfile = log;

  return true;
};

/**
 * Check if file exists
 * #_builddate
 * @return {String} String of date in the format of 1337-06-66
 */
FsLogger.prototype._builddate = function() {
  var dateObj = new Date();
  var month = dateObj.getMonth() + 1; //months from 1-12
  var day = dateObj.getDate();
  var year = dateObj.getFullYear();
  return year + '-' + month + '-' + day;
};

/**
 * Check if file exists
 * #_newfile
 * @param {String} log - full path of log file
 * @return {Boolean} True if file exists; false if not.
 */
FsLogger.prototype._doesFileExist = function(log) {
  try {
    fs.statSync(log);
  } catch(err) {
    return !(err && err.code === 'ENOENT');
  }

  if (log.indexOf(this._builddate()) === -1) {
    return false;
  }

  return true;
};

/**
 * Emit error event with fs functions fail
 * #_bubbleError
 * @param {String} err - Message to be emitted
 * @return {Void}
 */
FsLogger.prototype._bubbleError = function(err) {
  if (err) {
    this.emit('error', err);
  }
};

/**
 * Check log level settings
 * #_checkLogLevel
 * @return {Number} Return current log level setting
 */
FsLogger.prototype._checkLogLevel = function() {
  return this._loglevel;
};

/**
 * Set log level settings
 * #_setLogLevel
 * @param {Number} loglevel
 */
FsLogger.prototype.setLogLevel = function(loglevel) {
  this._loglevel = loglevel;
};

/**
 * Log error Message
 * #log
 * @param {String} type - error, warn, info, debug, trace
 * @param {String} timestamp - Time of log
 * @param {String} message - Message to be logged
 */
FsLogger.prototype.log = function(type, timestamp, message) {
  var log = '\n{' + type + '} [' + timestamp + '] ' + message;
  if (!(this._doesFileExist(this._logfile))){
    this._newfile();
  }
  fs.appendFile(this._logfile, log, this._bubbleError.bind(this));
};

/**
 * Determine if message should be logged
 * #_shouldLog
 * @param {String} type - error, warn, info, debug, trace
 */
FsLogger.prototype._shouldLog = function(type) {
  var level = this._loglevel;

  if (
    (type === 'error' && level >= 1) ||
    (type === 'warn' && level >= 2) ||
    (type === 'info' && level >= 3) ||
    (type === 'debug' && level >= 4) ||
    (type === 'trace' && level >= 5)
  ) {
    return true;
  }

  return false;
};

module.exports = FsLogger;
