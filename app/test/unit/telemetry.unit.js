'use strict';

var expect = require('chai').expect;
var proxyquire = require('proxyquire');
var storj = require('storj');
var TelemetryReporter = require('../../lib/telemetry');

describe('Telemetry', function() {

  describe('@constructor', function() {

    it('should create an instance with the new keyword', function() {
      var reporter = new TelemetryReporter(
        'https://service.uri',
        storj.KeyPair()
      );
      expect(reporter).to.be.instanceOf(TelemetryReporter);
    });

    it('should create an instance without the new keyword', function() {
      var reporter = TelemetryReporter(
        'https://service.uri',
        storj.KeyPair()
      );
      expect(reporter).to.be.instanceOf(TelemetryReporter);
    });

    it('should throw without a service uri', function() {
      expect(function() {
        TelemetryReporter(null, storj.KeyPair());
      }).to.throw(Error, 'Invalid service URI supplied');
    });

    it('should throw without a keypair', function() {
      expect(function() {
        TelemetryReporter('https://service.uri', null);
      }).to.throw(Error, 'Invalid keypair supplied');
    });

  });

  describe('#send', function() {

    it('should send the complete report as JSON-RPC', function(done) {
      var GoodTelemetryReporter = proxyquire('../../lib/telemetry', {
        request: function(opts, callback) {
          expect(opts.json.method).to.equal('REPORT');
          expect(TelemetryReporter.SCHEMA(opts.json.params)).to.equal(true);
          callback(null, { statusCode: 200 }, {
            id: opts.json.id,
            result: { success: true }
          });
        }
      });
      var reporter = new GoodTelemetryReporter(
        'https://service.uri',
        storj.KeyPair()
      );
      reporter.send({
        storage: {
          free: 4096,
          used: 1024
        },
        bandwidth: {
          upload: 12,
          download: 32
        },
        contact: {
          protocol: '0.0.0',
          address: '127.0.0.1',
          port: 1337,
          nodeID: reporter._keypair.getNodeID()
        },
        payment: reporter._keypair.getAddress()
      }, function(err, result) {
        expect(result.success).to.equal(true);
        done();
      });
    });

    it('should callback with an error if supplied', function(done) {
      var BadTelemetryReporter = proxyquire('../../lib/telemetry', {
        request: function(opts, callback) {
          callback(null, { statusCode: 500 }, {
            id: opts.json.id,
            result: {},
            error: {
              message: 'FAILED'
            }
          });
        }
      });
      var reporter = new BadTelemetryReporter(
        'https://service.uri',
        storj.KeyPair()
      );
      reporter.send({
        storage: {
          free: 4096,
          used: 1024
        },
        bandwidth: {
          upload: 12,
          download: 32
        },
        contact: {
          protocol: '0.0.0',
          address: '127.0.0.1',
          port: 1337,
          nodeID: reporter._keypair.getNodeID()
        },
        payment: reporter._keypair.getAddress()
      }, function(err) {
        expect(err.message).to.equal('FAILED');
        done();
      });
    });

    it('should callback with unknown error if not supplied', function(done) {
      var BadTelemetryReporter = proxyquire('../../lib/telemetry', {
        request: function(opts, callback) {
          callback(null, { statusCode: 500 });
        }
      });
      var reporter = new BadTelemetryReporter(
        'https://service.uri',
        storj.KeyPair()
      );
      reporter.send({
        storage: {
          free: 4096,
          used: 1024
        },
        bandwidth: {
          upload: 12,
          download: 32
        },
        contact: {
          protocol: '0.0.0',
          address: '127.0.0.1',
          port: 1337,
          nodeID: reporter._keypair.getNodeID()
        },
        payment: reporter._keypair.getAddress()
      }, function(err) {
        expect(err.message).to.equal('Unknown error response');
        done();
      });
    });

    it('should callback with connection error', function(done) {
      var BadTelemetryReporter = proxyquire('../../lib/telemetry', {
        request: function(opts, callback) {
          callback(new Error('ECONNREFUSED'));
        }
      });
      var reporter = new BadTelemetryReporter(
        'https://service.uri',
        storj.KeyPair()
      );
      reporter.send({
        storage: {
          free: 4096,
          used: 1024
        },
        bandwidth: {
          upload: 12,
          download: 32
        },
        contact: {
          protocol: '0.0.0',
          address: '127.0.0.1',
          port: 1337,
          nodeID: reporter._keypair.getNodeID()
        },
        payment: reporter._keypair.getAddress()
      }, function(err) {
        expect(err.message).to.equal('ECONNREFUSED');
        done();
      });
    });

    it('should fail to validate the report', function(done) {
      var reporter = new TelemetryReporter(
        'https://service.uri',
        storj.KeyPair()
      );
      reporter.send({
        storage: {
          free: 'invalid',
          used: 1024
        },
        bandwidth: {
          upload: 12,
          download: 32
        },
        contact: {
          protocol: '0.0.0',
          address: '127.0.0.1',
          port: 1337,
          nodeID: reporter._keypair.getNodeID()
        },
        payment: reporter._keypair.getAddress()
      }, function(err) {
        expect(err.message).to.equal('Invalid report supplied');
        done();
      });
    });

  });

});
