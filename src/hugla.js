import { EventEmitter } from 'events';

import _ from 'lodash';
import shortid from 'shortid';

import HuglaConfig from 'hugla-config';
import HuglaLogger from 'hugla-logger';

/**
 * Hugla - hugla's main class
 */
export default class Hugla extends EventEmitter {
  /**
   * Class constructor
   * Requires application directory path
   *
   * @param {string} appDir Application directory path
   * @param {string} [configPath] Configuration file path
   * @param {object} [configs] Configuration extending object
   */
  constructor(appDir, configPath, configs) {
    super();

    this.launchActions = new Map();
    this.runActions = new Map();
    this.shutdownActions = new Map();

    this.modules = new Map();
    this.ready = false;

    // handle signals
    this.__onSIGTERM = this._onSIGTERM.bind(this);
    this.__onSIGINT = this._onSIGINT.bind(this);

    process.on('SIGTERM', this.__onSIGTERM);
    process.on('SIGINT', this.__onSIGINT);

    // handle hugla errors
    this.on('error', (err) => {
      this.shutdown(err);
    });

    // handle uncaught exceptions
    this.__onUncaughtException = this._onUncaughtException.bind(this);

    process.on('uncaughtException', this.__onUncaughtException);

    // check if appDir is provided
    if (!appDir) {
      throw new Error('appDir was not defined');
    }

    // setup logger
    const log = new HuglaLogger({ module: 'hugla' });
    this.log = log;

    // setup configuration
    const huglaConfig = new HuglaConfig();
    this.huglaConfig = huglaConfig;

    if (configPath) {
      huglaConfig.addFile(configPath);
    }

    huglaConfig.addEnv();

    huglaConfig.addConfig(_.assign({
      appDir,
    }, configs || {}));

    const config = huglaConfig.config;
    this.config = config;

    // create modules instances
    log.info('loading modules');

    (config.modules || []).forEach((moduleName) => {
      const ModuleClass = require(moduleName).default;
      this.modules.set(moduleName, new ModuleClass(this));
      log.info(`loaded module [${moduleName}]`);
    });

    log.info('modules loaded');

    process.nextTick(() => {
      this._execLaunchActions();
    });
  }

  /**
   * Start the framework
   */
  run() {
    if (!this.ready) {
      throw new Error('framework not ready to run!');
    }

    Hugla._asyncIterMap(this.runActions, (err) => {
      if (err) {
        this.shutdown(err);
        return;
      }

      this.log.info('running');
      this.emit('running');
    });
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
      if (typeof err === 'string') {
        this.log.error('%s', err);
      } else if (err instanceof Error) {
        this.log.error(`\n${err.stack}`);
      } else {
        this.log.error(err);
      }
    }

    Hugla._asyncIterMap(this.shutdownActions, (ierr) => {
      this.log.info('shutting down!');
      process.removeListener('SIGTERM', this.__onSIGTERM);
      process.removeListener('SIGINT', this.__onSIGINT);
      process.removeListener('uncaughtException', this.__onUncaughtException);

      if (!process.env.HUGLA_NO_EXIT) {
        process.exit(ierr ? 1 : 0);
      }
    });
  }

  /**
   * Get module with given name
   *
   * @param {string} moduleName Name of module to return
   */
  getModule(moduleName) {
    if (!this.modules.has(moduleName)) {
      throw new Error('asking for module that is not loaded');
    }

    return this.modules.get(moduleName);
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

  _execLaunchActions() {
    const log = this.log;

    // process launch actions
    Hugla._asyncIterMap(this.launchActions, (err) => {
      if (err) {
        this.shutdown(err);
        return;
      }

      this.ready = true;
      log.info('ready');

      process.nextTick(() => {
        this.emit('ready');
      });
    });
  }

  /**
   * @private
   * @param {Map} map Map object to iterate over
   * @param {function} done Callback function
   */
  static _asyncIterMap(map, done) {
    const it = map.values();
    const iterator = (action) => {
      if (!action.value) {
        process.nextTick(done);
        return;
      }

      action.value((err) => {
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
