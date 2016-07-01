'use strict';

var expect = require('chai').expect;
var proxyquire = require('proxyquire');
var FsLogger = require('../../lib/fslogger');
var sinon = require('sinon');

describe('FsLogger', function() {

      var StubbedLogger;

      before(function () {
        StubbedLogger = proxyquire('../../lib/fslogger', {
          fs: {
            existsSync: sinon.stub().returns(true),
            appendFile: sinon.stub(),
            writeFileSync: sinon.stub()
          }
        });
      });

  describe('@constructor', function() {

    var newfile;
    var doesFileExist;
    var useExistingFile;

    before(function () {
      newfile = sinon.stub(StubbedLogger.prototype, '_newfile').returns(true);
      doesFileExist = sinon.stub(StubbedLogger.prototype, '_doesFileExist').returns(true);
      useExistingFile = sinon.stub(StubbedLogger.prototype, '_useExistingFile').returns('hi.log');
    });

    it('should create an instance without the `new` keyword', function() {
      expect(FsLogger()).to.be.instanceOf(FsLogger);
    });

    it('should create an instance with the `new` keyword', function() {
      expect(new FsLogger()).to.be.instanceOf(FsLogger);
    });

    it('should start with default logging level and locations', function() {
      var logger = new StubbedLogger();
      expect(logger._loglevel).to.not.be.null;
      expect(logger._loglevel).to.equal(3);

      expect(logger._logfolder).to.not.be.null;
      expect(logger._logfolder).to.not.equal('');

      expect(logger._logfile).to.not.be.null;
      expect(logger._logfile).to.not.equal('');
    });

    it('should use the os tmp folder if no parameters are passed', function() {
      var logger = new StubbedLogger();
      expect(logger._logfolder).to.equal(require('os').tmpdir());
    });

    it('should use the log folder passed to FsLogger for files', function() {
      var path = 'path/to/logs';

      var logger = new StubbedLogger(path);
      expect(logger._logfolder).to.equal(path);
    });

    it('should create a new log file if log does not exist', function() {
      var dFE = sinon.stub(FsLogger.prototype, '_doesFileExist').returns(false);
      var newfile = sinon.stub(FsLogger.prototype, '_newfile');
      var logger = new FsLogger();
      newfile.restore();
      dFE.restore();

      expect(newfile.called).to.be.true;
    });

    after(function() {
      newfile.restore();
      doesFileExist.restore();
      useExistingFile.restore();
    });
  });

  describe('#_newfile', function() {
    it('should create a new file if oine already exists', function() {
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
      expect(info.called).to.be.true;
    });

    it('should call warning', function() {
      var warn = sinon.stub(StubbedLogger.prototype, 'warn');
      var logger = new StubbedLogger();
      logger.log('warn', '1', 'hi');
      warn.restore();
      expect(warn.called).to.be.true;
    });

    it('should call error', function() {
      var error = sinon.stub(StubbedLogger.prototype, 'error');
      var logger = new StubbedLogger();
      logger.log('error', '1', 'hi');
      error.restore();
      expect(error.called).to.be.true;
    });

    it('should call debug', function() {
      var debug = sinon.stub(StubbedLogger.prototype, 'debug');
      var logger = new StubbedLogger();
      logger.log('debug', '1', 'hi');
      debug.restore();
      expect(debug.called).to.be.true;
    });

    it('should call trace', function() {
      var trace = sinon.stub(StubbedLogger.prototype, 'trace');
      var logger = new StubbedLogger();
      logger.log('trace', '1', 'hi');
      trace.restore();
      expect(trace.called).to.be.true;
    });

    it('should default info if type is unrecognized', function() {
      var info = sinon.stub(StubbedLogger.prototype, 'info');
      var logger = new StubbedLogger();
      logger.log('asdasd', '1', 'hi');
      info.restore();
      expect(info.called).to.be.true;
    });

  });

  describe('#trace', function() {
    it('should call newfile if file does not already exist', function() {
      var dFE = sinon.stub(StubbedLogger.prototype, '_doesFileExist')
        .returns(true);
      dFE.restore();
      var logger = new StubbedLogger();
      dFE = sinon.stub(StubbedLogger.prototype, '_doesFileExist')
        .returns(false);
      logger.trace('hi');
      dFE.restore();
      expect(logger._newfile).to.have.been.called;
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
  });

  describe('#debug', function() {
    it('should call newfile if file does not already exist', function() {
      var dFE = sinon.stub(StubbedLogger.prototype, '_doesFileExist')
        .returns(true);
      dFE.restore();
      var logger = new StubbedLogger();
      dFE = sinon.stub(StubbedLogger.prototype, '_doesFileExist')
        .returns(false);
      logger.debug('hi');
      dFE.restore();
      expect(logger._newfile).to.have.been.called;
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
  });

  describe('#info', function() {
    it('should call newfile if file does not already exist', function() {
      var dFE = sinon.stub(StubbedLogger.prototype, '_doesFileExist')
        .returns(true);
      dFE.restore();
      var logger = new StubbedLogger();
      dFE = sinon.stub(StubbedLogger.prototype, '_doesFileExist')
        .returns(false);
      logger.info('hi');
      dFE.restore();
      expect(logger._newfile).to.have.been.called;
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
  });

  describe('#warn', function() {
    it('should call newfile if file does not already exist', function() {
      var dFE = sinon.stub(StubbedLogger.prototype, '_doesFileExist')
        .returns(true);
      dFE.restore();
      var logger = new StubbedLogger();
      dFE = sinon.stub(StubbedLogger.prototype, '_doesFileExist')
        .returns(false);
      logger.warn('hi');
      dFE.restore();
      expect(logger._newfile).to.have.been.called;
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
  });

  describe('#error', function() {
    it('should call newfile if file does not already exist', function() {
      var dFE = sinon.stub(StubbedLogger.prototype, '_doesFileExist')
        .returns(true);
      dFE.restore();
      var logger = new StubbedLogger();
      dFE = sinon.stub(StubbedLogger.prototype, '_doesFileExist')
        .returns(false);
      logger.error('hi');
      dFE.restore();
      expect(logger._newfile).to.have.been.called;
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
  });

});
