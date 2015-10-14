"use strict";

const EventEmitter = require('events').EventEmitter;

const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const expect = chai.expect;
chai.use(sinonChai);

const Hugla = require('./../index.js');

describe('Hugla', function() {

  it("should throw an Error if 'appDir' is not provided", function() {
    expect(function() {
      new Hugla();
    }).to.throw(Error);
  });

  it("should call #shutdown if error event occurs", function() {
    const hugla = new Hugla(__dirname);
    hugla.shutdown = sinon.spy();
    hugla.emit('error', new Error('test'));

    expect(hugla.shutdown).to.have.been.called;
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

    it("should throw an Error if required module was not found", function() {
      expect(function() {
        const test = new Hugla(__dirname, __dirname + '/testconf.json');
      }).to.throw(Error);
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
