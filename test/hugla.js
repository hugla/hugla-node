"use strict";

const EventEmitter = require('events').EventEmitter;
const expect = require('chai').expect;
const Hugla = require('./../index.js');

describe('Hugla', function() {

  it("should throw an Error if 'appDir' is not provided", function() {
    expect(function() {
      new Hugla();
    }).to.throw(Error);
  });

  describe('instance', function() {
    let hugla = null;

    beforeEach(function() {
      hugla = new Hugla(__dirname);
    });

    afterEach(function() {
      hugla.shutdown();
    });

    it("should throw an Error if #run() method has been called before 'ready' event", function() {
      expect(hugla.run).to.throw(Error);
    });

    it('should have #run() method', function() {
      expect(hugla).to.respondsTo('run');
    });

    it('should have #shutdown() method', function() {
      expect(hugla).to.respondsTo('shutdown');
    });

    it('should have #registerLaunchAction() method', function() {
      expect(hugla).to.respondsTo('registerLaunchAction');
    });

    it('should have #registerShutdownAction() method', function() {
      expect(hugla).to.respondsTo('registerShutdownAction');
    });

    it('should have #registerRunAction() method', function() {
      expect(hugla).to.respondsTo('registerRunAction');
    });

    it('should have #deregisterLaunchAction() method', function() {
      expect(hugla).to.respondsTo('deregisterLaunchAction');
    });

    it('should have #deregisterShutdownAction() method', function() {
      expect(hugla).to.respondsTo('deregisterShutdownAction');
    });

    it('should have #deregisterRunAction() method', function() {

    });

    describe('#run()', function() {

    });

    describe('#shutdown()', function() {

    });
  });
});
