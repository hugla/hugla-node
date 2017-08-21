'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _shortid = require('shortid');

var _shortid2 = _interopRequireDefault(_shortid);

var _huglaConfig = require('hugla-config');

var _huglaConfig2 = _interopRequireDefault(_huglaConfig);

var _huglaLogger = require('hugla-logger');

var _huglaLogger2 = _interopRequireDefault(_huglaLogger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Hugla - hugla's main class
 */
var Hugla = function (_EventEmitter) {
  _inherits(Hugla, _EventEmitter);

  /**
   * Class constructor
   * Requires application directory path
   *
   * @param {string} appDir Application directory path
   * @param {string} [configPath] Configuration file path
   * @param {object} [configs] Configuration extending object
   */
  function Hugla(appDir, configPath, configs) {
    _classCallCheck(this, Hugla);

    var _this = _possibleConstructorReturn(this, (Hugla.__proto__ || Object.getPrototypeOf(Hugla)).call(this));

    _this.launchActions = new Map();
    _this.runActions = new Map();
    _this.shutdownActions = new Map();

    _this.modules = new Map();
    _this.ready = false;

    // handle signals
    _this.__onSIGTERM = _this._onSIGTERM.bind(_this);
    _this.__onSIGINT = _this._onSIGINT.bind(_this);

    process.on('SIGTERM', _this.__onSIGTERM);
    process.on('SIGINT', _this.__onSIGINT);

    // handle hugla errors
    _this.on('error', function (err) {
      _this.shutdown(err);
    });

    // handle uncaught exceptions
    _this.__onUncaughtException = _this._onUncaughtException.bind(_this);

    process.on('uncaughtException', _this.__onUncaughtException);

    // check if appDir is provided
    if (!appDir) {
      throw new Error('appDir was not defined');
    }

    // setup logger
    var log = new _huglaLogger2.default({ module: 'hugla' });
    _this.log = log;

    // setup configuration
    var huglaConfig = new _huglaConfig2.default();
    _this.huglaConfig = huglaConfig;

    if (configPath) {
      huglaConfig.addFile(configPath);
    }

    huglaConfig.addEnv();

    huglaConfig.addConfig(_lodash2.default.assign({
      appDir: appDir
    }, configs || {}));

    var config = huglaConfig.config;
    _this.config = config;

    // create modules instances
    log.info('loading modules');

    (config.modules || []).forEach(function (moduleName) {
      var ModuleClass = require(moduleName).default;
      _this.modules.set(moduleName, new ModuleClass(_this));
      log.info('loaded module [' + moduleName + ']');
    });

    log.info('modules loaded');

    process.nextTick(function () {
      _this._execLaunchActions();
    });
    return _this;
  }

  /**
   * Start the framework
   */


  _createClass(Hugla, [{
    key: 'run',
    value: function run() {
      var _this2 = this;

      if (!this.ready) {
        throw new Error('framework not ready to run!');
      }

      Hugla._asyncIterMap(this.runActions, function (err) {
        if (err) {
          _this2.shutdown(err);
          return;
        }

        _this2.log.info('running');
        _this2.emit('running');
      });
    }

    /**
     * Shutdown the framework, optionally provide error that caused shutdown
     * Emits 'shutdown' event
     *
     * @param {Error|string|object} [err] Error that caused the shutdown
     */

  }, {
    key: 'shutdown',
    value: function shutdown(err) {
      var _this3 = this;

      this.emit('shutdown');

      if (err) {
        if (typeof err === 'string') {
          this.log.error('%s', err);
        } else if (err instanceof Error) {
          this.log.error('\n' + err.stack);
        } else {
          this.log.error(err);
        }
      }

      Hugla._asyncIterMap(this.shutdownActions, function (ierr) {
        _this3.log.info('shutting down!');
        process.removeListener('SIGTERM', _this3.__onSIGTERM);
        process.removeListener('SIGINT', _this3.__onSIGINT);
        process.removeListener('uncaughtException', _this3.__onUncaughtException);

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

  }, {
    key: 'getModule',
    value: function getModule(moduleName) {
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

  }, {
    key: 'registerLaunchAction',
    value: function registerLaunchAction(action) {
      var id = _shortid2.default.generate();
      this.launchActions.set(id, action);
      return id;
    }

    /**
     * Register shutdown action
     *
     * @param {function} action Action function to be called
     * @returns {string} Registered action id
     */

  }, {
    key: 'registerShutdownAction',
    value: function registerShutdownAction(action) {
      var id = _shortid2.default.generate();
      this.shutdownActions.set(id, action);
      return id;
    }

    /**
     * Register run action
     *
     * @param {function} action Action function to be called
     * @returns {string} Registered action id
     */

  }, {
    key: 'registerRunAction',
    value: function registerRunAction(action) {
      var id = _shortid2.default.generate();
      this.runActions.set(id, action);
      return id;
    }

    /**
     * Deregister previously registered launch action
     *
     * @param {string} id Action id
     */

  }, {
    key: 'deregisterLaunchAction',
    value: function deregisterLaunchAction(id) {
      if (this.launchActions.has(id)) this.launchActions.delete(id);
    }

    /**
     * Deregister previously registered shutdown action
     * @param {string} id Action id
     */

  }, {
    key: 'deregisterShutdownAction',
    value: function deregisterShutdownAction(id) {
      if (this.shutdownActions.has(id)) this.shutdownActions.delete(id);
    }

    /**
     * Deregister previously registered run action
     * @param {string} id Action id
     */

  }, {
    key: 'deregisterRunAction',
    value: function deregisterRunAction(id) {
      if (this.runActions.has(id)) this.runActions.delete(id);
    }
  }, {
    key: '_execLaunchActions',
    value: function _execLaunchActions() {
      var _this4 = this;

      var log = this.log;

      // process launch actions
      Hugla._asyncIterMap(this.launchActions, function (err) {
        if (err) {
          _this4.shutdown(err);
          return;
        }

        _this4.ready = true;
        log.info('ready');

        process.nextTick(function () {
          _this4.emit('ready');
        });
      });
    }

    /**
     * @private
     * @param {Map} map Map object to iterate over
     * @param {function} done Callback function
     */

  }, {
    key: '_onSIGINT',
    value: function _onSIGINT() {
      this.log.info('got SIGINT, triggering shutdown');
      this.shutdown();
    }
  }, {
    key: '_onSIGTERM',
    value: function _onSIGTERM() {
      this.log.info('got SIGTERM, triggering shutdown');
      this.shutdown();
    }
  }, {
    key: '_onUncaughtException',
    value: function _onUncaughtException(err) {
      this.shutdown(err);
    }
  }], [{
    key: '_asyncIterMap',
    value: function _asyncIterMap(map, done) {
      var it = map.values();
      var iterator = function iterator(action) {
        if (!action.value) {
          process.nextTick(done);
          return;
        }

        action.value(function (err) {
          if (err) {
            done(err);
          } else {
            iterator(it.next());
          }
        });
      };

      iterator(it.next());
    }
  }]);

  return Hugla;
}(_events.EventEmitter);

exports.default = Hugla;