"use strict";

var EventEmitter = require('events').EventEmitter;
var expect = require('chai').expect;
var Hugla = require('./../index.js');
var HuglaConfig = require('hugla-config');
var HuglaLogger = require('hugla-logger');

describe('Hugla', function() {
  var hugla = null;

  beforeEach(function() {
    hugla = new Hugla();
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
