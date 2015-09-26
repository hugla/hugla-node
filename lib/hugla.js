'use strict';

const util = require('util');
const EventEmitter = require('events').EventEmitter;

const _ = require('lodash');
const HuglaConfig = require('hugla-config');
const HuglaLogger = require('hugla-logger');

const Http = require('./http.js');

/**
 * Hugla - hugla's main class
 */
class Hugla extends EventEmitter {

  /**
   * Class constructor
   * Requires application directory path
   *
   * @param {string} appDir Application directory path
   * @param {string} [configPath] Configuration file path
   */
  constructor(appDir, configPath) {
    super();

    // handle signals
    process.on('SIGTERM', function () {
      this.log.info('got SIGTERM, triggering shutdown');
      this.shutdown();
    }.bind(this));

    process.on('SIGINT', function () {
      this.log.info('got SIGINT, triggering shutdown');
      this.shutdown();
    }.bind(this));

    // handle hugla errors
    this.on('error', function(err) {
      this.shutdown(err);
    }.bind(this));

    // handle uncaught exceptions
    process.on('uncaughtException', function(err) {
      this.shutdown(err);
    }.bind(this));

    // setup logger
    const log = this.log = new HuglaLogger({ module: 'hugla' });

    // setup configuration
    const huglaConfig = this.huglaConfig = new HuglaConfig();

    huglaConfig.addConfig({
      appDir: appDir,
      controllers: []
    });

    if (configPath) {
      huglaConfig.addFile(configPath);
    }

    huglaConfig.addEnv();

    this.config = huglaConfig.config;

    // setup http module
    const http = this.http = new Http(this.config);

    // setup controllers
    _.each(this.config.controllers, function(controller) {
      http.registerController(controller);
    });

    http.on('error', function(err) {
      if (err.code == 'EADDRINUSE') {
        this.shutdown(err);
        return;
      }

      log.error(err);
    }.bind(this)).on('ready', function() {
      log.info('hugla ready');
      this.emit('ready');
    }.bind(this));
  }

  /**
   * Start the framework
   */
  run() {
    this.http.run();
  }

  /**
   * Shutdown the framework, optionally provide error that caused shutdown
   * Emits 'shutdown' event
   *
   * @param {Error|string|object} [err] Error that caused the shutdown
   */
  shutdown(err) {
    this.emit('shutdown');

    this.http.close(function() {
      if (err) {
        if (typeof err == 'string') {
          this.log.error('%s', err);
        } else if (err instanceof Error) {
          this.log.error("\n" + err.stack);
        } else {
          this.log.error(err);
        }

        process.exit(1);
        return;
      }

      this.log.info('hugla is shutting down!');
      process.exit();
    }.bind(this));
  }
}

module.exports = Hugla;