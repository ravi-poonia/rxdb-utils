function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

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