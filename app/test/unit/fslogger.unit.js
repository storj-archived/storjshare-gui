'use strict';

var expect = require('chai').expect;
var FsLogger = require('../../lib/fslogger');

describe('FsLogger', function() {

  describe('@constructor', function() {
    it('should create an instance without the `new` keyword', function() {
      expect(FsLogger()).to.be.instanceOf(FsLogger);
    });

    it('should create an instance with the `new` keyword', function() {
      expect(new FsLogger()).to.be.instanceOf(FsLogger);
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
