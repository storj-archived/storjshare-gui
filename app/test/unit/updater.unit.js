'use strict';

const proxyquire = require('proxyquire');
const expect = require('chai').expect;

describe('Updater', function() {

  describe('#checkForUpdates', function() {

    it('should fail if there is an error', function() {
      var updater = proxyquire('../../lib/updater', {
        request: function(url, callback) {
          callback(new Error('Unknown error'), {}, null);
        }
      });
      updater.once('error', function(err) {
        expect(err.message).to.equal('Unknown error');
      });
      updater.checkForUpdates();
    });

    it('should fail if there is a non-200 status code returned', function() {
      var updater = proxyquire('../../lib/updater', {
        request: function(url, callback) {
          callback(null, { statusCode: 400 }, null);
        }
      });
      updater.once('error', function(err) {
        expect(err.message).to.equal('Failed to check updates');
      });
      updater.checkForUpdates();
    });

    it('should fail if it cannot parse the body', function() {
      var updater = proxyquire('../../lib/updater', {
        request: function(url, callback) {
          callback(null, { statusCode: 200 }, 'NOT JSON');
        }
      });
      updater.once('error', function(err) {
        expect(err.message).to.equal('Failed to parse update info');
      });
      updater.checkForUpdates();
    });

    it('should not emit if version not greater than current', function(done) {
      var updater = proxyquire('../../lib/updater', {
        request: function(url, callback) {
          callback(null, { statusCode: 200 }, [
            { html_url: '', tag_name: '0.0.0' }
          ]);
        }
      });
      updater.once('update_available', function() {
        throw new Error();
      });
      updater.checkForUpdates();
      setImmediate(done);
    });

    it('should emit if the version is greater than current', function(done) {
      var updater = proxyquire('../../lib/updater', {
        request: function(url, callback) {
          callback(null, { statusCode: 200 }, [
            { html_url: '', tag_name: '100.0.0' }
          ]);
        }
      });
      updater.once('update_available', function() {
        done();
      });
      updater.checkForUpdates();
    });

  });

});
