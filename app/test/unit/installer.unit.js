'use strict';

var os = require('os');
var proxyquire = require('proxyquire');
var expect = require('chai').expect;
var sinon = require('sinon');
var Installer = require('../../lib/installer');
var tmpdir = os.tmpdir();
var EventEmitter = require('events').EventEmitter;

describe('DataServInstaller', function() {

  describe('@constructor', function() {

    it('should create instance without the `new` keyword', function() {
      expect(Installer(tmpdir)).to.be.instanceOf(Installer);
    });

    it('should create instance with the `new` keyword', function() {
      expect(new Installer(tmpdir)).to.be.instanceOf(Installer);
    });

    it('should throw with an invalid data directory', function() {
      expect(function() {
        Installer(null);
      }).to.throw(Error);
    });

    it('should inherit from EventEmitter', function() {
      var installer = new Installer(tmpdir);
      expect(typeof installer.emit).to.equal('function');
      expect(typeof installer.removeListener).to.equal('function');
      expect(typeof installer.on).to.equal('function');
    });

  });

  describe('#install', function() {

    it('should emit an error if platform is not supported', function(done) {
      var installer = new Installer(tmpdir);
      installer._platform = 'windoze';
      installer.once('error', function(err) {
        expect(err.message).to.equal('This platform is not supported');
        done();
      });
      installer.install();
    });

    it('should emit error on gnu/linux if not installed', function(done) {
      var installer = new Installer(tmpdir);
      installer._platform = 'linux';
      var _check = sinon.stub(installer._targets.linux, 'check', function(cb) {
        cb(null, false);
      });
      installer.once('error', function(err) {
        expect(err.message).to.equal(
          'Dependencies must be installed via APT on GNU/Linux'
        );
        done();
      });
      installer.install();
    });

    it('should not install if already installed', function(done) {
      var installer = new Installer(tmpdir);
      installer._platform = 'win32';
      var _check = sinon.stub(installer._targets.win32, 'check', function(cb) {
        cb(null, true);
      });
      var _install = sinon.stub(installer._targets.win32, 'install');
      installer.once('end', function() {
        expect(_install.called).to.equal(false);
        _check.restore();
        _install.restore();
        done();
      });
      installer.install();
    });

    it('should call the private install method', function(done) {
      var installer = new Installer(tmpdir);
      installer._platform = 'darwin';
      var _check = sinon.stub(installer._targets.darwin, 'check', function(cb) {
        cb(null, false);
      });
      var _inst = sinon.stub(installer._targets.darwin, 'install', function() {
        installer.emit('end');
      });
      installer.once('end', function() {
        expect(_inst.called).to.equal(true);
        _check.restore();
        _inst.restore();
        done();
      });
      installer.install();
    });

    it('should return error if check fails', function(done) {
      var installer = new Installer(tmpdir);
      installer._platform = 'linux';
      var _check = sinon.stub(installer._targets.linux, 'check', function(cb) {
        cb(new Error('Failed'));
      });
      installer.once('error', function(err) {
        expect(err.message).to.equal('Failed');
        _check.restore();
        done();
      });
      installer.install();
    });

  });

  describe('#check', function() {

    it('should return an error is platfrom not supported', function(done) {
      var installer = new Installer(tmpdir);
      installer._platform = 'windoze';
      installer.check(function(err) {
        expect(err.message).to.equal('This platform is not supported');
        done();
      });
    });

    it('should call the platform checker', function(done) {
      var installer = new Installer(tmpdir);
      var _check = sinon.stub(installer._targets.darwin, 'check', function(cb) {
        cb(null, true);
      });
      installer._platform = 'darwin';
      installer.check(function(err, installed) {
        expect(err).to.equal(null);
        expect(installed).to.equal(true);
        _check.restore();
        done();
      });
    });

  });

  describe('#getDataServClientPath', function() {

    it('should return the path to the dataserv client', function() {
      var installer = new Installer(tmpdir);
      installer._platform = 'linux';
      var dspath = installer.getDataServClientPath();
      expect(dspath).to.equal('dataserv-client');
    });

  });

  describe('#_installMacintosh', function() {

    it('should download and extract the binary', function(done) {
      var _chmodSync = sinon.stub();
      var Installer = proxyquire('../../lib/installer', {
        'fs-extra': {
          chmodSync: _chmodSync
        }
      });
      var installer = new Installer(tmpdir);
      var _dlx = sinon.stub(installer, '_downloadAndExtract').callsArg(0);
      installer.once('end', function() {
        expect(_dlx.called).to.equal(true);
        _dlx.restore();
        done();
      });
      installer._installMacintosh();
    });

    it('should make the resulting path exectuable', function(done) {
      var _chmodSync = sinon.stub();
      var Installer = proxyquire('../../lib/installer', {
        'fs-extra': {
          chmodSync: _chmodSync
        }
      });
      var installer = new Installer(tmpdir);
      var _dlx = sinon.stub(installer, '_downloadAndExtract').callsArg(0);
      installer.once('end', function() {
        expect(_dlx.called).to.equal(true);
        expect(_chmodSync.called).to.equal(true);
        _dlx.restore();
        done();
      });
      installer._installMacintosh();
    });

  });

  describe('#_installWindows', function() {

    it('should download and extract the binary', function(done) {
      var installer = new Installer(tmpdir);
      var _dlx = sinon.stub(installer, '_downloadAndExtract').callsArg(0);
      installer.once('end', function() {
        expect(_dlx.called).to.equal(true);
        _dlx.restore();
        done();
      });
      installer._installWindows();
    });

  });

  describe('#_checkGnuLinux', function() {

    it('should return false if `which` fails', function(done) {
      var _exec = sinon.stub().callsArgWith(1, new Error('Failed'));
      var Installer = proxyquire('../../lib/installer', {
        child_process: {
          exec: _exec
        }
      });
      var installer = new Installer(tmpdir);
      installer._checkGnuLinux(function(err, installed) {
        expect(installed).to.equal(false);
        done();
      });
    });

    it('should return false if `which` reports missing', function(done) {
      var _exec = sinon.stub().callsArgWith(1, null, '', 'Missing path');
      var Installer = proxyquire('../../lib/installer', {
        child_process: {
          exec: _exec
        }
      });
      var installer = new Installer(tmpdir);
      installer._checkGnuLinux(function(err, installed) {
        expect(err).to.equal(null);
        expect(installed).to.equal(false);
        done();
      });
    });

    it('should return true if `which` finds the path', function(done) {
      var _exec = sinon.stub().callsArgWith(1, null, '/some/path', '');
      var Installer = proxyquire('../../lib/installer', {
        child_process: {
          exec: _exec
        }
      });
      var installer = new Installer(tmpdir);
      installer._checkGnuLinux(function(err, installed) {
        expect(err).to.equal(null);
        expect(installed).to.equal(true);
        done();
      });
    });

  });

  describe('#_checkMacintosh', function() {

    it('should check if the path exists on the filesystem', function(done) {
      var _exists = sinon.stub().callsArgWith(1, true);
      var Installer = proxyquire('../../lib/installer', {
        'fs-extra': {
          exists: _exists
        }
      });
      var installer = new Installer(tmpdir);
      installer._checkMacintosh(function(err, exists) {
        expect(err).to.equal(null);
        expect(exists).to.equal(true);
        done();
      });
    });

  });

  describe('#_checkWindows', function() {

    it('should check if the path exists on the filesystem', function(done) {
      var _exists = sinon.stub().callsArgWith(1, true);
      var Installer = proxyquire('../../lib/installer', {
        'fs-extra': {
          exists: _exists
        }
      });
      var installer = new Installer(tmpdir);
      installer._checkWindows(function(err, exists) {
        expect(err).to.equal(null);
        expect(exists).to.equal(true);
        done();
      });
    });

  });

  describe('#_getDownloadURL', function() {

    var response = {
      assets: [
        { name: 'debian32', browser_download_url: '/path/to/debian32' },
        { name: 'osx32', browser_download_url: '/path/to/osx32' },
        { name: 'win32', browser_download_url: '/path/to/win32' }
      ]
    };

    it('should bubble error from request failure', function(done) {
      var Installer = proxyquire('../../lib/installer', {
        request: function(options, callback) {
          callback(new Error('Unknown error'));
        }
      });
      var installer = new Installer(tmpdir);
      installer._getDownloadURL(function(err) {
        expect(err.message).to.equal('Unknown error');
        done();
      });
    });

    it('should error if non-200 status code returned', function(done) {
      var Installer = proxyquire('../../lib/installer', {
        request: function(options, callback) {
          callback(null, { statusCode: 400 });
        }
      });
      var installer = new Installer(tmpdir);
      installer._getDownloadURL(function(err) {
        expect(err.message).to.equal('Failed to fetch download URL');
        done();
      });
    });

    it('should return the osx32 download url', function(done) {
      var Installer = proxyquire('../../lib/installer', {
        request: function(options, callback) {
          callback(null, { statusCode: 200 }, response);
        }
      });
      var installer = new Installer(tmpdir);
      installer._platform = 'darwin';
      installer._getDownloadURL(function(err, url) {
        expect(err).to.equal(null);
        expect(url).to.equal('/path/to/osx32');
        done();
      });
    });

    it('should return the win32 download url', function(done) {
      var Installer = proxyquire('../../lib/installer', {
        request: function(options, callback) {
          callback(null, { statusCode: 200 }, response);
        }
      });
      var installer = new Installer(tmpdir);
      installer._platform = 'win32';
      installer._getDownloadURL(function(err, url) {
        expect(err).to.equal(null);
        expect(url).to.equal('/path/to/win32');
        done();
      });
    });

    it('should return the debian32 download url', function(done) {
      var Installer = proxyquire('../../lib/installer', {
        request: function(options, callback) {
          callback(null, { statusCode: 200 }, response);
        }
      });
      var installer = new Installer(tmpdir);
      installer._platform = 'linux';
      installer._getDownloadURL(function(err, url) {
        expect(err).to.equal(null);
        expect(url).to.equal('/path/to/debian32');
        done();
      });
    });

    it('should return an error if no download available', function(done) {
      var Installer = proxyquire('../../lib/installer', {
        request: function(options, callback) {
          callback(null, { statusCode: 200 }, {
            assets: []
          });
        }
      });
      var installer = new Installer(tmpdir);
      installer._getDownloadURL(function(err) {
        expect(err.message).to.equal('Download URL not resolved');
        done();
      });
    });

  });

  describe('#_getDownloadStream', function() {

    it('should emit errors from the stream', function(done) {
      var _emitter = new EventEmitter();
      var Installer = proxyquire('../../lib/installer', {
        request: {
          get: function() {
            return _emitter;
          }
        }
      });
      var installer = new Installer(tmpdir);
      installer._getDownloadStream();
      installer.once('error', function() {
        done();
      });
      _emitter.emit('error', new Error('Failed'));
    });

    it('should emit status events from the stream', function(done) {
      var _emitter = new EventEmitter();
      var Installer = proxyquire('../../lib/installer', {
        request: {
          get: function() {
            return _emitter;
          }
        }
      });
      var installer = new Installer(tmpdir);
      var stream = installer._getDownloadStream();
      installer.once('status', function(status) {
        expect(status).to.equal('Downloading (1.00mb)');
        done();
      });
      stream.emit('data', new Array(1048576));
    });

  });

  describe('#_downloadAndExtract', function() {

    it('should unzip the file after the stream ends', function(done) {
      var _createWriteStream = function() {
        var _stream = new EventEmitter();
        _stream.close = sinon.stub().callsArg(0);
        setTimeout(function() {
          _stream.emit('finish');
        }, 20);
        return _stream;
      };
      var _remove = sinon.stub();
      var _existsSync = function(path) {
        return path === tmpdir;
      };
      var _mkdirSync = sinon.stub();
      var _extractAllTo = sinon.stub();
      var _ZipFile = function() {};
      _ZipFile.prototype.extractAllTo = _extractAllTo;
      var Installer = proxyquire('../../lib/installer', {
        'fs-extra': {
          existsSync: _existsSync,
          mkdirSync: _mkdirSync,
          createWriteStream: _createWriteStream,
          remove: _remove
        },
        'adm-zip': _ZipFile
      });
      var installer = new Installer(tmpdir);
      var _getDownloadURL = sinon.stub(
        installer,
        '_getDownloadURL'
      ).callsArgWith(0, null);
      var _getDownloadStream = sinon.stub(
        installer,
        '_getDownloadStream',
        function() {
          return { pipe: function() {} };
        }
      );
      installer._downloadAndExtract(function() {
        expect(_mkdirSync.called).to.equal(true);
        expect(_extractAllTo.called).to.equal(true);
        expect(_remove.called).to.equal(true);
        expect(_getDownloadURL.called).to.equal(true);
        expect(_getDownloadStream.called).to.equal(true);
        done();
      });
    });

    it('should emit error if _getDownloadURL fails', function(done) {
      var _createWriteStream = function() {
        var _stream = new EventEmitter();
        _stream.close = sinon.stub().callsArg(0);
        setTimeout(function() {
          _stream.emit('finish');
        }, 20);
        return _stream;
      };
      var _existsSync = sinon.stub().returns(true);
      var Installer = proxyquire('../../lib/installer', {
        'fs-extra': {
          existsSync: _existsSync,
          createWriteStream: _createWriteStream
        }
      });
      var installer = new Installer(tmpdir);
      var _getDownloadURL = sinon.stub(
        installer,
        '_getDownloadURL'
      ).callsArgWith(0, new Error('Failed'));
      installer.once('error', function(err) {
        expect(err.message).to.equal('Failed');
        _getDownloadURL.restore();
        done();
      });
      installer._downloadAndExtract();
    });

  });

});
