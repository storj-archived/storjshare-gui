/**
 * @module storjshare-gui/fslogs
 */

'use strict';

var fs = require('fs');
var assert = require('assert');
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;


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
  this._logfile = this._useExistingFile();

  assert(fs.existsSync(this._logfolder), 'Invalid Log Folder');

  // Create log if no log exists
  if (!(this._doesFileExist(this._logfile))) {
    this._newfile(this._logfolder);
  }

  EventEmitter.call(this);

}

inherits(FsLogger, EventEmitter);

/**
 * Determine the path of the latest log file used today
 * #_useExistingFile
 * @return {String} Returns path to last existing log file for today
 */
FsLogger.prototype._useExistingFile = function() {

  var today = this._builddate();
  var logname = this._logfolder + '/' + this._prefix + today;
  var filetype = '.log';
  var counter = 0;
  var log = logname + filetype;
  var lastExistingLog = '';

  var check = this._doesFileExist(log);

  while (check === true) {
    counter++;
    lastExistingLog = log;
    log = logname + '-(' + counter + ')' + filetype;
    check = this._doesFileExist(log);
  }

  return lastExistingLog;
};

/**
 * Create new Log File
 * #_newfile
 * @return {Boolean} Returns true if success
 */
FsLogger.prototype._newfile = function() {

  var today = this._builddate();
  var logname = this._logfolder + '/' + this._prefix + today;
  var filetype = '.log';
  var counter = 0;
  var log = logname + filetype;

  var check = this._doesFileExist(log);

  while (check === true) {
    counter++;
    log = logname + '-(' + counter + ')' + filetype;
    check = this._doesFileExist(log);
  }

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
  var month = dateObj.getUTCMonth() + 1; //months from 1-12
  var day = dateObj.getUTCDate();
  var year = dateObj.getUTCFullYear();
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

  return true;
};

/**
 * Log trace Mesage
 * #trace
 * @param {String} message - Message to be logged
 * @return {Void}
 */
FsLogger.prototype.trace = function(message) {
  if (!(this._doesFileExist(this._logfile))){
    this._newfile();
  }
  if (this._checkLogLevel() >= 5) {
    fs.appendFile(this._logfile, message, this._bubbleError.bind(this));
  }
};

/**
 * Log debug Mesage
 * #debug
 * @param {String} message - Message to be logged
 * @return {Void}
 */
FsLogger.prototype.debug = function(message) {
  if (!(this._doesFileExist(this._logfile))){
    this._newfile();
  }
  if (this._checkLogLevel() >= 4) {
    fs.appendFile(this._logfile, message, this._bubbleError.bind(this));
  }
};

/**
 * Log info Mesage
 * #info
 * @param {String} message - Message to be logged
 * @return {Void}
 */
FsLogger.prototype.info = function(message) {
  if (!(this._doesFileExist(this._logfile))){
    this._newfile();
  }
  if (this._checkLogLevel() >= 3) {
    fs.appendFile(this._logfile, message, this._bubbleError.bind(this));
  }
};

/**
 * Log warn Mesage
 * #warn
 * @param {String} message - Message to be logged
 */
FsLogger.prototype.warn = function(message) {
  if (!(this._doesFileExist(this._logfile))){
    this._newfile();
  }
  if (this._checkLogLevel() >= 2) {
    fs.appendFile(this._logfile, message, this._bubbleError.bind(this));
  }
};

/**
 * Log error Mesage
 * #error
 * @param {String} message - Message to be logged
 * @return {Void}
 */
FsLogger.prototype.error = function(message) {
  if (!(this._doesFileExist(this._logfile))){
    this._newfile();
  }
  if (this._checkLogLevel() >= 1) {
    fs.appendFile(this._logfile, message, this._bubbleError.bind(this));
  }
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

  switch(type) {
    case 'info':
      this.info(log);
      break;
    case 'warn':
      this.warn(log);
      break;
    case 'error':
      this.error(log);
      break;
    case 'debug':
      this.debug(log);
      break;
    case 'trace':
      this.trace(log);
      break;
    default:
      this.info(log);
  }
};

module.exports = FsLogger;
