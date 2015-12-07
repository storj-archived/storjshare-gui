'use strict';

var expect = require('chai').expect;
var Tab = require('../../lib/tab');

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
      expect(tab.active).to.equal(true);
    });

    it('should use the args if provided', function() {
      var tab = new Tab('myaddress', {
        path: '/tmp/data',
        size: 5,
        unit: 'MB'
      }, 'some_id', false);
      expect(tab.address).to.equal('myaddress');
      expect(tab.storage.path).to.equal('/tmp/data');
      expect(tab.storage.size).to.equal(5);
      expect(tab.storage.unit).to.equal('MB');
      expect(tab.id).to.equal('some_id');
      expect(tab.active).to.equal(false);
    });

  });

  describe('#createID', function() {

    it('should create a unique identifier based on time', function(done) {
      var id1 = Tab().createID();
      var id2 = Tab().createID();

      setTimeout(function() {
        var id3 = Tab().createID();
        expect(id1).to.equal(id2);
        expect(id1).to.not.equal(id3);
        done();
      }, 5);
    });

  });

});
