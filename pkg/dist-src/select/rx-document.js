function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import parseProperties from "./parse-properties.js";
export default function RxDocument(proto) {
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