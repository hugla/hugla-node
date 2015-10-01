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

    this.modules = new Map();
    this.ready = false;

    // handle signals
    process.on('SIGTERM', this._onSIGTERM);
    process.on('SIGINT', this._onSIGINT);

    // handle hugla errors
    this.on('error', function(err) {
      this.shutdown(err);
    }.bind(this));

    // handle uncaught exceptions
    process.on('uncaughtException', this._onUncaughtException.bind(this));

    // check if appDir is provided
    if (!appDir) {
      throw new Error('appDir was not defined');
    }

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

    for (let moduleName of config.modules || []) {
      const ModuleClass = require(moduleName);
      this.modules.set(moduleName, new ModuleClass(this));
    }

    this._asyncIterMap(this.launchActions, function(err) {
      if (err) {
        this.shutdown(err);
        return;
      }

      this.ready = true;
      log.info('ready');
      this.emit('ready');
    }.bind(this));
  }

  /**
   * Start the framework
   */
  run() {
    if (!this.ready) {
      throw new Error("framework not ready to run!");
      return;
    }

    this._asyncIterMap(this.runActions, function(err) {
      if (err) {
        this.shutdown(err);
        return;
      }

      this.log.info('running');
      this.emit('running');
    }.bind(this));
  }

  /**
   * Shutdown the framework, optionally provide error that caused shutdown
   * Emits 'shutdown' event
   *
   * @param {Error|string|object} [err] Error that caused the shutdown
   */
  shutdown(err) {
    this.emit('shutdown');

    if (err) {
      if (typeof err == 'string') {
        this.log.error('%s', err);
      } else if (err instanceof Error) {
        this.log.error("\n" + err.stack);
      } else {
        this.log.error(err);
      }
    }

    this._asyncIterMap(this.shutdownActions, function(err) {
      this.log.info('shutting down!');
      process.removeListener('SIGTERM', this._onSIGTERM);
      process.removeListener('SIGINT', this._onSIGINT);
      process.removeListener('uncaughtException', this._onUncaughtException);

      if (!process.env.HUGLA_NO_EXIT) {
        process.exit(err ? 1 : 0);
      }
    }.bind(this));
  }

  /**
   * Get module with given name
   *
   * @param {string} moduleName Name of module to return
   */
  getModule(moduleName) {
    if (!this.modules.has(moduleName)) throw new Error("asking for module" +
      " that is not loaded");

    return this.module.get(moduleName);
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

  /**
   * @private
   * @param {Map} map Map object to iterate over
   * @param {function} done Callback function
   */
  _asyncIterMap(map, done) {
    const it = map.values();
    const iterator = function(action) {
      if (!action.value) {
        process.nextTick(done);
        return;
      }

      action.value(function(err) {
        if (err) {
          done(err);
        } else {
          iterator(it.next());
        }
      });
    };

    iterator(it.next());
  }

  _onSIGINT() {
    this.log.info('got SIGINT, triggering shutdown');
    this.shutdown();
  }

  _onSIGTERM() {
    this.log.info('got SIGTERM, triggering shutdown');
    this.shutdown();
  }

  _onUncaughtException(err) {
    this.shutdown(err);
  }
}

module.exports = Hugla;
