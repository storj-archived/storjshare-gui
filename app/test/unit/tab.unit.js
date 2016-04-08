'use strict';

var expect = require('chai').expect;
var Tab = require('../../lib/tab');
var storj = require('storj-farmer').__core;

describe('Tab', function() {

  describe('@constructor', function() {

    it('should create instance without the `new` keyword', function() {
      expect(Tab()).to.be.instanceOf(Tab);
    });

    it('should create instance with the `new` keyword', function() {
      expect(new Tab()).to.be.instanceOf(Tab);
    });

    it('should use the defaults if no args are provided', function() {
      var tab = new Tab();
      expect(tab.address).to.equal('');
      expect(tab.storage.path).to.equal('');
      expect(tab.storage.size).to.equal(0);
      expect(tab.storage.unit).to.equal('GB');
      expect(typeof tab.id).to.equal('string');
      expect(tab.active).to.equal(false);
      expect(tab.wasRunning).to.equal(false);
    });

    it('should use the args if provided', function() {
      var keypair = new storj.KeyPair();
      var tab = new Tab({
        key : keypair.getPrivateKey(),
        addr: keypair.getAddress(),
        storage : {
          path : '/tmp/data',
          size : 5,
          unit : 'MB'
        },
        id : 'some_id',
        active : false,
        wasRunning : true
      });

      expect(tab.address).to.equal(keypair.getAddress());
      expect(tab.storage.path).to.equal('/tmp/data');
      expect(tab.storage.size).to.equal(5);
      expect(tab.storage.unit).to.equal('MB');
      expect(tab.id).to.equal('some_id');
      expect(tab.active).to.equal(false);
      expect(tab.wasRunning).to.equal(true);
    });

  });

  describe('#toObject', function() {

    it('should only return the appropriate properties', function() {
      var tab = new Tab({
        add : 'address',
        storage : { path: '/', size: 1, unit: 'MB' }
      });

      tab._process = 'something';
      var obj = tab.toObject();
      expect(obj._process).to.equal(undefined);
      expect(obj.active).to.equal(undefined);
    });

  });

});
