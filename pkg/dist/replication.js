"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rxdb = require("rxdb");

var _rxjs = require("rxjs");

var _keyCompression = require("rxdb/plugins/key-compression");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = {
  rxdb: true,
  prototypes: {},
  overwritable: {
    createKeyCompressor(schema, ...args) {
      const ans = _keyCompression.overwritable.createKeyCompressor(schema, ...args);

      let found = false;
      const entries = Object.entries(schema.normalized.properties);

      for (const [field, value] of entries) {
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
        throw Error(`No field replication field was found on schema normalized properties`);
      }

      return ans;
    }

  },
  hooks: {
    createRxDatabase(database) {
      const options = database.options.replication;
      database.options.replication = _objectSpread({
        field: 'rx_model'
      }, options);
      database.replications = [];

      database.replicate = function replicate(...args) {
        const replication = new Replication(database, ...args);
        database.replications.push(replication);
        const index = database.replications.length - 1;

        replication.destroy = async function destroy() {
          await replication.close();
          database.replications = database.replications.slice(0, index).concat(database.replications.slice(index + 1));
        };

        return replication;
      };
    },

    preCreateRxCollection(model) {
      const name = model.name;
      if (!name) throw Error('RxCollection(s) must have a "name" property');

      if (!model.schema || !model.schema.properties) {
        throw Error('RxCollection(s) must have a a "schema" property, with a "properties" key');
      }

      const field = model.database.options.replication.field;
      const rxModel = model.schema.properties[field];

      if (rxModel && (rxModel.type !== 'string' || rxModel.default !== name)) {
        throw Error(`Schema property "${field}" is reserved by replication`);
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
exports.default = _default;

class Replication {
  constructor(database, remote, collectionNames, direction, options = {}) {
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
    this._aliveSubject = new _rxjs.BehaviorSubject(false);
    this._errorSubject = new _rxjs.Subject();
    this._pReplicationStates = Promise.resolve([]);
  }

  get alive$() {
    return this._aliveSubject.asObservable();
  } // TODO: test error subscription


  get error$() {
    return this._errorSubject.asObservable();
  }

  async connect() {
    await this.close();

    try {
      await this._createFilter(this.remote);
      await this._sync();
      return true;
    } catch (e) {
      this._errorSubject.next(e);

      this._interval = setInterval(() => {
        this._createFilter(this.remote).then(() => {
          clearInterval(this._interval);

          this._sync();
        }).catch(e => this._errorSubject.next(e));
      }, 5000);
      return false;
    }
  }

  async close() {
    clearInterval(this._interval);

    this._subscribers.forEach(x => x.unsubscribe());

    this._subscribers = [];
    this._states = [];

    if (this.alive) {
      this.alive = false;

      this._aliveSubject.next(false);
    }

    await this._pReplicationStates.then(arr => {
      return Promise.all(arr.map(x => x.cancel()));
    });
    this._pReplicationStates = Promise.resolve([]);
    this.replicationStates = [];
  } // Private


  async _sync() {
    const collections = this.collections;
    const collectionNames = Object.keys(collections);
    const promises = collectionNames.map(name => {
      return collections[name].sync({
        remote: this.remote,
        direction: this.direction,
        options: _objectSpread({}, this.options, {
          live: this.options.live || true,
          retry: this.options.retry || true,
          // selector: { rx_model: name }
          filter: 'app/by_model',
          query_params: {
            [this._field]: name
          }
        })
      });
    });
    const allAlive = promises.map(() => false);
    this._pReplicationStates = Promise.all(promises).then(arr => {
      arr.forEach((rep, i) => {
        this._subscribers.push(rep.alive$.subscribe(val => {
          const repAlive = allAlive[i];
          if (repAlive === val) return;
          allAlive[i] = val;
          const alive = allAlive.reduce((acc, x) => acc && x, true);
          if (alive === this.alive) return;
          this.alive = alive;

          this._aliveSubject.next(alive);
        }));
      });
      return arr;
    }).then(arr => this.replicationStates = arr);
    await this._pReplicationStates;
  }

  async _createFilter() {
    // https://pouchdb.com/2015/04/05/filtered-replication.html
    const field = this._field;
    const remoteIsUrl = typeof this.remote === 'string';
    const db = remoteIsUrl ? new _rxdb.PouchDB(this.remote) : this.remote;
    const doc = {
      version: 0,
      _id: '_design/app',
      filters: {
        // not doing fn.toString() as istambul code
        // on tests breaks it
        by_model: `function(doc, req) {
          return (
            doc._id === '_design/app' || doc["${field}"] === req.query["${field}"]
          );
        }`
      }
    };
    await db.get('_design/app').then(({
      version,
      _rev
    }) => {
      return version < doc.version ? db.put(_objectSpread({}, doc, {
        _rev
      })) : true;
    }).catch(() => db.put(doc));
    if (remoteIsUrl) db.close();
  }

}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yZXBsaWNhdGlvbi5qcyJdLCJuYW1lcyI6WyJyeGRiIiwicHJvdG90eXBlcyIsIm92ZXJ3cml0YWJsZSIsImNyZWF0ZUtleUNvbXByZXNzb3IiLCJzY2hlbWEiLCJhcmdzIiwiYW5zIiwiZm91bmQiLCJlbnRyaWVzIiwiT2JqZWN0Iiwibm9ybWFsaXplZCIsInByb3BlcnRpZXMiLCJmaWVsZCIsInZhbHVlIiwicnhfbW9kZWwiLCJfdGFibGUiLCJ0YWJsZSIsIkVycm9yIiwiaG9va3MiLCJjcmVhdGVSeERhdGFiYXNlIiwiZGF0YWJhc2UiLCJvcHRpb25zIiwicmVwbGljYXRpb24iLCJyZXBsaWNhdGlvbnMiLCJyZXBsaWNhdGUiLCJSZXBsaWNhdGlvbiIsInB1c2giLCJpbmRleCIsImxlbmd0aCIsImRlc3Ryb3kiLCJjbG9zZSIsInNsaWNlIiwiY29uY2F0IiwicHJlQ3JlYXRlUnhDb2xsZWN0aW9uIiwibW9kZWwiLCJuYW1lIiwicnhNb2RlbCIsInR5cGUiLCJkZWZhdWx0IiwiZW51bSIsImZpbmFsIiwiY29uc3RydWN0b3IiLCJyZW1vdGUiLCJjb2xsZWN0aW9uTmFtZXMiLCJkaXJlY3Rpb24iLCJkaXJlY3RvbiIsImNvbGxlY3Rpb25zIiwicmVkdWNlIiwiYWNjIiwia2V5IiwicmVwbGljYXRpb25TdGF0ZXMiLCJhbGl2ZSIsIl9maWVsZCIsIl9zdGF0ZXMiLCJfc3Vic2NyaWJlcnMiLCJfYWxpdmVTdWJqZWN0IiwiQmVoYXZpb3JTdWJqZWN0IiwiX2Vycm9yU3ViamVjdCIsIlN1YmplY3QiLCJfcFJlcGxpY2F0aW9uU3RhdGVzIiwiUHJvbWlzZSIsInJlc29sdmUiLCJhbGl2ZSQiLCJhc09ic2VydmFibGUiLCJlcnJvciQiLCJjb25uZWN0IiwiX2NyZWF0ZUZpbHRlciIsIl9zeW5jIiwiZSIsIm5leHQiLCJfaW50ZXJ2YWwiLCJzZXRJbnRlcnZhbCIsInRoZW4iLCJjbGVhckludGVydmFsIiwiY2F0Y2giLCJmb3JFYWNoIiwieCIsInVuc3Vic2NyaWJlIiwiYXJyIiwiYWxsIiwibWFwIiwiY2FuY2VsIiwia2V5cyIsInByb21pc2VzIiwic3luYyIsImxpdmUiLCJyZXRyeSIsImZpbHRlciIsInF1ZXJ5X3BhcmFtcyIsImFsbEFsaXZlIiwicmVwIiwiaSIsInN1YnNjcmliZSIsInZhbCIsInJlcEFsaXZlIiwicmVtb3RlSXNVcmwiLCJkYiIsIlBvdWNoREIiLCJkb2MiLCJ2ZXJzaW9uIiwiX2lkIiwiZmlsdGVycyIsImJ5X21vZGVsIiwiZ2V0IiwiX3JldiIsInB1dCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUNBOzs7Ozs7OztlQUVlO0FBQ2JBLEVBQUFBLElBQUksRUFBRSxJQURPO0FBRWJDLEVBQUFBLFVBQVUsRUFBRSxFQUZDO0FBR2JDLEVBQUFBLFlBQVksRUFBRTtBQUNaQyxJQUFBQSxtQkFBbUIsQ0FBQ0MsTUFBRCxFQUFTLEdBQUdDLElBQVosRUFBa0I7QUFDbkMsWUFBTUMsR0FBRyxHQUFHSiw2QkFBYUMsbUJBQWIsQ0FBaUNDLE1BQWpDLEVBQXlDLEdBQUdDLElBQTVDLENBQVo7O0FBRUEsVUFBSUUsS0FBSyxHQUFHLEtBQVo7QUFDQSxZQUFNQyxPQUFPLEdBQUdDLE1BQU0sQ0FBQ0QsT0FBUCxDQUFlSixNQUFNLENBQUNNLFVBQVAsQ0FBa0JDLFVBQWpDLENBQWhCOztBQUNBLFdBQUssTUFBTSxDQUFDQyxLQUFELEVBQVFDLEtBQVIsQ0FBWCxJQUE2QkwsT0FBN0IsRUFBc0M7QUFDcEMsWUFBSUssS0FBSyxJQUFJQSxLQUFLLENBQUNDLFFBQW5CLEVBQTZCO0FBQzNCUCxVQUFBQSxLQUFLLEdBQUcsSUFBUjtBQUNBRCxVQUFBQSxHQUFHLENBQUNTLE1BQUoscUJBQWtCVCxHQUFHLENBQUNVLEtBQXRCO0FBQTZCLGFBQUNKLEtBQUQsR0FBU0E7QUFBdEM7QUFDQTtBQUNEO0FBQ0Y7QUFFRDs7O0FBQ0EsVUFBSSxDQUFDTCxLQUFMLEVBQVk7QUFDVixjQUFNVSxLQUFLLENBQ1Isc0VBRFEsQ0FBWDtB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O0FBY0EsVUFBTW9GLEVBQUUsQ0FDTE8sR0FERyxDQUNDLGFBREQsRUFFSC9CLElBRkcsQ0FFRSxDQUFDO0FBQUUyQixNQUFBQSxPQUFGO0FBQVdLLE1BQUFBO0FBQVgsS0FBRCxLQUF1QjtBQUMzQixhQUFPTCxPQUFPLEdBQUdELEdBQUcsQ0FBQ0MsT0FBZCxHQUF3QkgsRUFBRSxDQUFDUyxHQUFILG1CQUFZUCxHQUFaO0FBQWlCTSxRQUFBQTtBQUFqQixTQUF4QixHQUFtRCxJQUExRDtBQUNELEtBSkcsRUFLSDlCLEtBTEcsQ0FLRyxNQUFNc0IsRUFBRSxDQUFDUyxHQUFILENBQU9QLEdBQVAsQ0FMVCxDQUFOO0FBT0EsUUFBSUgsV0FBSixFQUFpQkMsRUFBRSxDQUFDbEUsS0FBSDtBQUNsQjs7QUExSWUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQb3VjaERCIH0gZnJvbSAncnhkYic7XG5pbXBvcnQgeyBCZWhhdmlvclN1YmplY3QsIFN1YmplY3QgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IG92ZXJ3cml0YWJsZSB9IGZyb20gJ3J4ZGIvcGx1Z2lucy9rZXktY29tcHJlc3Npb24nO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHJ4ZGI6IHRydWUsXG4gIHByb3RvdHlwZXM6IHt9LFxuICBvdmVyd3JpdGFibGU6IHtcbiAgICBjcmVhdGVLZXlDb21wcmVzc29yKHNjaGVtYSwgLi4uYXJncykge1xuICAgICAgY29uc3QgYW5zID0gb3ZlcndyaXRhYmxlLmNyZWF0ZUtleUNvbXByZXNzb3Ioc2NoZW1hLCAuLi5hcmdzKTtcblxuICAgICAgbGV0IGZvdW5kID0gZmFsc2U7XG4gICAgICBjb25zdCBlbnRyaWVzID0gT2JqZWN0LmVudHJpZXMoc2NoZW1hLm5vcm1hbGl6ZWQucHJvcGVydGllcyk7XG4gICAgICBmb3IgKGNvbnN0IFtmaWVsZCwgdmFsdWVdIG9mIGVudHJpZXMpIHtcbiAgICAgICAgaWYgKHZhbHVlICYmIHZhbHVlLnJ4X21vZGVsKSB7XG4gICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgIGFucy5fdGFibGUgPSB7IC4uLmFucy50YWJsZSwgW2ZpZWxkXTogZmllbGQgfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgaWYgKCFmb3VuZCkge1xuICAgICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgICBgTm8gZmllbGQgcmVwbGljYXRpb24gZmllbGQgd2FzIGZvdW5kIG9uIHNjaGVtYSBub3JtYWxpemVkIHByb3BlcnRpZXNgXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBhbnM7XG4gICAgfVxuICB9LFxuICBob29rczoge1xuICAgIGNyZWF0ZVJ4RGF0YWJhc2UoZGF0YWJhc2UpIHtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBkYXRhYmFzZS5vcHRpb25zLnJlcGxpY2F0aW9uO1xuICAgICAgZGF0YWJhc2Uub3B0aW9ucy5yZXBsaWNhdGlvbiA9IHtcbiAgICAgICAgZmllbGQ6ICdyeF9tb2RlbCcsXG4gICAgICAgIC4uLm9wdGlvbnNcbiAgICAgIH07XG4gICAgICBkYXRhYmFzZS5yZXBsaWNhdGlvbnMgPSBbXTtcbiAgICAgIGRhdGFiYXNlLnJlcGxpY2F0ZSA9IGZ1bmN0aW9uIHJlcGxpY2F0ZSguLi5hcmdzKSB7XG4gICAgICAgIGNvbnN0IHJlcGxpY2F0aW9uID0gbmV3IFJlcGxpY2F0aW9uKGRhdGFiYXNlLCAuLi5hcmdzKTtcblxuICAgICAgICBkYXRhYmFzZS5yZXBsaWNhdGlvbnMucHVzaChyZXBsaWNhdGlvbik7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gZGF0YWJhc2UucmVwbGljYXRpb25zLmxlbmd0aCAtIDE7XG4gICAgICAgIHJlcGxpY2F0aW9uLmRlc3Ryb3kgPSBhc3luYyBmdW5jdGlvbiBkZXN0cm95KCkge1xuICAgICAgICAgIGF3YWl0IHJlcGxpY2F0aW9uLmNsb3NlKCk7XG4gICAgICAgICAgZGF0YWJhc2UucmVwbGljYXRpb25zID0gZGF0YWJhc2UucmVwbGljYXRpb25zXG4gICAgICAgICAgICAuc2xpY2UoMCwgaW5kZXgpXG4gICAgICAgICAgICAuY29uY2F0KGRhdGFiYXNlLnJlcGxpY2F0aW9ucy5zbGljZShpbmRleCArIDEpKTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gcmVwbGljYXRpb247XG4gICAgICB9O1xuICAgIH0sXG4gICAgcHJlQ3JlYXRlUnhDb2xsZWN0aW9uKG1vZGVsKSB7XG4gICAgICBjb25zdCBuYW1lID0gbW9kZWwubmFtZTtcbiAgICAgIGlmICghbmFtZSkgdGhyb3cgRXJyb3IoJ1J4Q29sbGVjdGlvbihzKSBtdXN0IGhhdmUgYSBcIm5hbWVcIiBwcm9wZXJ0eScpO1xuICAgICAgaWYgKCFtb2RlbC5zY2hlbWEgfHwgIW1vZGVsLnNjaGVtYS5wcm9wZXJ0aWVzKSB7XG4gICAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAgICdSeENvbGxlY3Rpb24ocykgbXVzdCBoYXZlIGEgYSBcInNjaGVtYVwiIHByb3BlcnR5LCB3aXRoIGEgXCJwcm9wZXJ0aWVzXCIga2V5J1xuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBmaWVsZCA9IG1vZGVsLmRhdGFiYXNlLm9wdGlvbnMucmVwbGljYXRpb24uZmllbGQ7XG4gICAgICBjb25zdCByeE1vZGVsID0gbW9kZWwuc2NoZW1hLnByb3BlcnRpZXNbZmllbGRdO1xuICAgICAgaWYgKHJ4TW9kZWwgJiYgKHJ4TW9kZWwudHlwZSAhPT0gJ3N0cmluZycgfHwgcnhNb2RlbC5kZWZhdWx0ICE9PSBuYW1lKSkge1xuICAgICAgICB0aHJvdyBFcnJvcihgU2NoZW1hIHByb3BlcnR5IFwiJHtmaWVsZH1cIiBpcyByZXNlcnZlZCBieSByZXBsaWNhdGlvbmApO1xuICAgICAgfVxuICAgICAgbW9kZWwuc2NoZW1hLnByb3BlcnRpZXNbZmllbGRdID0ge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZW51bTogW25hbWVdLFxuICAgICAgICBkZWZhdWx0OiBuYW1lLFxuICAgICAgICBmaW5hbDogdHJ1ZSxcbiAgICAgICAgcnhfbW9kZWw6IHRydWVcbiAgICAgIH07XG4gICAgfVxuICB9XG59O1xuXG5jbGFzcyBSZXBsaWNhdGlvbiB7XG4gIGNvbnN0cnVjdG9yKGRhdGFiYXNlLCByZW1vdGUsIGNvbGxlY3Rpb25OYW1lcywgZGlyZWN0aW9uLCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLnJlbW90ZSA9IHJlbW90ZTtcbiAgICB0aGlzLmRpcmVjdG9uID0gZGlyZWN0aW9uO1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy5jb2xsZWN0aW9ucyA9ICFjb2xsZWN0aW9uTmFtZXNcbiAgICAgID8gZGF0YWJhc2UuY29sbGVjdGlvbnNcbiAgICAgIDogY29sbGVjdGlvbk5hbWVzLnJlZHVjZSgoYWNjLCBrZXkpID0+IHtcbiAgICAgICAgICBpZiAoZGF0YWJhc2UuY29sbGVjdGlvbnNba2V5XSkgYWNjW2tleV0gPSBkYXRhYmFzZS5jb2xsZWN0aW9uc1trZXldO1xuICAgICAgICAgIHJldHVybiBhY2M7XG4gICAgICAgIH0sIHt9KTtcblxuICAgIHRoaXMucmVwbGljYXRpb25TdGF0ZXMgPSBbXTtcbiAgICB0aGlzLmFsaXZlID0gZmFsc2U7XG5cbiAgICB0aGlzLl9maWVsZCA9IGRhdGFiYXNlLm9wdGlvbnMucmVwbGljYXRpb24uZmllbGQ7XG4gICAgdGhpcy5fc3RhdGVzID0gW107XG4gICAgdGhpcy5fc3Vic2NyaWJlcnMgPSBbXTtcbiAgICB0aGlzLl9hbGl2ZVN1YmplY3QgPSBuZXcgQmVoYXZpb3JTdWJqZWN0KGZhbHNlKTtcbiAgICB0aGlzLl9lcnJvclN1YmplY3QgPSBuZXcgU3ViamVjdCgpO1xuICAgIHRoaXMuX3BSZXBsaWNhdGlvblN0YXRlcyA9IFByb21pc2UucmVzb2x2ZShbXSk7XG4gIH1cbiAgZ2V0IGFsaXZlJCgpIHtcbiAgICByZXR1cm4gdGhpcy5fYWxpdmVTdWJqZWN0LmFzT2JzZXJ2YWJsZSgpO1xuICB9XG4gIC8vIFRPRE86IHRlc3QgZXJyb3Igc3Vic2NyaXB0aW9uXG4gIGdldCBlcnJvciQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2Vycm9yU3ViamVjdC5hc09ic2VydmFibGUoKTtcbiAgfVxuICBhc3luYyBjb25uZWN0KCkge1xuICAgIGF3YWl0IHRoaXMuY2xvc2UoKTtcblxuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLl9jcmVhdGVGaWx0ZXIodGhpcy5yZW1vdGUpO1xuICAgICAgYXdhaXQgdGhpcy5fc3luYygpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhpcy5fZXJyb3JTdWJqZWN0Lm5leHQoZSk7XG4gICAgICB0aGlzLl9pbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgdGhpcy5fY3JlYXRlRmlsdGVyKHRoaXMucmVtb3RlKVxuICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5faW50ZXJ2YWwpO1xuICAgICAgICAgICAgdGhpcy5fc3luYygpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKChlKSA9PiB0aGlzLl9lcnJvclN1YmplY3QubmV4dChlKSk7XG4gICAgICB9LCA1MDAwKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgYXN5bmMgY2xvc2UoKSB7XG4gICAgY2xlYXJJbnRlcnZhbCh0aGlzLl9pbnRlcnZhbCk7XG5cbiAgICB0aGlzLl9zdWJzY3JpYmVycy5mb3JFYWNoKCh4KSA9PiB4LnVuc3Vic2NyaWJlKCkpO1xuICAgIHRoaXMuX3N1YnNjcmliZXJzID0gW107XG4gICAgdGhpcy5fc3RhdGVzID0gW107XG5cbiAgICBpZiAodGhpcy5hbGl2ZSkge1xuICAgICAgdGhpcy5hbGl2ZSA9IGZhbHNlO1xuICAgICAgdGhpcy5fYWxpdmVTdWJqZWN0Lm5leHQoZmFsc2UpO1xuICAgIH1cblxuICAgIGF3YWl0IHRoaXMuX3BSZXBsaWNhdGlvblN0YXRlcy50aGVuKChhcnIpID0+IHtcbiAgICAgIHJldHVybiBQcm9taXNlLmFsbChhcnIubWFwKCh4KSA9PiB4LmNhbmNlbCgpKSk7XG4gICAgfSk7XG4gICAgdGhpcy5fcFJlcGxpY2F0aW9uU3RhdGVzID0gUHJvbWlzZS5yZXNvbHZlKFtdKTtcbiAgICB0aGlzLnJlcGxpY2F0aW9uU3RhdGVzID0gW107XG4gIH1cbiAgLy8gUHJpdmF0ZVxuICBhc3luYyBfc3luYygpIHtcbiAgICBjb25zdCBjb2xsZWN0aW9ucyA9IHRoaXMuY29sbGVjdGlvbnM7XG4gICAgY29uc3QgY29sbGVjdGlvbk5hbWVzID0gT2JqZWN0LmtleXMoY29sbGVjdGlvbnMpO1xuICAgIGNvbnN0IHByb21pc2VzID0gY29sbGVjdGlvbk5hbWVzLm1hcCgobmFtZSkgPT4ge1xuICAgICAgcmV0dXJuIGNvbGxlY3Rpb25zW25hbWVdLnN5bmMoe1xuICAgICAgICByZW1vdGU6IHRoaXMucmVtb3RlLFxuICAgICAgICBkaXJlY3Rpb246IHRoaXMuZGlyZWN0aW9uLFxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgLi4udGhpcy5vcHRpb25zLFxuICAgICAgICAgIGxpdmU6IHRoaXMub3B0aW9ucy5saXZlIHx8IHRydWUsXG4gICAgICAgICAgcmV0cnk6IHRoaXMub3B0aW9ucy5yZXRyeSB8fCB0cnVlLFxuICAgICAgICAgIC8vIHNlbGVjdG9yOiB7IHJ4X21vZGVsOiBuYW1lIH1cbiAgICAgICAgICBmaWx0ZXI6ICdhcHAvYnlfbW9kZWwnLFxuICAgICAgICAgIHF1ZXJ5X3BhcmFtczogeyBbdGhpcy5fZmllbGRdOiBuYW1lIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBhbGxBbGl2ZSA9IHByb21pc2VzLm1hcCgoKSA9PiBmYWxzZSk7XG4gICAgdGhpcy5fcFJlcGxpY2F0aW9uU3RhdGVzID0gUHJvbWlzZS5hbGwocHJvbWlzZXMpXG4gICAgICAudGhlbigoYXJyKSA9PiB7XG4gICAgICAgIGFyci5mb3JFYWNoKChyZXAsIGkpID0+IHtcbiAgICAgICAgICB0aGlzLl9zdWJzY3JpYmVycy5wdXNoKFxuICAgICAgICAgICAgcmVwLmFsaXZlJC5zdWJzY3JpYmUoKHZhbCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCByZXBBbGl2ZSA9IGFsbEFsaXZlW2ldO1xuXG4gICAgICAgICAgICAgIGlmIChyZXBBbGl2ZSA9PT0gdmFsKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgYWxsQWxpdmVbaV0gPSB2YWw7XG4gICAgICAgICAgICAgIGNvbnN0IGFsaXZlID0gYWxsQWxpdmUucmVkdWNlKChhY2MsIHgpID0+IGFjYyAmJiB4LCB0cnVlKTtcblxuICAgICAgICAgICAgICBpZiAoYWxpdmUgPT09IHRoaXMuYWxpdmUpIHJldHVybjtcbiAgICAgICAgICAgICAgdGhpcy5hbGl2ZSA9IGFsaXZlO1xuICAgICAgICAgICAgICB0aGlzLl9hbGl2ZVN1YmplY3QubmV4dChhbGl2ZSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gYXJyO1xuICAgICAgfSlcbiAgICAgIC50aGVuKChhcnIpID0+ICh0aGlzLnJlcGxpY2F0aW9uU3RhdGVzID0gYXJyKSk7XG5cbiAgICBhd2FpdCB0aGlzLl9wUmVwbGljYXRpb25TdGF0ZXM7XG4gIH1cbiAgYXN5bmMgX2NyZWF0ZUZpbHRlcigpIHtcbiAgICAvLyBodHRwczovL3BvdWNoZGIuY29tLzIwMTUvMDQvMDUvZmlsdGVyZWQtcmVwbGljYXRpb24uaHRtbFxuICAgIGNvbnN0IGZpZWxkID0gdGhpcy5fZmllbGQ7XG4gICAgY29uc3QgcmVtb3RlSXNVcmwgPSB0eXBlb2YgdGhpcy5yZW1vdGUgPT09ICdzdHJpbmcnO1xuICAgIGNvbnN0IGRiID0gcmVtb3RlSXNVcmwgPyBuZXcgUG91Y2hEQih0aGlzLnJlbW90ZSkgOiB0aGlzLnJlbW90ZTtcbiAgICBjb25zdCBkb2MgPSB7XG4gICAgICB2ZXJzaW9uOiAwLFxuICAgICAgX2lkOiAnX2Rlc2lnbi9hcHAnLFxuICAgICAgZmlsdGVyczoge1xuICAgICAgICAvLyBub3QgZG9pbmcgZm4udG9TdHJpbmcoKSBhcyBpc3RhbWJ1bCBjb2RlXG4gICAgICAgIC8vIG9uIHRlc3RzIGJyZWFrcyBpdFxuICAgICAgICBieV9tb2RlbDogYGZ1bmN0aW9uKGRvYywgcmVxKSB7XG4gICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIGRvYy5faWQgPT09ICdfZGVzaWduL2FwcCcgfHwgZG9jW1wiJHtmaWVsZH1cIl0gPT09IHJlcS5xdWVyeVtcIiR7ZmllbGR9XCJdXG4gICAgICAgICAgKTtcbiAgICAgICAgfWBcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgYXdhaXQgZGJcbiAgICAgIC5nZXQoJ19kZXNpZ24vYXBwJylcbiAgICAgIC50aGVuKCh7IHZlcnNpb24sIF9yZXYgfSkgPT4ge1xuICAgICAgICByZXR1cm4gdmVyc2lvbiA8IGRvYy52ZXJzaW9uID8gZGIucHV0KHsgLi4uZG9jLCBfcmV2IH0pIDogdHJ1ZTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKCkgPT4gZGIucHV0KGRvYykpO1xuXG4gICAgaWYgKHJlbW90ZUlzVXJsKSBkYi5jbG9zZSgpO1xuICB9XG59XG4iXX0=