'use strict';

var Http = require('./http.js');

function Hugla(config) {
    config.port = config.port || 3000;

    this.config = config;
    this.http = new Http(config);

    config.controllers.forEach(function(controller) {
        this.http.registerController(controller);
    }.bind(this));
}

Hugla.prototype.run = function() {
    this.http.run(function() {
        console.log('running hugla on port ' + this.config.port);
    }.bind(this));
};

module.exports = Hugla;