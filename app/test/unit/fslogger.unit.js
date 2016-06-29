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


  describe('#_newfile', function() {

  });
  describe('#_doesFileExist', function() {

  });
  describe('#_checkLogLevel', function() {

  });
  describe('#_trace', function() {

  });
  describe('#_debug', function() {

  });
  describe('#_info', function() {

  });
  describe('#_warn', function() {

  });
  describe('#_error', function() {

  });
});
