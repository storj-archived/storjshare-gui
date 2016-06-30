'use strict';

var expect = require('chai').expect;
var proxyquire = require('proxyquire');
var FsLogger = require('../../lib/fslogger');
var sinon = require('sinon');

describe('FsLogger', function() {

  describe('@constructor', function() {
    it('should create an instance without the `new` keyword', function() {
      expect(FsLogger()).to.be.instanceOf(FsLogger);
    });

    it('should create an instance with the `new` keyword', function() {
      expect(new FsLogger()).to.be.instanceOf(FsLogger);
    });

    it('should start with default logging level and locations', function() {
      var logger = new FsLogger();
      expect(logger._loglevel).to.not.be.null;
      expect(logger._loglevel).to.equal(3);

      expect(logger._logfolder).to.not.be.null;
      expect(logger._logfolder).to.not.equal('');

      expect(logger._logfile).to.not.be.null;
      expect(logger._logfile).to.not.equal('');
    });

    it('should use the os tmp folder if no parameters are passed', function() {
      var logger = new FsLogger();
      expect(logger._logfolder).to.equal(require('os').tmpdir());
    });

    it('should use the log folder passed to FsLogger for files', function() {
      var StubbedLogger = proxyquire('../../lib/fslogger', {
        fs: {
          existsSync: sinon.stub().returns(true)
        },
        _doesFileExist: sinon.stub().returns(true),
        _useExistingFile: sinon.stub().returns("/fake/file.log"),
        _newfile: sinon.stub()
      });
      var path = 'path/to/logs'
      var logger = new StubbedLogger(path);
      expect(logger._logfolder).to.equal(path);
    });

    it('should create a new log file if log does not exist', function() {
      var logger = new FsLogger();
      //asset newfile was called
    });
  });

  describe('#_useExistingFile', function() {

  });
  describe('#_newfile', function() {

  });
  describe('#_builddate', function() {

  });
  describe('#_doesFileExist', function() {

  });
  describe('#_checkLogLevel', function() {

  });
  describe('#setLogLevel', function() {

  });
  describe('#log', function() {

  });
  describe('#trace', function() {

  });
  describe('#debug', function() {

  });
  describe('#info', function() {

  });
  describe('#warn', function() {

  });
  describe('#error', function() {

  });
});
