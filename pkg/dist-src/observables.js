import { from, of } from 'rxjs';
import { take, switchMap } from 'rxjs/operators';
export default {
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