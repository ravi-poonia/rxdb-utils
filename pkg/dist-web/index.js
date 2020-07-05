import { Observable, ReplaySubject, of, combineLatest, from, BehaviorSubject, Subject } from 'rxjs';
import { switchMap, take, map, tap } from 'rxjs/operators';
import flattenDeep from 'lodash.flattendeep';
import hash from 'object-hash';
import { v4 } from 'uuid';
import merge from 'lodash.merge';
import { PouchDB } from 'rxdb';
import { overwritable } from 'rxdb/plugins/key-compression';

var models = {
  rxdb: true,
  prototypes: {
    RxDatabase(proto) {
      Object.assign(proto, {
        models(models) {
          if (Array.isArray(models)) {
            if (!models.length) return Promise.resolve(this);
          } else {
            if (!models) return Promise.resolve(this);else models = [models];
          }

          var collections = models.map(model => this.collection(model));
          return Promise.all(collections).then(() => this);
        }

      });
    }

  },
  overwritable: {},
  hooks: {}
};

var collections = {
  rxdb: true,
  prototypes: {},
  overwritable: {},
  hooks: {
    preCreateRxCollection(model) {
      if (!model.statics) model.statics = {};
      if (!model.methods) model.methods = {};

      model.statics.collections = function collections() {
        return this.database.collections;
      };

      model.methods.collections = function collections() {
        return this.collection.collections();
      };

      return model;
    }

  }
};

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var defaultValues = {
  rxdb: true,
  prototypes: {
    RxDatabase(proto) {
      var prevCollection = proto.collection;
      Object.assign(proto, {
        collection(model) {
          var _this = this;

          for (var _len = arguments.length, other = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            other[_key - 1] = arguments[_key];
          }

          return _asyncToGenerator(function* () {
            var defaultValues = model && model.options && model.options.defaultValues;
            var collection = yield prevCollection.call(_this, model, other);
            if (!defaultValues) return collection;
            collection.preInsert(data => {
              Object.entries(defaultValues).forEach((_ref) => {
                var [key, value] = _ref;

                if (!Object.hasOwnProperty.call(data, [key])) {
                  data[key] = value;
                }
              });
              return data;
            });
            return collection;
          })();
        }

      });
    }

  },
  overwritable: {},
  hooks: {}
};

function asyncGeneratorStep$1(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator$1(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep$1(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep$1(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var options = src => {
  var {
    timestamps
  } = Object.assign({}, src.database.options, src.options);
  if (!timestamps) return false;
  var fields = {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  if (timestamps !== true) {
    fields = Object.assign(fields, timestamps);
  }

  return fields;
};

var timestamps = {
  rxdb: true,
  prototypes: {
    RxDatabase(proto) {
      var prevCollection = proto.collection;
      Object.assign(proto, {
        collection(model) {
          var _this = this;

          for (var _len = arguments.length, other = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            other[_key - 1] = arguments[_key];
          }

          return _asyncToGenerator$1(function* () {
            var collection = yield prevCollection.call(_this, model, other);
            var fields = options(collection);
            if (!fields) return collection; // Register hooks

            collection.preInsert(data => {
              var now = new Date().toISOString();
              if (!data[fields.createdAt]) data[fields.createdAt] = now;
              if (!data[fields.updatedAt]) data[fields.updatedAt] = now;
              return data;
            });
            collection.preSave((data, doc) => {
              data[fields.updatedAt] = new Date().toISOString();
              return data;
            });
            return collection;
          })();
        }

      });
    }

  },
  overwritable: {},
  hooks: {
    preCreateRxCollection(model) {
      if (!model.schema || !model.schema.properties) {
        throw Error('RxCollection(s) must have a a "schema" property, with a "properties" key');
      }

      var fields = options(model);
      if (!fields) return model; // Set schema

      if (!model.schema.properties[fields.createdAt]) {
        model.schema.properties[fields.createdAt] = {
          format: 'date-time',
          type: 'string',
          final: true
        };
      }

      if (!model.schema.properties[fields.updatedAt]) {
        model.schema.properties[fields.updatedAt] = {
          format: 'date-time',
          type: 'string'
        };
      }

      model.schema.required = (model.schema.required || []).concat([fields.createdAt, fields.updatedAt]);
      return model;
    }

  }
};

var CLOSE_SUBSCRIPTION_TIMEOUT = 1000;
var CHECK_KEEP_OPEN_TIMEOUT = 5000;
var ENSURE_CLEANUP_TIMEOUT = 10000;
var OBSERVABLES_SYMBOL = Symbol('observables');
var ENSURE_SYMBOL = Symbol('ensure');

function createSubject(observable) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var options = {
    keepOpenCheck: () => false,
    onInit: () => {},
    onTeardown: () => {}
  };
  Object.assign(options, opts);
  var subject;
  var subscription;
  var lifecycle = {
    init() {
      subject = new ReplaySubject(1);
      subscription = observable.subscribe(subject);
      options.onInit();
    },

    teardown() {
      var subs = subscription;
      var subj = subject;
      options.onTeardown();
      subs.unsubscribe();
      subj.unsubscribe();
    },

    subscribe(obs) {
      return subject.subscribe(obs);
    },

    unsubscribe(subs) {
      subs.unsubscribe();
    }

  };
  var subscriptions = 0;
  var isAlive = false;
  var interval;
  return Observable.create(obs => {
    subscriptions++;
    clearInterval(interval);
    if (!isAlive) (isAlive = true) && lifecycle.init();
    var subs = lifecycle.subscribe(obs);
    return () => {
      subscriptions--;
      lifecycle.unsubscribe(subs);
      if (subscriptions) return;
      setTimeout(() => {
        if (subscriptions || !isAlive) return;

        var kill = () => {
          isAlive = false;
          lifecycle.teardown();
          clearInterval(interval);
        };

        if (!options.keepOpenCheck()) kill();else {
          clearInterval(interval);
          interval = setInterval(() => {
            if (subscriptions || !isAlive) return clearInterval(interval);
            if (!options.keepOpenCheck()) kill();
          }, CHECK_KEEP_OPEN_TIMEOUT);
        }
      }, CLOSE_SUBSCRIPTION_TIMEOUT);
    };
  });
}

function RxQuery(proto) {
  Object.assign(proto, {
    ensure$() {
      for (var _len = arguments.length, properties = new Array(_len), _key = 0; _key < _len; _key++) {
        properties[_key] = arguments[_key];
      }

      if (!this.collection.options || !this.collection.options.views) {
        throw Error('RxQuery.ensure$() can only be used on collection with defined views');
      }

      properties = flattenDeep(properties);
      if (!properties.length) properties = this.collection._views;
      var ensureHash = hash(properties, {
        unorderedArrays: true
      });
      var ensures = this[ENSURE_SYMBOL];
      if (!ensures) ensures = this[ENSURE_SYMBOL] = {};
      var obs = ensures[ensureHash];
      if (!obs) obs = ensures[ensureHash] = createEnsure(this.$, properties);
      return obs;
    }

  });
}

function createEnsure(observable, properties) {
  var unensureFns = {};
  var lastDocs;
  var obs = observable.pipe(switchMap(ans => {
    if (!ans) return of(ans);
    var docs = Array.isArray(ans) ? ans : [ans];
    var rxArr = [];
    lastDocs = docs;
    docs.forEach(doc => {
      var primary = doc.primary;
      if (unensureFns[primary]) return;
      var unensure = doc[ENSURE_SYMBOL](properties);
      unensureFns[primary] = unensure;
      properties.forEach(property => {
        rxArr.push(doc[property].$);
      });
    });
    return rxArr.length ? combineLatest(...rxArr).pipe(take(1), map(() => ans)) : of(ans);
  }));
  var interval;
  var lastCleanupDocs;
  return createSubject(obs, {
    onInit() {
      // Periodic cleanup of ensured docs that are not part of the
      // query response anymore
      interval = setInterval(() => {
        if (!lastDocs || lastCleanupDocs === lastDocs) return;
        lastCleanupDocs = lastDocs;
        var primaries = lastCleanupDocs.reduce((acc, doc) => {
          acc[doc.primary] = true;
          return acc;
        }, {});
        Object.keys(unensureFns).forEach(key => {
          if (primaries[key]) return;
          unensureFns[key]();
          delete unensureFns[key];
        });
      }, ENSURE_CLEANUP_TIMEOUT);
    },

    onTeardown() {
      var fns = unensureFns;
      unensureFns = {};
      lastDocs = null;
      lastCleanupDocs = null;
      clearInterval(interval);
      Object.values(fns).forEach(fn => fn());
    }

  });
}

function RxDocument(proto, viewsArr) {
  // Define getters for views
  Object.defineProperties(proto, viewsArr.reduce((acc, _ref) => {
    var [key, {
      get
    }] = _ref;
    acc[key] = {
      get() {
        var ans = this[OBSERVABLES_SYMBOL][key];
        if (ans) return ans;
        var getObs = get.bind(this);
        ans = this[OBSERVABLES_SYMBOL][key] = createView(getObs);
        return ans;
      },

      enumerable: true
    };
    return acc;
  }, {}));
  Object.assign(proto, {
    [ENSURE_SYMBOL]: function ensure(propertyNames) {
      if (!propertyNames.length) propertyNames = this.collection._views;
      var unensureFns = [];
      propertyNames.forEach(property => {
        unensureFns.push(this[property][ENSURE_SYMBOL]());
      });

      function unensure() {
        unensureFns.forEach(fn => fn());
      }

      return unensure;
    }
  });
}

function createView(getObs) {
  var obj = {};
  var value;
  var observable;
  var ensured = false;
  var ensuredIds = {};
  Object.defineProperties(obj, {
    [ENSURE_SYMBOL]: {
      value: function ensure() {
        var id = v4();
        ensured = true;
        ensuredIds[id] = true;
        return function unensure() {
          ensured = null;
          delete ensuredIds[id];
        };
      },
      enumerable: true
    },
    ensured: {
      get() {
        if (ensured === null) ensured = Boolean(Object.keys(ensuredIds).length);
        return ensured;
      },

      enumerable: true
    },
    $: {
      get() {
        if (!observable) {
          var obs = getObs().pipe(tap(res => obj.ensured && (value = res)));
          observable = createSubject(obs, {
            keepOpenCheck: () => obj.ensured
          });
        }

        return observable;
      },

      enumerable: true
    },
    promise: {
      get() {
        return obj.$.pipe(take(1)).toPromise();
      },

      enumerable: true
    },
    exec: {
      value: function exec() {
        return getObs().pipe(take(1)).toPromise();
      },
      enumerable: true
    },
    value: {
      get() {
        if (!obj.ensured) {
          throw Error('Tried to get an view value for RxDocument not part of an ensure$() query');
        }

        return value;
      },

      enumerable: true
    }
  });
  return obj;
}

var views = {
  rxdb: true,
  prototypes: {
    RxQuery
  },
  overwritable: {},
  hooks: {
    createRxCollection(collection) {
      var {
        options
      } = collection;
      if (!options || !options.views) return;
      var desc = Object.getOwnPropertyDescriptors(options.views);
      var views = Object.entries(desc).filter((_ref) => {
        var [_, {
          get
        }] = _ref;
        return get;
      }); // Views keys live on collection._views

      collection._views = views.map((_ref2) => {
        var [key] = _ref2;
        return key;
      });
      var proto = collection.getDocumentPrototype();
      RxDocument(proto, views);
    },

    postCreateRxDocument(doc) {
      doc[OBSERVABLES_SYMBOL] = {};
    }

  }
};

function parseObj(obj) {
  return Object.entries(obj).reduce((acc, _ref) => {
    var [key, value] = _ref;
    if (!value) return acc;
    if (Array.isArray(value)) acc[key] = parseProperties(value);else if (typeof value === 'object') acc[key] = parseObj(value);else if (typeof value === 'string') acc[key] = parseString(value);else acc[key] = {};
    return acc;
  }, {});
}

function parseString(str) {
  var all = str.split('.');
  var obj = {};
  var current = obj;
  all.forEach(key => {
    if (!current[key]) current[key] = {};
    current = current[key];
  });
  return obj;
}

function parseProperties(propertiesArr) {
  if (!Array.isArray(propertiesArr)) throw Error('invalid properties');
  propertiesArr = flattenDeep(propertiesArr);
  var properties = {};
  propertiesArr.forEach(property => {
    switch (typeof property) {
      case 'string':
        return properties = merge(properties, parseString(property));

      case 'object':
        return properties = merge(properties, parseObj(property));

      default:
        throw Error('invalid properties');
    }
  });
  return properties;
}

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function RxDocument$1(proto) {
  Object.assign(proto, {
    select$() {
      for (var _len = arguments.length, properties = new Array(_len), _key = 0; _key < _len; _key++) {
        properties[_key] = arguments[_key];
      }

      properties = parseProperties(properties); // Properties not specified. Get all first level properties,
      // including views from views plugin (if they exist)

      if (!Object.keys(properties).length) {
        var viewsKeys = this.collection._views;
        return viewsKeys && viewsKeys.length ? combineLatest(this.$, ...viewsKeys.map(key => this[key].$)).pipe(map(all => _objectSpread({}, all[0], {}, viewsKeys.reduce((acc, key, i) => {
          acc[key] = all[i + 1];
          return acc;
        }, {
          _: this
        })))) : this.$.pipe(map(res => _objectSpread({}, res, {
          _: this
        })));
      } // Properties specified, parse


      return createCombinedObservable(of(this), properties);
    }

  });
}

function createCombinedObservable(obs, properties) {
  var keys = Object.keys(properties);
  var getObs = [];
  return obs.pipe(switchMap(res => {
    if (!getObs.length) {
      keys.forEach(key => {
        if (res[key + '$']) return getObs.push(x => x[key + '$']);
        var value = res[key];
        if (value && value.$) return getObs.push(x => x[key].$);
        return getObs.push(x => x[key]);
      });
    }

    return combineLatest(...getObs.map((getObsFn, i) => {
      var nextProperties = properties[keys[i]];
      return Object.keys(nextProperties).length ? createCombinedObservable(getObsFn(res), nextProperties) : getObsFn(res);
    })).pipe(map(all => {
      return all.reduce((acc, val, i) => {
        acc[keys[i]] = val;
        return acc;
      }, {
        _: res
      });
    }));
  }));
}

var select = {
  rxdb: true,
  prototypes: {
    RxDocument: RxDocument$1
  },
  overwritable: {},
  hooks: {}
};

var observables = {
  rxdb: true,
  prototypes: {},
  overwritable: {},
  hooks: {
    createRxCollection(collection) {
      var {
        options
      } = collection;
      if (!options || !options.observables) return;
      var getters = Object.entries(options.observables).reduce((acc, _ref) => {
        var [key, value] = _ref;
        var $, get;

        if (typeof value === 'function') {
          $ = value;
        } else {
          $ = value.$;
          get = value.get;
        }

        function observableMethod() {
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          // eslint-disable-next-line babel/no-invalid-this
          var obs = $.apply(this, args);
          var piping;

          if (get) {
            piping = switchMap(obj => {
              // eslint-disable-next-line babel/no-invalid-this
              var res = get.call(this, obj);
              return res.then ? from(res) : of(res);
            });
          }

          return {
            $: get ? obs.pipe(piping) : obs,
            exec: () => {
              return obs.pipe(take(1), get ? piping : x => x).toPromise();
            }
          };
        }

        acc[key] = {
          get() {
            var method = observableMethod.bind(this);
            method.get = get ? get.bind(this) : undefined;
            return method;
          },

          enumerable: true
        };
        return acc;
      }, {});
      var proto = collection.getDocumentPrototype();
      Object.defineProperties(proto, getters);
    }

  }
};

function asyncGeneratorStep$2(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator$2(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep$2(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep$2(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function registerHooks(collection, hooks) {
  if (!hooks) return collection;
  Object.keys(hooks).forEach(hook => {
    if (hook !== 'preInsert') collection[hook](hooks[hook]);else {
      // Add collection arg to preInsert
      collection[hook](function (data) {
        // eslint-disable-next-line babel/no-invalid-this
        return hooks[hook].call(this, data, collection);
      });
    }
  });
  return collection;
}

var hooks = {
  rxdb: true,
  prototypes: {
    RxDatabase(proto) {
      var prevCollection = proto.collection;
      Object.assign(proto, {
        collection(model) {
          var _this = this;

          for (var _len = arguments.length, other = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            other[_key - 1] = arguments[_key];
          }

          return _asyncToGenerator$2(function* () {
            var hooks = model && model.options && model.options.hooks;
            var collection = yield prevCollection.call(_this, model, other);
            return registerHooks.call(_this, collection, hooks);
          })();
        }

      });
    },

    RxCollection(proto) {
      var prevInMemory = proto.inMemory;
      Object.assign(proto, {
        inMemory() {
          var _this2 = this;

          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          return _asyncToGenerator$2(function* () {
            var collection = yield prevInMemory.apply(_this2, args);
            var hooks = collection.options && collection.options.hooks;
            return registerHooks.call(_this2, collection, hooks);
          })();
        }

      });
    }

  },
  overwritable: {},
  hooks: {}
};

function asyncGeneratorStep$3(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator$3(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep$3(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep$3(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function ownKeys$1(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$1(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$1(Object(source), true).forEach(function (key) { _defineProperty$1(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$1(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty$1(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
var replication = {
  rxdb: true,
  prototypes: {},
  overwritable: {
    createKeyCompressor(schema) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var ans = overwritable.createKeyCompressor(schema, ...args);
      var found = false;
      var entries = Object.entries(schema.normalized.properties);

      for (var [field, value] of entries) {
        if (value && value.rx_model) {
          found = true;
          ans._table = _objectSpread$1({}, ans.table, {
            [field]: field
          });
          break;
        }
      }
      /* istanbul ignore next */


      if (!found) {
        throw Error("No field replication field was found on schema normalized properties");
      }

      return ans;
    }

  },
  hooks: {
    createRxDatabase(database) {
      var options = database.options.replication;
      database.options.replication = _objectSpread$1({
        field: 'rx_model'
      }, options);
      database.replications = [];

      database.replicate = function replicate() {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        var replication = new Replication(database, ...args);
        database.replications.push(replication);
        var index = database.replications.length - 1;

        replication.destroy = /*#__PURE__*/function () {
          var _destroy = _asyncToGenerator$3(function* () {
            yield replication.close();
            database.replications = database.replications.slice(0, index).concat(database.replications.slice(index + 1));
          });

          function destroy() {
            return _destroy.apply(this, arguments);
          }

          return destroy;
        }();

        return replication;
      };
    },

    preCreateRxCollection(model) {
      var name = model.name;
      if (!name) throw Error('RxCollection(s) must have a "name" property');

      if (!model.schema || !model.schema.properties) {
        throw Error('RxCollection(s) must have a a "schema" property, with a "properties" key');
      }

      var field = model.database.options.replication.field;
      var rxModel = model.schema.properties[field];

      if (rxModel && (rxModel.type !== 'string' || rxModel.default !== name)) {
        throw Error("Schema property \"".concat(field, "\" is reserved by replication"));
      }

      model.schema.properties[field] = {
        type: 'string',
        enum: [name],
        default: name,
        final: true,
        rx_model: true
      };
    }

  }
};

class Replication {
  constructor(database, remote, collectionNames, direction) {
    var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
    this.remote = remote;
    this.directon = direction;
    this.options = options;
    this.collections = !collectionNames ? database.collections : collectionNames.reduce((acc, key) => {
      if (database.collections[key]) acc[key] = database.collections[key];
      return acc;
    }, {});
    this.replicationStates = [];
    this.alive = false;
    this._field = database.options.replication.field;
    this._states = [];
    this._subscribers = [];
    this._aliveSubject = new BehaviorSubject(false);
    this._errorSubject = new Subject();
    this._pReplicationStates = Promise.resolve([]);
  }

  get alive$() {
    return this._aliveSubject.asObservable();
  } // TODO: test error subscription


  get error$() {
    return this._errorSubject.asObservable();
  }

  connect() {
    var _this = this;

    return _asyncToGenerator$3(function* () {
      yield _this.close();

      try {
        yield _this._createFilter(_this.remote);
        yield _this._sync();
        return true;
      } catch (e) {
        _this._errorSubject.next(e);

        _this._interval = setInterval(() => {
          _this._createFilter(_this.remote).then(() => {
            clearInterval(_this._interval);

            _this._sync();
          }).catch(e => _this._errorSubject.next(e));
        }, 5000);
        return false;
      }
    })();
  }

  close() {
    var _this2 = this;

    return _asyncToGenerator$3(function* () {
      clearInterval(_this2._interval);

      _this2._subscribers.forEach(x => x.unsubscribe());

      _this2._subscribers = [];
      _this2._states = [];

      if (_this2.alive) {
        _this2.alive = false;

        _this2._aliveSubject.next(false);
      }

      yield _this2._pReplicationStates.then(arr => {
        return Promise.all(arr.map(x => x.cancel()));
      });
      _this2._pReplicationStates = Promise.resolve([]);
      _this2.replicationStates = [];
    })();
  } // Private


  _sync() {
    var _this3 = this;

    return _asyncToGenerator$3(function* () {
      var collections = _this3.collections;
      var collectionNames = Object.keys(collections);
      var promises = collectionNames.map(name => {
        return collections[name].sync({
          remote: _this3.remote,
          direction: _this3.direction,
          options: _objectSpread$1({}, _this3.options, {
            live: _this3.options.live || true,
            retry: _this3.options.retry || true,
            // selector: { rx_model: name }
            filter: 'app/by_model',
            query_params: {
              [_this3._field]: name
            }
          })
        });
      });
      var allAlive = promises.map(() => false);
      _this3._pReplicationStates = Promise.all(promises).then(arr => {
        arr.forEach((rep, i) => {
          _this3._subscribers.push(rep.alive$.subscribe(val => {
            var repAlive = allAlive[i];
            if (repAlive === val) return;
            allAlive[i] = val;
            var alive = allAlive.reduce((acc, x) => acc && x, true);
            if (alive === _this3.alive) return;
            _this3.alive = alive;

            _this3._aliveSubject.next(alive);
          }));
        });
        return arr;
      }).then(arr => _this3.replicationStates = arr);
      yield _this3._pReplicationStates;
    })();
  }

  _createFilter() {
    var _this4 = this;

    return _asyncToGenerator$3(function* () {
      // https://pouchdb.com/2015/04/05/filtered-replication.html
      var field = _this4._field;
      var remoteIsUrl = typeof _this4.remote === 'string';
      var db = remoteIsUrl ? new PouchDB(_this4.remote) : _this4.remote;
      var doc = {
        version: 0,
        _id: '_design/app',
        filters: {
          // not doing fn.toString() as istambul code
          // on tests breaks it
          by_model: "function(doc, req) {\n          return (\n            doc._id === '_design/app' || doc[\"".concat(field, "\"] === req.query[\"").concat(field, "\"]\n          );\n        }")
        }
      };
      yield db.get('_design/app').then((_ref) => {
        var {
          version,
          _rev
        } = _ref;
        return version < doc.version ? db.put(_objectSpread$1({}, doc, {
          _rev
        })) : true;
      }).catch(() => db.put(doc));
      if (remoteIsUrl) db.close();
    })();
  }

}

function register(addRxPlugin) {
  addRxPlugin(models);
  addRxPlugin(collections);
  addRxPlugin(defaultValues);
  addRxPlugin(timestamps);
  addRxPlugin(views);
  addRxPlugin(select);
  addRxPlugin(observables);
  addRxPlugin(hooks);
  addRxPlugin(replication);
}

export default register;
//# sourceMappingURL=index.js.map
