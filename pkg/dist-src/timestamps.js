function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

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

export default {
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