"use strict";

var express = require('express');

function Http(config) {
    this.config = config;
    this.app = express();
    this.http = require('http').Server(this.app);
}

Http.prototype.registerController = function(cDesc) {
    var router = express.Router();

    var controllerPath = this.config.appDir + '/controllers/' + cDesc.name + '.js';
    var controller = require(controllerPath);
    controller(router);

    this.app.use(cDesc.root, router);
};

Http.prototype.run = function(done) {
    this.http.listen(this.config.port, function() {
        done();
    });
};

module.exports = Http;