'use strict';

var util = require('util');
var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var HuglaConfig = require('hugla-config');
var Http = require('./http.js');

/**
 * Hugla - hugla's main class
 *
 * @constructor
 */
function Hugla() {}

util.inherits(Hugla, EventEmitter);

/**
 * Start the framework
 */
Hugla.prototype.run = function() {
  this.http.run(function() {
    console.log('running hugla on port ' + this.config.port);
  }.bind(this));
};

/**
 * Shutdown the framework, optionally provide error that caused shutdown
 *
 * @param err Error that caused the shutdown
 */
Hugla.prototype.shutdown = function(err) {
  if (err) {
    console.error(err);
  }

  process.exit();
};

/**
 * Boot the framework
 * Sets everything up
 *
 * @param configPath Configuration file path
 * @param appDir Application main directory path
 */
Hugla.prototype.boot = function(configPath, appDir) {

  // setup configuration
  var huglaConfig = this.huglaConfig = new HuglaConfig();

  huglaConfig.addConfig({
    port: 3000,
    appDir: appDir,
    controllers: [],
    assets: []
  });

  huglaConfig.addFile(configPath);
  huglaConfig.addEnv();

  var config = this.config = huglaConfig.config;

  // setup http module
  var http = this.http = new Http(config);

  // setup controllers
  _.each(config.controllers, function(controller) {
    http.registerController(controller);
  });
};

module.exports = Hugla;