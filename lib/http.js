"use strict";

const EventEmitter = require('events').EventEmitter;
const util = require('util');

const _ = require('lodash');
const express = require('express');

const HuglaLogger = require('hugla-logger');

class Http extends EventEmitter {

  /**
   * Hugla's http module
   *
   * @param {object} config Config object
   */
  constructor(config) {
    super();

    const log = this.log = new HuglaLogger({ module: 'http' });
    const app = this.app = express();
    const http = this.http = require('http').Server(this.app);

    app.set('hPort', config.port || 3000);
    app.set('hHost', config.host || '0.0.0.0');
    app.set('views', config.appDir + '/views');
    app.set('view engine', config['view engine'] || 'jade');

    _.each(config.assets || [], function(dir, uri) {
      app.use(uri, express.static(dir));
      log.info('static route [%s : %s]', uri, dir);
    });

    http.on('error', function(err) {
      if (err.code == 'EADDRINUSE') {
        log.error(util.format('address already in use - %s:%s', app.get('hHost'), app.get('hPort')));
      }

      this.emit('error', err);
    }.bind(this));
  }

  /**
   * Register controller for a route
   * For every controller sets up an express.Router object
   *
   * @param {object} description Controller description object
   */
  registerController(description) {
    const router = express.Router();

    const controllerPath = this.config.appDir + '/controllers/' + description.name + '.js';
    const controller = require(controllerPath);

    controller(router);

    this.app.use(description.root, router);
    this.log.info('controller [%s : %s]', description.root, description.name);
  }

  /**
   * Start listening for http requests
   */
  run() {
    this.http.listen(this.app.get('hPort'), this.app.get('hHost'), function() {
      this.log.info(util.format('listening on %s:%s', this.app.get('hHost'), this.app.get('hPort')));
      this.emit('ready');
    }.bind(this));
  }
}

module.exports = Http;