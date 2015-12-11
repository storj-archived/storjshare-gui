'use strict';

var proxyquire = require('proxyquire');
var sinon = require('sinon');
var expect = require('chai').expect;
var DataServWrapper = require('../../lib/dataserv');
var Logger = require('../../lib/logger');
var Tab = require('../../lib/tab');
var os = require('os');
var EventEmitter = require('events').EventEmitter;
var fakeipc = new EventEmitter();

process.setMaxListeners(0);

fakeipc.send = function(ns, data) {
  this.emit(ns, data);
};

describe('DataServWrapper', function() {

  describe('@constructor', function() {

    it('should create instance without the `new` keyword', function() {
      expect(DataServWrapper(os.tmpdir())).to.be.instanceOf(DataServWrapper);
    });

    it('should create instance with the `new` keyword', function() {
      expect(
        new DataServWrapper(os.tmpdir())
      ).to.be.instanceOf(DataServWrapper);
    });

    it('should listen for process exit', function() {
      DataServWrapper(os.tmpdir());
      expect(process._events.exit).to.not.equal(undefined);
    });

  });

  describe('#_bootstrap', function() {

    it('should spawn a child process and setup listeners', function(done) {
      var _stdout = new EventEmitter();
      var _stderr = new EventEmitter();
      var DataServWrapper = proxyquire('../../lib/dataserv', {
        child_process: {
          spawn: function() {
            return {
              stdout: _stdout,
              stderr: _stderr,
              kill: sinon.stub()
            };
          }
        }
      });
      var dataserv = new DataServWrapper(os.tmpdir(), fakeipc);
      var fakeproc = dataserv._bootstrap('some_id', 'SOME_NAME', ['--arg']);
      expect(dataserv._current.some_id).to.equal('SOME_NAME');
      expect(fakeproc._logger).to.be.instanceOf(Logger);
      expect(fakeproc.stdout._events.data).to.not.equal(undefined);
      expect(fakeproc.stderr._events.data).to.not.equal(undefined);
      _stdout.emit('data', 'Anything but standard...');
      _stderr.emit('data', 'OH NOOOOOO');
      setImmediate(function() {
        expect(fakeproc._logger._output.indexOf('Anything')).to.not.equal(-1);
        expect(fakeproc._logger._output.indexOf('OH NOOOO')).to.not.equal(-1);
        done();
      });
    });

  });

  describe('#farm', function() {

    it('should bootstrap the farm command', function() {
      var DataServWrapper = proxyquire('../../lib/dataserv', {
        child_process: {
          spawn: function() {
            return {
              stdout: new EventEmitter(),
              stderr: new EventEmitter(),
              kill: sinon.stub()
            };
          }
        }
      });
      var dataserv = new DataServWrapper(os.tmpdir(), fakeipc);
      var tab = new Tab();
      var fakeproc = dataserv.farm(tab);
      var expected = dataserv._exec + ' --config_path=' + dataserv._datadir +
                     '/drives/' + tab.id + ' --store_path= --max_size=0GB ' +
                     'farm\n';
      expect(fakeproc._logger._output).to.equal(expected);
    });

  });

  describe('#build', function() {

    it('should bootstrap the build command', function() {
      var DataServWrapper = proxyquire('../../lib/dataserv', {
        child_process: {
          spawn: function() {
            return {
              stdout: new EventEmitter(),
              stderr: new EventEmitter(),
              kill: sinon.stub()
            };
          }
        }
      });
      var dataserv = new DataServWrapper(os.tmpdir(), fakeipc);
      var tab = new Tab();
      var fakeproc = dataserv.build(tab);
      var expected = dataserv._exec + ' --config_path=' + dataserv._datadir +
                     '/drives/' + tab.id + ' --store_path= --max_size=0GB ' +
                     'build\n';
      expect(fakeproc._logger._output).to.equal(expected);
    });

  });

  describe('#register', function() {

    it('should bootstrap the register command', function() {
      var DataServWrapper = proxyquire('../../lib/dataserv', {
        child_process: {
          spawn: function() {
            return {
              stdout: new EventEmitter(),
              stderr: new EventEmitter(),
              kill: sinon.stub()
            };
          }
        }
      });
      var dataserv = new DataServWrapper(os.tmpdir(), fakeipc);
      var fakeproc = dataserv.register();
      var expected = dataserv._exec + ' register\n';
      expect(fakeproc._logger._output).to.equal(expected);
    });

  });

  describe('#poll', function() {

    it('should bootstrap the poll command', function() {
      var DataServWrapper = proxyquire('../../lib/dataserv', {
        child_process: {
          spawn: function() {
            return {
              stdout: new EventEmitter(),
              stderr: new EventEmitter(),
              kill: sinon.stub()
            };
          }
        }
      });
      var dataserv = new DataServWrapper(os.tmpdir(), fakeipc);
      var fakeproc = dataserv.poll();
      var expected = dataserv._exec + ' poll\n';
      expect(fakeproc._logger._output).to.equal(expected);
    });

  });

  describe('#setAddress', function() {

    it('should bootstrap the config command', function(done) {
      var DataServWrapper = proxyquire('../../lib/dataserv', {
        child_process: {
          execFile: function(program, args, callback) {
            callback(null, program + ' ' + args.join(' '));
          }
        }
      });
      var dataserv = new DataServWrapper(os.tmpdir(), fakeipc);
      var tab = new Tab();
      var expected = dataserv._exec + ' --config_path=' + os.tmpdir() +
                     '/drives/' + tab.id + ' config --set_payout_address=1234';
      dataserv.setAddress('1234', tab.id, function(err, res) {
        expect(expected).to.equal(res);
        done();
      });
    });

    it('should remove existing config if address has changed', function(done) {
      var _unlinkSync = sinon.stub();
      var DataServWrapper = proxyquire('../../lib/dataserv', {
        fs: {
          existsSync: sinon.stub().returns(true),
          readFileSync: sinon.stub().returns('4321'),
          unlinkSync: _unlinkSync
        },
        child_process: {
          execFile: sinon.stub().callsArg(2)
        }
      });
      var dataserv = new DataServWrapper(os.tmpdir(), fakeipc);
      var tab = new Tab();
      dataserv.setAddress('1234', tab.id, function(err, res) {
        expect(_unlinkSync.called).to.equal(true);
        done();
      });
    });

    it('should not remove config if address has not changed', function(done) {
      var _unlinkSync = sinon.stub();
      var DataServWrapper = proxyquire('../../lib/dataserv', {
        fs: {
          existsSync: sinon.stub().returns(true),
          readFileSync: sinon.stub().returns('1234'),
          unlinkSync: _unlinkSync
        },
        child_process: {
          execFile: sinon.stub().callsArg(2)
        }
      });
      var dataserv = new DataServWrapper(os.tmpdir(), fakeipc);
      var tab = new Tab();
      dataserv.setAddress('1234', tab.id, function(err, res) {
        expect(_unlinkSync.called).to.equal(false);
        done();
      });
    });

  });

  describe('#validateClient', function() {

    it('should bubble error from execFile', function(done) {
      var DataServWrapper = proxyquire('../../lib/dataserv', {
        child_process: {
          execFile: function(program, args, callback) {
            callback(new Error('Unknown error'));
          }
        }
      });
      var dataserv = new DataServWrapper(os.tmpdir(), fakeipc);
      dataserv.validateClient(dataserv._exec, function(err) {
        expect(err.message).to.equal('Unknown error');
        done();
      });
    });

    it('should use stderr if the platform is `darwin`', function(done) {
      var DataServWrapper = proxyquire('../../lib/dataserv', {
        child_process: {
          execFile: function(program, args, callback) {
            callback(null, '', 'v1.0.0');
          }
        },
        os: {
          platform: function() {
            return 'darwin';
          }
        }
      });
      var dataserv = new DataServWrapper(os.tmpdir(), fakeipc);
      dataserv.validateClient(dataserv._exec, function(err) {
        expect(err).to.equal(null);
        done();
      });
    });

    it('should return error if no version is returned', function(done) {
      var DataServWrapper = proxyquire('../../lib/dataserv', {
        child_process: {
          execFile: function(program, args, callback) {
            callback(null, '', '');
          }
        }
      });
      var dataserv = new DataServWrapper(os.tmpdir(), fakeipc);
      dataserv.validateClient(dataserv._exec, function(err) {
        expect(err.message).to.equal('Invalid dataserv-client');
        done();
      });
    });

    it('should not return an error if all is good', function(done) {
      var DataServWrapper = proxyquire('../../lib/dataserv', {
        child_process: {
          execFile: function(program, args, callback) {
            callback(null, 'v1.0.0', '');
          }
        }
      });
      var dataserv = new DataServWrapper(os.tmpdir(), fakeipc);
      dataserv.validateClient(dataserv._exec, function(err) {
        expect(err).to.equal(null);
        done();
      });
    });

  });

  describe('#terminate', function() {

    it('should terminate the process running under the id', function() {
      var DataServWrapper = proxyquire('../../lib/dataserv', {
        child_process: {
          spawn: function() {
            return {
              stdout: new EventEmitter(),
              stderr: new EventEmitter(),
              kill: sinon.stub()
            };
          }
        }
      });
      var dataserv = new DataServWrapper(os.tmpdir(), fakeipc);
      var tab = new Tab();
      var fakeproc = dataserv.farm(tab);
      expect(dataserv._children[tab.id]).to.equal(fakeproc);
      dataserv.terminate(tab.id);
      expect(dataserv._children[tab.id]).to.equal(null);
      expect(fakeproc.kill.called).to.equal(true);
    });

    it('should do do nothing if there is no process by id', function() {
      var DataServWrapper = proxyquire('../../lib/dataserv', {
        child_process: {
          spawn: function() {
            return {
              stdout: new EventEmitter(),
              stderr: new EventEmitter(),
              kill: sinon.stub()
            };
          }
        }
      });
      var dataserv = new DataServWrapper(os.tmpdir(), fakeipc);
      var tab = new Tab();
      var fakeproc = dataserv.farm(tab);
      expect(dataserv._children[tab.id]).to.equal(fakeproc);
      dataserv.terminate('NOT_A_REAL_ID');
      expect(dataserv._children[tab.id]).to.equal(fakeproc);
      expect(fakeproc.kill.called).to.equal(false);
    });

  });

  describe('#_getConfigPath', function() {

    it('should return the config path for the id', function() {
      var dataserv = new DataServWrapper(os.tmpdir(), fakeipc);
      var configPath = dataserv._getConfigPath('test');
      expect(configPath).to.equal(os.tmpdir() + '/drives/test');
    });

    it('should create the datadir if it does not exist', function() {
      var _mkdirSync = sinon.stub();
      var DataServWrapper = proxyquire('../../lib/dataserv', {
        fs: {
          existsSync: function() {
            return false;
          },
          mkdirSync: _mkdirSync
        }
      });
      var dataserv = new DataServWrapper(os.tmpdir(), fakeipc);
      var configPath = dataserv._getConfigPath('test');
      expect(configPath).to.equal(os.tmpdir() + '/drives/test');
      expect(_mkdirSync.called).to.equal(true);
    });

  });

  describe('#_clean', function() {

    it('should terminate all processes on exit', function() {
      var _kill = sinon.stub();
      var DataServWrapper = proxyquire('../../lib/dataserv', {
        child_process: {
          spawn: function() {
            return {
              stdout: new EventEmitter(),
              stderr: new EventEmitter(),
              kill: _kill
            };
          }
        }
      });
      var dataserv = new DataServWrapper(os.tmpdir(), fakeipc);
      var tab1 = new Tab('test'), tab2 = new Tab('test2');
      dataserv.farm(tab1);
      dataserv.farm(tab2);
      dataserv.terminate(tab2.id);
      dataserv._clean();
      expect(_kill.called).to.equal(true);
    });

  });

});
