'use strict';

var os = require('os');
var expect = require('chai').expect;
var proxyquire = require('proxyquire');
var sinon = require('sinon');
var UserData = require('../../lib/userdata');
var Tab = require('../../lib/tab');

describe('UserData', function() {

  describe('@constructor', function() {

    var _read = sinon.spy(UserData.prototype, '_read');

    it('should create instance without the `new` keyword', function() {
      expect(UserData(os.tmpdir())).to.be.instanceOf(UserData);
    });

    it('should create instance with the `new` keyword', function() {
      expect(new UserData(os.tmpdir())).to.be.instanceOf(UserData);
    });

    it('should call the internal _read method', function() {
      UserData(os.tmpdir());
      expect(_read.called).to.equal(true);
    });

  });

  describe('#_read', function() {

    it('should create a default config if it does not exist', function() {
      var _existsSync = function(path) {
        return path === os.tmpdir();
      };
      var _writeFileSync = sinon.stub();
      var _readFileSync = function() {
        return '{"tabs":[]}';
      };
      var UserData = proxyquire('../../lib/userdata', {
        fs: {
          existsSync: _existsSync,
          writeFileSync: _writeFileSync,
          readFileSync: _readFileSync,
        }
      });
      UserData(os.tmpdir());
      expect(_writeFileSync.called).to.equal(true);
    });

    it('should migrate legacy config if needed', function() {
      var _existsSync = function() {
        return true;
      };
      var _readFileSync = function() {
        return JSON.stringify({
          payoutAddress: 'payoutAddress',
          dataservDirectory: 'dataservDirectory',
          dataservSize: 1,
          dataservSizeUnit: 'MB'
        });
      };
      var UserData = proxyquire('../../lib/userdata', {
        fs: {
          existsSync: _existsSync,
          readFileSync: _readFileSync
        }
      });
      var userdata = new UserData(os.tmpdir());
      expect(userdata._parsed.tabs).to.have.lengthOf(1);
    });

    it('should return an array of `Tab` instances', function() {
      var _existsSync = function() {
        return true;
      };
      var _readFileSync = function() {
        return JSON.stringify({
          tabs: [{
            address: 'test',
            storage: { path: '/tmp', size: 1, unit: 'MB' }
          }]
        });
      };
      var UserData = proxyquire('../../lib/userdata', {
        fs: {
          existsSync: _existsSync,
          readFileSync: _readFileSync
        }
      });
      var userdata = new UserData(os.tmpdir());
      expect(userdata._parsed.tabs[0]).to.be.instanceOf(Tab);
    });

  });

  describe('#_isLegacyConfig', function() {

    var userdata = new UserData(os.tmpdir());

    it('should return false for proper config', function() {
      expect(userdata._isLegacyConfig({
        tabs: []
      })).to.equal(false);
    });

    it('should return true for legacy config', function() {
      expect(userdata._isLegacyConfig({
        payoutAddress: 'payoutAddress',
        dataservDirectory: 'dataservDirectory',
        dataservSize: 1,
        dataservSizeUnit: 'MB'
      })).to.equal(true);
    });

  });

  describe('#_migrateLegacyConfig', function() {

    var userdata = new UserData(os.tmpdir());

    it('should convert legacy config to a proper one', function() {
      var conf = userdata._migrateLegacyConfig({
        payoutAddress: 'payoutAddress',
        dataservDirectory: 'dataservDirectory',
        dataservSize: 1,
        dataservSizeUnit: 'MB'
      });
      expect(conf.tabs).to.have.lengthOf(1);
      expect(conf.tabs[0]).to.be.instanceOf(Tab);
      expect(conf.tabs[0].address).to.equal('payoutAddress');
      expect(conf.tabs[0].storage.path).to.equal('dataservDirectory');
      expect(conf.tabs[0].storage.size).to.equal(1);
      expect(conf.tabs[0].storage.unit).to.equal('MB');
      expect(typeof conf.tabs[0].id).to.equal('string');
    });

  });

  describe('#_isValidDataservClient', function() {

    var userdata = new UserData(os.tmpdir());

    it('should return true if there is a _dataserv', function() {
      expect(userdata._isValidDataservClient()).to.equal(true);
    });

    it('should return false if there is no _dataserv', function() {
      userdata._dataserv = undefined;
      expect(userdata._isValidDataservClient()).to.equal(false);
    });

  });

  describe('#_isValidPayoutAddress', function() {

    var userdata = new UserData(os.tmpdir());

    it('should return true if there is an address', function() {
      expect(userdata._isValidPayoutAddress(
        '3HwoE3LBpQkRsghHLT7MCwFw9nRSYQwZhY'
      )).to.equal(true);
    });

    it('should return false if there is no address', function() {
      expect(userdata._isValidPayoutAddress()).to.equal(false);
    });

  });

  describe('#_isValidDataservDirectory', function() {

    var userdata = new UserData(os.tmpdir());

    it('should return true if the directory exists', function() {
      expect(userdata._isValidDataservDirectory(os.tmpdir())).to.equal(true);
    });

    it('should return false if the directory does not exist', function() {
      expect(userdata._isValidDataservDirectory('/N0P3')).to.equal(false);
    });

  });

  describe('#_isValidDataservSize', function() {

    var userdata = new UserData(os.tmpdir());

    it('should return true if the size is greater than 0', function() {
      expect(userdata._isValidDataservSize(1)).to.equal(true);
    });

    it('should return false if the size is 0', function() {
      expect(userdata._isValidDataservSize(0)).to.equal(false);
    });

    it('should return false if the size is not defined', function() {
      expect(userdata._isValidDataservSize()).to.equal(false);
    });

  });

  describe('#_queryFreeSpace', function() {

    it('should return a human readable string', function(done) {
      var UserData = proxyquire('../../lib/userdata', {
        diskspace: {
          check: function(path, callback) {
            callback(null, 1000000);
          }
        }
      });
      var userdata = new UserData(os.tmpdir());
      userdata._queryFreeSpace('MB', function(err, result) {
        expect(err).to.equal(null);
        expect(result).to.equal('1 MB');
        done();
      });
    });

    it('should report error if cannot read', function(done) {
      var UserData = proxyquire('../../lib/userdata', {
        diskspace: {
          check: function(path, callback) {
            callback(new Error());
          }
        }
      });
      var userdata = new UserData(os.tmpdir());
      userdata._queryFreeSpace('MB', function(err) {
        expect(err.message).to.equal('Invalid drive');
        done();
      });
    });

    it('should report error if cannot read', function(done) {
      var userdata = new UserData(os.tmpdir());
      userdata._queryFreeSpace('PB', function(err) {
        expect(err.message).to.equal('Invalid unit of measure');
        done();
      });
    });

  });

  describe('#validate', function() {

    var userdata = new UserData(os.tmpdir());

    userdata._parsed = {
      tabs: [Tab()]
    };

    var isTrue = function() { return true; };
    var _v1 = sinon.stub(userdata, '_isValidPayoutAddress', isTrue);
    var _v2 = sinon.stub(userdata, '_isValidDataservDirectory', isTrue);
    var _v3 = sinon.stub(userdata, '_isValidDataservSize', isTrue);

    it('should call all validation methods', function() {
      userdata.validate(0);
      expect(_v1.called).to.equal(true);
      expect(_v2.called).to.equal(true);
      expect(_v3.called).to.equal(true);
      _v1.restore();
      _v2.restore();
      _v3.restore();
    });

  });

  describe('#getBalance', function() {

    it('should return error if invalid address', function(done) {
      var userdata = new UserData(os.tmpdir());
      userdata.getBalance('', function(err) {
        expect(err.message).to.equal('Invalid payout address');
        done();
      });
    });

    it('should bubble up request error', function(done) {
      var UserData =  proxyquire('../../lib/userdata', {
        request: function(options, callback) {
          callback(new Error('Unknown error'));
        }
      });
      var userdata = new UserData(os.tmpdir());
      userdata.getBalance(
        '3HwoE3LBpQkRsghHLT7MCwFw9nRSYQwZhY',
        function(err) {
          expect(err.message).to.equal('Unknown error');
          done();
        }
      );
    });

    it('should return error if the body indicates one', function(done) {
      var UserData =  proxyquire('../../lib/userdata', {
        request: function(options, callback) {
          callback(null, {}, { status: 'error', message: 'FAILED' });
        }
      });
      var userdata = new UserData(os.tmpdir());
      userdata.getBalance(
        '3HwoE3LBpQkRsghHLT7MCwFw9nRSYQwZhY',
        function(err) {
          expect(err.message).to.equal('FAILED');
          done();
        }
      );
    });

    it('should return balance in the body', function(done) {
      var UserData =  proxyquire('../../lib/userdata', {
        request: function(options, callback) {
          callback(null, {}, { data: [{ balance: 100 }] });
        }
      });
      var userdata = new UserData(os.tmpdir());
      userdata.getBalance(
        '3HwoE3LBpQkRsghHLT7MCwFw9nRSYQwZhY',
        function(err, balance) {
          expect(err).to.equal(null);
          expect(balance).to.equal(100);
          done();
        }
      );
    });

    it('should return 0 if no error and no balance', function(done) {
      var UserData =  proxyquire('../../lib/userdata', {
        request: function(options, callback) {
          callback(null, {}, { data: [] });
        }
      });
      var userdata = new UserData(os.tmpdir());
      userdata.getBalance(
        '3HwoE3LBpQkRsghHLT7MCwFw9nRSYQwZhY',
        function(err, balance) {
          expect(err).to.equal(null);
          expect(balance).to.equal(0);
          done();
        }
      );
    });

  });

  describe('#saveConfig', function() {
    var _existsSync = function() {
      return true;
    };
    var _readFileSync = function() {
      return JSON.stringify({ tabs: [] });
    };
    var _writeFile = sinon.stub();
    var UserData = proxyquire('../../lib/userdata', {
      fs: {
        existsSync: _existsSync,
        readFileSync: _readFileSync,
        writeFile: _writeFile
      }
    });
    var userdata = new UserData(os.tmpdir());
    userdata.saveConfig();
    expect(_writeFile.called).to.equal(true);
  });

});
