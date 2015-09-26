"use strict";

var expect = require('chai').expect;
var Http = require('./../lib/http.js');

describe('Http', function() {
  var http = null;

  beforeEach(function() {
    http = new Http({
      appDir: __dirname + '/app',
      assets: []
    });
  });

  it('should have app property', function() {
    expect(http).to.have.a.property('app');
  });

  it('should have http property', function() {
    expect(http).to.have.a.property('http');
  });

  describe('#registerController()', function() {

  });

  describe('#run()', function() {

  });
});