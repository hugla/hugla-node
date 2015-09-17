"use strict";

var express = require('express');

function Http(config) {
    this.config = config;
    var app = this.app = express();
    var http = this.http = require('http').Server(this.app);

    app.set('views', config.appDir + '/views');
    app.set('view engine', config['view engine'] || 'jade');

    Object.getOwnPropertyNames(config.assets).forEach(function(uri) {
        var dir = config.assets[uri];
        app.use(uri, express.static(dir));

        console.log('static route [' + uri + ' : ' + dir + ']');
    });
}

Http.prototype.registerController = function(cDesc) {
    var router = express.Router();

    var controllerPath = this.config.appDir + '/controllers/' + cDesc.name + '.js';
    var controller = require(controllerPath);
    controller(router);

    this.app.use(cDesc.root, router);

    console.log('controller [' + cDesc.root + ' : ' + cDesc.name + ']');
};

Http.prototype.run = function(done) {
    this.http.listen(this.config.port, function() {
        done();
    });
};

module.exports = Http;