function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

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

          return _asyncToGenerator(function* () {
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