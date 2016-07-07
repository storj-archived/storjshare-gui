'use strict';

var expect = require('chai').expect;
var proxyquire = require('proxyquire');
var FsLogger = require('../../lib/fslogger');
var sinon = require('sinon');
var assert = require('assert');

describe('FsLogger', function() {

  var StubbedLogger;
  var cStub;

  before(function () {
    cStub = sinon.stub(console, 'log');

    StubbedLogger = proxyquire('../../lib/fslogger', {
      fs: {
        existsSync: sinon.stub().returns(true),
        appendFile: sinon.stub(),
        writeFileSync: sinon.stub(),
      }
    });
  });

  describe('@constructor', function() {

    var newfile;
    var doesFileExist;
    var useExistingFile;

    before(function () {
      newfile = sinon.stub(StubbedLogger.prototype, '_newfile')
        .returns(true);
      doesFileExist = sinon.stub(StubbedLogger.prototype, '_doesFileExist')
        .returns(true);
      useExistingFile = sinon.stub(StubbedLogger.prototype, '_useExistingFile')
        .returns('hi.log');
    });

    it('should create an instance without the `new` keyword', function() {
      expect(FsLogger()).to.be.instanceOf(FsLogger);
    });

    it('should create an instance with the `new` keyword', function() {
      expect(new FsLogger()).to.be.instanceOf(FsLogger);
    });

    it('should start with default logging level and locations', function() {
      var logger = new StubbedLogger();
      assert.notEqual(logger._loglevel, null);
      assert.equal(logger._loglevel, 3);

      assert.notEqual(logger._logfolder, null);
      assert.notEqual(logger._logfolder, '');

      assert.notEqual(logger._logfile, null);
      assert.notEqual(logger._logfile, '');
    });

    it('should use the os tmp folder if no parameters are passed', function() {
      var logger = new StubbedLogger();
      expect(logger._logfolder).to.equal(require('os').tmpdir());
    });

    it('should add a prefix is specified', function() {
      var logger = new StubbedLogger('/hi', 'prefix');
      expect(logger._prefix).to.equal('prefix_');
    });

    it('should use the log folder passed to FsLogger for files', function() {
      var path = 'path/to/logs';

      var logger = new StubbedLogger(path);
      expect(logger._logfolder).to.equal(path);
    });

    it('should create a new log file if log does not exist', function() {
      var dFE = sinon.stub(FsLogger.prototype, '_doesFileExist').returns(false);
      var newfile = sinon.stub(FsLogger.prototype, '_newfile');
      FsLogger();
      newfile.restore();
      dFE.restore();

      assert.equal(newfile.called, true);
    });

    after(function() {
      newfile.restore();
      doesFileExist.restore();
      useExistingFile.restore();
    });
  });

  describe('#_newfile', function() {

    it('should create a new file if one does not exist', function() {
      var logger = new StubbedLogger();
      var check = logger._newfile();

      expect(check).to.equal(true);
    });

    it('should also create a new file if one already exists', function() {

      var logger = new StubbedLogger();
      var check = logger._newfile();
      expect(check).to.equal(true);

    });

  });

  describe('#_checkLogLevel', function() {
    it('should return the log level', function() {
      var logger = new StubbedLogger();
      expect(logger._checkLogLevel()).to.equal(3);
    });

  });
  
  describe('#setLogLevel', function() {
    it('should set the log level', function() {
      var logger = new StubbedLogger();
      logger.setLogLevel(1);
      expect(logger._loglevel).to.equal(1);
    });
  });

  describe('#log', function() {

    it('should call info', function() {
      var info = sinon.stub(StubbedLogger.prototype, 'info');
      var logger = new StubbedLogger();
      logger.log('info', '1', 'hi');
      info.restore();
      assert.equal(info.called, true);
    });

    it('should call warning', function() {
      var warn = sinon.stub(StubbedLogger.prototype, 'warn');
      var logger = new StubbedLogger();
      logger.log('warn', '1', 'hi');
      warn.restore();
      assert.equal(warn.called, true);
    });

    it('should call error', function() {
      var error = sinon.stub(StubbedLogger.prototype, 'error');
      var logger = new StubbedLogger();
      logger.log('error', '1', 'hi');
      error.restore();
      assert.equal(error.called, true);
    });

    it('should call debug', function() {
      var debug = sinon.stub(StubbedLogger.prototype, 'debug');
      var logger = new StubbedLogger();
      logger.log('debug', '1', 'hi');
      debug.restore();
      assert.equal(debug.called, true);
    });

    it('should call trace', function() {
      var trace = sinon.stub(StubbedLogger.prototype, 'trace');
      var logger = new StubbedLogger();
      logger.log('trace', '1', 'hi');
      trace.restore();
      assert.equal(trace.called, true);
    });

    it('should default info if type is unrecognized', function() {
      var info = sinon.stub(StubbedLogger.prototype, 'info');
      var logger = new StubbedLogger();
      logger.log('asdasd', '1', 'hi');
      info.restore();
      assert.equal(info.called, true);
    });

  });

  describe('#trace', function() {
    it('should call newfile if file does not already exist', function() {
      var newfile = sinon.stub(StubbedLogger.prototype, '_newfile')
        .returns(true);
      var dFE = sinon.stub(StubbedLogger.prototype, '_doesFileExist')
        .returns(true);
      dFE.restore();
      var logger = new StubbedLogger();
      dFE = sinon.stub(StubbedLogger.prototype, '_doesFileExist')
        .returns(false);
      logger.trace('hi');
      dFE.restore();
      assert.equal(newfile.called, true);
      newfile.restore();
    });
    it('should call append log if loglevel is 5 or higher', function() {
      var ll = sinon.stub(StubbedLogger.prototype, '_checkLogLevel').returns(5);
      var logger = new StubbedLogger();
      logger.trace('hi');
      ll.restore();
    });
    it('should not call append log if loglevel is lower than 5', function() {
      var ll = sinon.stub(StubbedLogger.prototype, '_checkLogLevel').returns(4);
      var logger = new StubbedLogger();
      logger.trace('hi');
      ll.restore();
    });
    it('should emit an error if ap pendFile fails', function(done) {
      var StubbedLogger2 = proxyquire('../../lib/fslogger', {
        fs: {
          existsSync: sinon.stub().returns(true),
          writeFileSync: sinon.stub(),
          appendFile: sinon.stub().callsArgWith(2, new Error('append error'))
        }
      });

      var ll = sinon.stub(StubbedLogger2.prototype, '_checkLogLevel')
        .returns(5);
      var logger = new StubbedLogger2();
      logger.on('error', function(err) {
        ll.restore();
        expect(err.message).to.equal('append error');
        done();
      });
      logger.trace('hi');
    });
  });

  describe('#debug', function() {
    it('should call newfile if file does not already exist', function() {
      var newfile = sinon.stub(StubbedLogger.prototype, '_newfile')
        .returns(true);
      var dFE = sinon.stub(StubbedLogger.prototype, '_doesFileExist')
        .returns(true);
      dFE.restore();
      var logger = new StubbedLogger();
      dFE = sinon.stub(StubbedLogger.prototype, '_doesFileExist')
        .returns(false);
      logger.debug('hi');
      dFE.restore();
      assert.equal(newfile.called, true);
      newfile.restore();
    });

    it('should call append log if loglevel is 4 or higher', function() {
      var ll = sinon.stub(StubbedLogger.prototype, '_checkLogLevel').returns(4);
      var logger = new StubbedLogger();
      logger.debug('hi');
      ll.restore();
    });

    it('should not call append log if loglevel is lower than 4', function() {
      var ll = sinon.stub(StubbedLogger.prototype, '_checkLogLevel').returns(3);
      var logger = new StubbedLogger();
      logger.debug('hi');
      ll.restore();
    });
    it('should emit an error if ap pendFile fails', function(done) {
      var StubbedLogger2 = proxyquire('../../lib/fslogger', {
        fs: {
          existsSync: sinon.stub().returns(true),
          writeFileSync: sinon.stub(),
          appendFile: sinon.stub().callsArgWith(2, new Error('append error'))
        }
      });

      var ll = sinon.stub(StubbedLogger2.prototype, '_checkLogLevel')
        .returns(4);
      var logger = new StubbedLogger2();
      logger.on('error', function(err) {
        ll.restore();
        expect(err.message).to.equal('append error');
        done();
      });
      logger.debug('hi');
    });
  });

  describe('#info', function() {

    it('should call newfile if file does not already exist', function() {
      var newfile = sinon.stub(StubbedLogger.prototype, '_newfile')
        .returns(true);
      var dFE = sinon.stub(StubbedLogger.prototype, '_doesFileExist')
        .returns(true);
      dFE.restore();
      var logger = new StubbedLogger();
      dFE = sinon.stub(StubbedLogger.prototype, '_doesFileExist')
        .returns(false);
      logger.info('hi');
      dFE.restore();
      assert.equal(newfile.called, true);
      newfile.restore();
    });

    it('should call append log if loglevel is 3 or higher', function() {
      var ll = sinon.stub(StubbedLogger.prototype, '_checkLogLevel').returns(3);
      var logger = new StubbedLogger();
      logger.info('hi');
      ll.restore();
    });

    it('should not call append log if loglevel is lower than 3', function() {
      var ll = sinon.stub(StubbedLogger.prototype, '_checkLogLevel').returns(2);
      var logger = new StubbedLogger();
      logger.info('hi');
      ll.restore();
    });
    it('should emit an error if ap pendFile fails', function(done) {
      var StubbedLogger2 = proxyquire('../../lib/fslogger', {
        fs: {
          existsSync: sinon.stub().returns(true),
          writeFileSync: sinon.stub(),
          appendFile: sinon.stub().callsArgWith(2, new Error('append error'))
        }
      });

      var ll = sinon.stub(StubbedLogger2.prototype, '_checkLogLevel')
        .returns(3);
      var logger = new StubbedLogger2();
      logger.on('error', function(err) {
        ll.restore();
        expect(err.message).to.equal('append error');
        done();
      });
      logger.info('hi');
    });
  });

  describe('#warn', function() {
    it('should call newfile if file does not already exist', function() {
      var newfile = sinon.stub(StubbedLogger.prototype, '_newfile')
        .returns(true);
      var dFE = sinon.stub(StubbedLogger.prototype, '_doesFileExist')
        .returns(true);
      dFE.restore();
      var logger = new StubbedLogger();
      dFE = sinon.stub(StubbedLogger.prototype, '_doesFileExist')
        .returns(false);
      logger.warn('hi');
      dFE.restore();
      assert.equal(newfile.called, true);
      newfile.restore();
    });
    it('should call append log if loglevel is 2 or higher', function() {
      var ll = sinon.stub(StubbedLogger.prototype, '_checkLogLevel').returns(2);
      var logger = new StubbedLogger();
      logger.warn('hi');
      ll.restore();
    });
    it('should not call append log if loglevel is lower than 2', function() {
      var ll = sinon.stub(StubbedLogger.prototype, '_checkLogLevel').returns(1);
      var logger = new StubbedLogger();
      logger.warn('hi');
      ll.restore();
    });
    it('should emit an error if ap pendFile fails', function(done) {
      var StubbedLogger2 = proxyquire('../../lib/fslogger', {
        fs: {
          existsSync: sinon.stub().returns(true),
          writeFileSync: sinon.stub(),
          appendFile: sinon.stub().callsArgWith(2, new Error('append error'))
        }
      });

      var ll = sinon.stub(StubbedLogger2.prototype, '_checkLogLevel')
        .returns(2);
      var logger = new StubbedLogger2();
      logger.on('error', function(err) {
        ll.restore();
        expect(err.message).to.equal('append error');
        done();
      });
      logger.warn('hi');
    });
  });

  describe('#error', function() {
    it('should call newfile if file does not already exist', function() {
      var newfile = sinon.stub(StubbedLogger.prototype, '_newfile')
        .returns(true);
      var dFE = sinon.stub(StubbedLogger.prototype, '_doesFileExist')
        .returns(true);
      dFE.restore();
      var logger = new StubbedLogger();
      dFE = sinon.stub(StubbedLogger.prototype, '_doesFileExist')
        .returns(false);
      logger.error('hi');
      dFE.restore();
      assert.equal(newfile.called, true);
      newfile.restore();
    });
    it('should call append log if loglevel is 1 or higher', function() {
      var ll = sinon.stub(StubbedLogger.prototype, '_checkLogLevel').returns(1);
      var logger = new StubbedLogger();
      logger.error('hi');
      ll.restore();
    });
    it('should not call append log if loglevel is lower than 1', function() {
      var ll = sinon.stub(StubbedLogger.prototype, '_checkLogLevel').returns(0);
      var logger = new StubbedLogger();
      logger.error('hi');
      ll.restore();
    });
    it('should emit an error if ap pendFile fails', function(done) {
      var StubbedLogger2 = proxyquire('../../lib/fslogger', {
        fs: {
          existsSync: sinon.stub().returns(true),
          writeFileSync: sinon.stub(),
          appendFile: sinon.stub().callsArgWith(2, new Error('append error'))
        }
      });

      var ll = sinon.stub(StubbedLogger2.prototype, '_checkLogLevel')
        .returns(1);
      var logger = new StubbedLogger2();
      logger.on('error', function(err) {
        ll.restore();
        expect(err.message).to.equal('append error');
        done();
      });
      logger.error('hi');
    });
  });

  after( function() {
    cStub.restore();
  });

});
