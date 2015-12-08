'use strict';

var expect = require('chai').expect;
var Logger = require('../../lib/logger');

describe('Logger', function() {

  describe('@constructor', function() {

    it('should create an instance without the `new` keyword', function() {
      expect(Logger()).to.be.instanceOf(Logger);
    });

    it('should create an instance with the `new` keyword', function() {
      expect(new Logger()).to.be.instanceOf(Logger);
    });

    it('should inherit from EventEmitter', function() {
      var logger = new Logger();
      expect(typeof logger.emit).to.equal('function');
      expect(typeof logger.removeListener).to.equal('function');
      expect(typeof logger.on).to.equal('function');
    });

    it('should start with empty output', function() {
      var logger = new Logger();
      expect(logger._output).to.equal('');
    });

    it('should set maximum length correctly', function() {
      var logger = new Logger();
      expect(logger._maxLength).to.equal(65536);
    });

  });

  describe('#_realize', function() {

    it('should emit a `log` event', function(done) {
      var logger = new Logger();
      logger.once('log', done);
      logger._realize();
    });

    it('should trim the output to the max length', function() {
      var logger = new Logger();
      logger._output = (new Array(600)).join(new Array(200).join('0') + '\n');
      logger._realize();
      expect(logger._output.length).to.be.lessThan(logger._maxLength);
    });

  });

  describe('#append', function() {

    it('should add the log record to the end of the output', function() {
      var logger = new Logger();
      logger.append('one');
      logger.append('two');
      logger.append('three');
      var entries = logger._output.split('\n');
      expect(entries[0]).to.equal('one');
      expect(entries[1]).to.equal('two');
      expect(entries[2]).to.equal('three');
    });

  });

  describe('#prepend', function() {

    it('should add the log record to the beginning of the output', function() {
      var logger = new Logger();
      logger.prepend('one');
      logger.prepend('two');
      logger.prepend('three');
      var entries = logger._output.split('\n');
      expect(entries[2]).to.equal('one');
      expect(entries[1]).to.equal('two');
      expect(entries[0]).to.equal('three');
    });

  });

  describe('#clear', function() {

    it('should empty the logger output', function() {
      var logger = new Logger();
      logger._output = 'g0rd0n w45 h3r3';
      logger.clear();
      expect(logger._output).to.equal('');
    });

  });

});
