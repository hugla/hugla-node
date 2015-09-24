"use strict";

var EventEmitter = require('events').EventEmitter;
var expect = require('chai').expect;
var Hugla = require('./../index.js');
var HuglaConfig = require('hugla-config');
var HuglaLogger = require('hugla-logger');
var Http = require('./../lib/http.js');

describe('Hugla', function() {
  var hugla = null;

  beforeEach(function() {
    hugla = new Hugla();
  });

  it('should be inherited from EventEmitter', function() {
    expect(hugla).to.be.an.instanceof(EventEmitter);
  });

  it('should have log property', function() {
    expect(hugla).to.have.a.property('log');
    expect(hugla.log).to.be.instanceOf(HuglaLogger);
  });
  
  it('should have #boot() method', function() {
    expect(hugla).to.respondsTo('boot');
  });

  it('should have #run() method', function() {
    expect(hugla).to.respondsTo('run');
  });

  it('should have #shutdown() method', function() {
    expect(hugla).to.respondsTo('shutdown');
  });

  describe('#boot()', function() {
    var hugla = null;

    beforeEach(function() {
      hugla = new Hugla();
      hugla.boot(__dirname + '/testconf.json', __dirname + '/app');
    });

    it('should add huglaConfig to properties', function() {
      expect(hugla).to.have.a.property('huglaConfig');
      expect(hugla.huglaConfig).to.be.instanceOf(HuglaConfig);
    });

    it('should add config to properties', function() {
      expect(hugla).to.have.a.property('config');
      expect(hugla.config).to.be.an('object');
    });

    it('should add http to properties', function() {
      expect(hugla).to.have.a.property('http');
      expect(hugla.http).to.be.instanceOf(Http);
    });
  });

  describe('#run()', function() {

  });

  describe('#shutdown()', function() {

  });
});