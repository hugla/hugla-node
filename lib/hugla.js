'use strict';

const util = require('util');
const EventEmitter = require('events').EventEmitter;

const _ = require('lodash');
const async = require('async');
const shortid = require('shortid');

const HuglaConfig = require('hugla-config');
const HuglaLogger = require('hugla-logger');

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

    this.launchActions = new Map();
    this.runActions = new Map();
    this.shutdownActions = new Map();

    this.modules = [];

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

    const config = this.config = huglaConfig.config;

    for (let moduleName of config.modules || ['hugla-http']) {
      const moduleClass = require(moduleName);
      this.modules.push(new moduleClass(this));
    }

    this._runLaunchActions(function(err) {
      if (err) {
        this.shutdown(err);
        return;
      }

      log.info('ready');
      this.emit('ready')
    }.bind(this));
  }

  /**
   * Start the framework
   */
  run() {
  }

  /**
   * Shutdown the framework, optionally provide error that caused shutdown
   * Emits 'shutdown' event
   *
   * @param {Error|string|object} [err] Error that caused the shutdown
   */
  shutdown(err) {
    this.emit('shutdown');
/*
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
    */
  }

  /**
   * Register launch action
   *
   * @param {function} action Action function to be called
   * @returns {string} Registered action id
   */
  registerLaunchAction(action) {
    const id = shortid.generate();
    this.launchActions.set(id, action);
    return id;
  }

  /**
   * Register shutdown action
   *
   * @param {function} action Action function to be called
   * @returns {string} Registered action id
   */
  registerShutdownAction(action) {
    const id = shortid.generate();
    this.shutdownActions.set(id, action);
    return id;
  }

  /**
   * Register run action
   *
   * @param {function} action Action function to be called
   * @returns {string} Registered action id
   */
  registerRunAction(action) {
    const id = shortid.generate();
    this.runActions.set(id, action);
    return id;
  }

  /**
   * Deregister previously registered launch action
   *
   * @param {string} id Action id
   */
  deregisterLaunchAction(id) {
    if (this.launchActions.has(id)) this.launchActions.delete(id);
  }

  /**
   * Deregister previously registered shutdown action
   * @param {string} id Action id
   */
  deregisterShutdownAction(id) {
    if (this.shutdownActions.has(id)) this.shutdownActions.delete(id);
  }

  /**
   * Deregister previously registered run action
   * @param {string} id Action id
   */
  deregisterRunAction(id) {
    if (this.runActions.has(id)) this.runActions.delete(id);
  }

  _runLaunchActions(done) {
    const it = this.launchActions.values();
    const iterator = function(action) {
      action(function(err) {
        if (err) {
          done(err);
        } else {
          iterator(it.next());
        }
      });
    }

    iterator(it.next());
  }

  _runRunActions() {

  }

  _runShutdownActions() {

  }
}

module.exports = Hugla;
