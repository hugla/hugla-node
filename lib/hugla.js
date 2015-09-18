'use strict';

var util = require('util');
var EventEmitter = require('events').EventEmitter;
var Http = require('./http.js');

function Hugla() {}

util.inherits(Hugla, EventEmitter);

Hugla.prototype.run = function() {
    this.http.run(function() {
        console.log('running hugla on port ' + this.config.port);
    }.bind(this));
};

Hugla.prototype.shutdown = function(err) {
    if (err) {
        console.log(err);
    }

    process.exit();
};

Hugla.prototype.boot = function(configPath, appDir) {
    var config = this.config = require(configPath);

    config.port = config.port || 3000;
    config.appDir = config.appDir || appDir;
    config.controllers = config.controllers || [];
    config.assets = config.assets || [];

    var http = this.http = new Http(config);

    config.controllers.forEach(function(controller) {
        http.registerController(controller);
    });
};

module.exports = Hugla;