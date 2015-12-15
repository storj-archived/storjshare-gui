'use strict';

var proxyquire = require('proxyquire');
var Updater = require('../../lib/updater');
var expect = require('chai').expect;

describe('Updater', function() {

  describe('@constructor', function() {

    it('should create instance without the `new` keyword', function() {
      expect(Updater()).to.be.instanceOf(Updater);
    });

    it('should create instance with the `new` keyword', function() {
      expect(new Updater()).to.be.instanceOf(Updater);
    });

    it('should inherit from EventEmitter', function() {
      var updater = new Updater();
      expect(typeof updater.emit).to.equal('function');
      expect(typeof updater.removeListener).to.equal('function');
      expect(typeof updater.on).to.equal('function');
    });

  });

  describe('#check', function() {

    it('should fail if there is an error', function() {
      var Updater = proxyquire('../../lib/updater', {
        request: function(url, callback) {
          callback(new Error('Unknown error'), {}, null);
        }
      });
      var updater = new Updater();
      updater.once('error', function(err) {
        expect(err.message).to.equal('Unknown error');
      });
      updater.check();
    });

    it('should fail if there is a non-200 status code returned', function() {
      var Updater = proxyquire('../../lib/updater', {
        request: function(url, callback) {
          callback(null, { statusCode: 400 }, null);
        }
      });
      var updater = new Updater();
      updater.once('error', function(err) {
        expect(err.message).to.equal('Failed to check updates');
      });
      updater.check();
    });

    it('should fail if it cannot parse the body', function() {
      var Updater = proxyquire('../../lib/updater', {
        request: function(url, callback) {
          callback(null, { statusCode: 200 }, 'NOT JSON');
        }
      });
      var updater = new Updater();
      updater.once('error', function(err) {
        expect(err.message).to.equal('Failed to parse update info');
      });
      updater.check();
    });

    it('should not emit if version not greater than current', function(done) {
      var Updater = proxyquire('../../lib/updater', {
        request: function(url, callback) {
          callback(null, { statusCode: 200 }, [
            { html_url: '', tag_name: '0.0.0' }
          ]);
        }
      });
      var updater = new Updater();
      updater.once('update_available', function() {
        throw new Error();
      });
      updater.check();
      setImmediate(done);
    });

    it('should emit if the version is greater than current', function(done) {
      var Updater = proxyquire('../../lib/updater', {
        request: function(url, callback) {
          callback(null, { statusCode: 200 }, [
            { html_url: '', tag_name: '100.0.0' }
          ]);
        }
      });
      var updater = new Updater();
      updater.once('update_available', function() {
        done();
      });
      updater.check();
    });

  });

});
