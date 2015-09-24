"use strict";

var _ = require('lodash');
var express = require('express');

/**
 * Hugla's http module
 *
 * @param config Configuration object
 * @constructor
 */
function Http(config) {
  this.config = config;
  var app = this.app = express();
  var http = this.http = require('http').Server(this.app);

  app.set('views', config.appDir + '/views');
  app.set('view engine', config['view engine'] || 'jade');

  _.each(config.assets, function(uri) {
    var dir = config.assets[uri];
    app.use(uri, express.static(dir));

    console.log('static route [' + uri + ' : ' + dir + ']');
  });
}

/**
 * Register controller for a route
 * For every controller sets up an express.Router object
 *
 * @param cDesc Controller description object
 */
Http.prototype.registerController = function(cDesc) {
  var router = express.Router();

  var controllerPath = this.config.appDir + '/controllers/' + cDesc.name + '.js';
  var controller = require(controllerPath);
  controller(router);

  this.app.use(cDesc.root, router);

  console.log('controller [' + cDesc.root + ' : ' + cDesc.name + ']');
};

/**
 * Start listening on port
 *
 * @param done Callback to be called when started
 */
Http.prototype.run = function(done) {
  this.http.listen(this.config.port, function() {
    done();
  });
};

module.exports = Http;