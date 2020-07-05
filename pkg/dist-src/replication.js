function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { PouchDB } from 'rxdb';
import { BehaviorSubject, Subject } from 'rxjs';
import { overwritable } from 'rxdb/plugins/key-compression';
export default {
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
          ans._table = _objectSpread({}, ans.table, {
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
      database.options.replication = _objectSpread({
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
          var _destroy = _asyncToGenerator(function* () {
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

    return _asyncToGenerator(function* () {
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

    return _asyncToGenerator(function* () {
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

    return _asyncToGenerator(function* () {
      var collections = _this3.collections;
      var collectionNames = Object.keys(collections);
      var promises = collectionNames.map(name => {
        return collections[name].sync({
          remote: _this3.remote,
          direction: _this3.direction,
          options: _objectSpread({}, _this3.options, {
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

    return _asyncToGenerator(function* () {
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
        return version < doc.version ? db.put(_objectSpread({}, doc, {
          _rev
        })) : true;
      }).catch(() => db.put(doc));
      if (remoteIsUrl) db.close();
    })();
  }

}