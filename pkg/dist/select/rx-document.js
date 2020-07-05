"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = RxDocument;

var _rxjs = require("rxjs");

var _operators = require("rxjs/operators");

var _parseProperties = _interopRequireDefault(require("./parse-properties"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function RxDocument(proto) {
  Object.assign(proto, {
    select$(...properties) {
      properties = (0, _parseProperties.default)(properties); // Properties not specified. Get all first level properties,
      // including views from views plugin (if they exist)

      if (!Object.keys(properties).length) {
        const viewsKeys = this.collection._views;
        return viewsKeys && viewsKeys.length ? (0, _rxjs.combineLatest)(this.$, ...viewsKeys.map(key => this[key].$)).pipe((0, _operators.map)(all => _objectSpread({}, all[0], {}, viewsKeys.reduce((acc, key, i) => {
          acc[key] = all[i + 1];
          return acc;
        }, {
          _: this
        })))) : this.$.pipe((0, _operators.map)(res => _objectSpread({}, res, {
          _: this
        })));
      } // Properties specified, parse


      return createCombinedObservable((0, _rxjs.of)(this), properties);
    }

  });
}

function createCombinedObservable(obs, properties) {
  const keys = Object.keys(properties);
  const getObs = [];
  return obs.pipe((0, _operators.switchMap)(res => {
    if (!getObs.length) {
      keys.forEach(key => {
        if (res[key + '$']) return getObs.push(x => x[key + '$']);
        const value = res[key];
        if (value && value.$) return getObs.push(x => x[key].$);
        return getObs.push(x => x[key]);
      });
    }

    return (0, _rxjs.combineLatest)(...getObs.map((getObsFn, i) => {
      const nextProperties = properties[keys[i]];
      return Object.keys(nextProperties).length ? createCombinedObservable(getObsFn(res), nextProperties) : getObsFn(res);
    })).pipe((0, _operators.map)(all => {
      return all.reduce((acc, val, i) => {
        acc[keys[i]] = val;
        return acc;
      }, {
        _: res
      });
    }));
  }));
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZWxlY3QvcngtZG9jdW1lbnQuanMiXSwibmFtZXMiOlsiUnhEb2N1bWVudCIsInByb3RvIiwiT2JqZWN0IiwiYXNzaWduIiwic2VsZWN0JCIsInByb3BlcnRpZXMiLCJrZXlzIiwibGVuZ3RoIiwidmlld3NLZXlzIiwiY29sbGVjdGlvbiIsIl92aWV3cyIsIiQiLCJtYXAiLCJrZXkiLCJwaXBlIiwiYWxsIiwicmVkdWNlIiwiYWNjIiwiaSIsIl8iLCJyZXMiLCJjcmVhdGVDb21iaW5lZE9ic2VydmFibGUiLCJvYnMiLCJnZXRPYnMiLCJmb3JFYWNoIiwicHVzaCIsIngiLCJ2YWx1ZSIsImdldE9ic0ZuIiwibmV4dFByb3BlcnRpZXMiLCJ2YWwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7OztBQUVlLFNBQVNBLFVBQVQsQ0FBb0JDLEtBQXBCLEVBQTJCO0FBQ3hDQyxFQUFBQSxNQUFNLENBQUNDLE1BQVAsQ0FBY0YsS0FBZCxFQUFxQjtBQUNuQkcsSUFBQUEsT0FBTyxDQUFDLEdBQUdDLFVBQUosRUFBZ0I7QUFDckJBLE1BQUFBLFVBQVUsR0FBRyw4QkFBZ0JBLFVBQWhCLENBQWIsQ0FEcUIsQ0FHckI7QUFDQTs7QUFDQSxVQUFJLENBQUNILE1BQU0sQ0FBQ0ksSUFBUCxDQUFZRCxVQUFaLEVBQXdCRSxNQUE3QixFQUFxQztBQUNuQyxjQUFNQyxTQUFTLEdBQUcsS0FBS0MsVUFBTCxDQUFnQkMsTUFBbEM7QUFDQSxlQUFPRixTQUFTLElBQUlBLFNBQVMsQ0FBQ0QsTUFBdkIsR0FDSCx5QkFBYyxLQUFLSSxDQUFuQixFQUFzQixHQUFHSCxTQUFTLENBQUNJLEdBQVYsQ0FBZUMsR0FBRCxJQUFTLEtBQUtBLEdBQUwsRUFBVUYsQ0FBakMsQ0FBekIsRUFBOERHLElBQTlELENBQ0Usb0JBQUtDLEdBQUQsc0JBQ0NBLEdBQUcsQ0FBQyxDQUFELENBREosTUFFQ1AsU0FBUyxDQUFDUSxNQUFWLENBQ0QsQ0FBQ0MsR0FBRCxFQUFNSixHQUFOLEVBQVdLLENBQVgsS0FBaUI7QUFDZkQsVUFBQUEsR0FBRyxDQUFDSixHQUFELENBQUgsR0FBV0UsR0FBRyxDQUFDRyxDQUFDLEdBQUcsQ0FBTCxDQUFkO0FBQ0EsaUJBQU9ELEdBQVA7QUFDRCxTQUpBLEVBS0Q7QUFBRUUsVUFBQUEsQ0FBQyxFQUFFO0FBQUwsU0FMQyxDQUZELENBQUosQ0FERixDQURHLEdBYUgsS0FBS1IsQ0FBTCxDQUFPRyxJQUFQLENBQVksb0JBQUtNLEdBQUQsc0JBQWVBLEdBQWY7QUFBb0JELFVBQUFBLENBQUMsRUFBRTtBQUF2QixVQUFKLENBQVosQ0FiSjtBQWNELE9BckJvQixDQXVCckI7OztBQUNBLGFBQU9FLHdCQUF3QixDQUFDLGNBQUcsSUFBSCxDQUFELEVBQVdoQixVQUFYLENBQS9CO0FBQ0Q7O0FBMUJrQixHQUFyQjtBQTRCRDs7QUFFRCxTQUFTZ0Isd0JBQVQsQ0FBa0NDLEdBQWxDLEVBQXVDakIsVUFBdkMsRUFBbUQ7QUFDakQsUUFBTUMsSUFBSSxHQUFHSixNQUFNLENBQUNJLElBQVAsQ0FBWUQsVUFBWixDQUFiO0FBRUEsUUFBTWtCLE1BQU0sR0FBRyxFQUFmO0FBQ0EsU0FBT0QsR0FBRyxDQUFDUixJQUFKLENBQ0wsMEJBQVdNLEdBQUQsSUFBUztBQUNqQixRQUFJLENBQUNHLE1BQU0sQ0FBQ2hCLE1BQVosRUFBb0I7QUFDbEJELE1BQUFBLElBQUksQ0FBQ2tCLE9BQUwsQ0FBY1gsR0FBRCxJQUFTO0FBQ3BCLFlBQUlPLEdBQUcsQ0FBQ1AsR0FBRyxHQUFHLEdBQVAsQ0FBUCxFQUFvQixPQUFPVSxNQUFNLENBQUNFLElBQVAsQ0FBYUMsQ0FBRCxJQUFPQSxDQUFDLENBQUNiLEdBQUcsR0FBRyxHQUFQLENBQXBCLENBQVA7QUFFcEIsY0FBTWMsS0FBSyxHQUFHUCxHQUFHLENBQUNQLEdBQUQsQ0FBakI7QUFDQSxZQUFJYyxLQUFLLElBQUlBLEtBQUssQ0FBQ2hCLENBQW5CLEVBQXNCLE9BQU9ZLE1BQU0sQ0FBQ0UsSUFBUCxDQUFhQyxDQUFELElBQU9BLENBQUMsQ0FBQ2IsR0FBRCxDQUFELENBQU9GLENBQTFCLENBQVA7QUFFdEIsZUFBT1ksTUFBTSxDQUFDRSxJQUFQLENBQWFDLENBQUQsSUFBT0EsQ0FBQyxDQUFDYixHQUFELENBQXBCLENBQVA7QUFDRCxPQVBEO0FBUUQ7O0FBRUQsV0FBTyx5QkFDTCxHQUFHVSxNQUFNLENBQUNYLEdBQVAsQ0FBVyxDQUFDZ0IsUUFBRCxFQUFXVixDQUFYLEtBQWlCO0FBQzdCLFlBQU1XLGNBQWMsR0FBR3hCLFVBQVUsQ0FBQ0MsSUFBSSxDQUFDWSxDQUFELENBQUwsQ0FBakM7QUFDQSxhQUFPaEIsTUFBTSxDQUFDSSxJQUFQLENBQVl1QixjQUFaLEVBQTRCdEIsTUFBNUIsR0FDSGMsd0JBQXdCLENBQUNPLFFBQVEsQ0FBQ1IsR0FBRCxDQUFULEVBQWdCUyxjQUFoQixDQURyQixHQUVIRCxRQUFRLENBQUNSLEdBQUQsQ0FGWjtBQUdELEtBTEUsQ0FERSxFQU9MTixJQVBLLENBUUwsb0JBQUtDLEdBQUQsSUFBUztBQUNYLGFBQU9BLEdBQUcsQ0FBQ0MsTUFBSixDQUNMLENBQUNDLEdBQUQsRUFBTWEsR0FBTixFQUFXWixDQUFYLEtBQWlCO0FBQ2ZELFFBQUFBLEdBQUcsQ0FBQ1gsSUFBSSxDQUFDWSxDQUFELENBQUwsQ0FBSCxHQUFlWSxHQUFmO0FBQ0EsZUFBT2IsR0FBUDtBQUNELE9BSkksRUFLTDtBQUFFRSxRQUFBQSxDQUFDLEVBQUVDO0FBQUwsT0FMSyxDQUFQO0FBT0QsS0FSRCxDQVJLLENBQVA7QUFrQkQsR0E5QkQsQ0FESyxDQUFQO0FBaUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY29tYmluZUxhdGVzdCwgb2YgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IG1hcCwgc3dpdGNoTWFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHBhcnNlUHJvcGVydGllcyBmcm9tICcuL3BhcnNlLXByb3BlcnRpZXMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBSeERvY3VtZW50KHByb3RvKSB7XG4gIE9iamVjdC5hc3NpZ24ocHJvdG8sIHtcbiAgICBzZWxlY3QkKC4uLnByb3BlcnRpZXMpIHtcbiAgICAgIHByb3BlcnRpZXMgPSBwYXJzZVByb3BlcnRpZXMocHJvcGVydGllcyk7XG5cbiAgICAgIC8vIFByb3BlcnRpZXMgbm90IHNwZWNpZmllZC4gR2V0IGFsbCBmaXJzdCBsZXZlbCBwcm9wZXJ0aWVzLFxuICAgICAgLy8gaW5jbHVkaW5nIHZpZXdzIGZyb20gdmlld3MgcGx1Z2luIChpZiB0aGV5IGV4aXN0KVxuICAgICAgaWYgKCFPYmplY3Qua2V5cyhwcm9wZXJ0aWVzKS5sZW5ndGgpIHtcbiAgICAgICAgY29uc3Qgdmlld3NLZXlzID0gdGhpcy5jb2xsZWN0aW9uLl92aWV3cztcbiAgICAgICAgcmV0dXJuIHZpZXdzS2V5cyAmJiB2aWV3c0tleXMubGVuZ3RoXG4gICAgICAgICAgPyBjb21iaW5lTGF0ZXN0KHRoaXMuJCwgLi4udmlld3NLZXlzLm1hcCgoa2V5KSA9PiB0aGlzW2tleV0uJCkpLnBpcGUoXG4gICAgICAgICAgICAgIG1hcCgoYWxsKSA9PiAoe1xuICAgICAgICAgICAgICAgIC4uLmFsbFswXSxcbiAgICAgICAgICAgICAgICAuLi52aWV3c0tleXMucmVkdWNlKFxuICAgICAgICAgICAgICAgICAgKGFjYywga2V5LCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGFjY1trZXldID0gYWxsW2kgKyAxXTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFjYztcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICB7IF86IHRoaXMgfVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICApXG4gICAgICAgICAgOiB0aGlzLiQucGlwZShtYXAoKHJlcykgPT4gKHsgLi4ucmVzLCBfOiB0aGlzIH0pKSk7XG4gICAgICB9XG5cbiAgICAgIC8vIFByb3BlcnRpZXMgc3BlY2lmaWVkLCBwYXJzZVxuICAgICAgcmV0dXJuIGNyZWF0ZUNvbWJpbmVkT2JzZXJ2YWJsZShvZih0aGlzKSwgcHJvcGVydGllcyk7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQ29tYmluZWRPYnNlcnZhYmxlKG9icywgcHJvcGVydGllcykge1xuICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMocHJvcGVydGllcyk7XG5cbiAgY29uc3QgZ2V0T2JzID0gW107XG4gIHJldHVybiBvYnMucGlwZShcbiAgICBzd2l0Y2hNYXAoKHJlcykgPT4ge1xuICAgICAgaWYgKCFnZXRPYnMubGVuZ3RoKSB7XG4gICAgICAgIGtleXMuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgICAgaWYgKHJlc1trZXkgKyAnJCddKSByZXR1cm4gZ2V0T2JzLnB1c2goKHgpID0+IHhba2V5ICsgJyQnXSk7XG5cbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IHJlc1trZXldO1xuICAgICAgICAgIGlmICh2YWx1ZSAmJiB2YWx1ZS4kKSByZXR1cm4gZ2V0T2JzLnB1c2goKHgpID0+IHhba2V5XS4kKTtcblxuICAgICAgICAgIHJldHVybiBnZXRPYnMucHVzaCgoeCkgPT4geFtrZXldKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjb21iaW5lTGF0ZXN0KFxuICAgICAgICAuLi5nZXRPYnMubWFwKChnZXRPYnNGbiwgaSkgPT4ge1xuICAgICAgICAgIGNvbnN0IG5leHRQcm9wZXJ0aWVzID0gcHJvcGVydGllc1trZXlzW2ldXTtcbiAgICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMobmV4dFByb3BlcnRpZXMpLmxlbmd0aFxuICAgICAgICAgICAgPyBjcmVhdGVDb21iaW5lZE9ic2VydmFibGUoZ2V0T2JzRm4ocmVzKSwgbmV4dFByb3BlcnRpZXMpXG4gICAgICAgICAgICA6IGdldE9ic0ZuKHJlcyk7XG4gICAgICAgIH0pXG4gICAgICApLnBpcGUoXG4gICAgICAgIG1hcCgoYWxsKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGFsbC5yZWR1Y2UoXG4gICAgICAgICAgICAoYWNjLCB2YWwsIGkpID0+IHtcbiAgICAgICAgICAgICAgYWNjW2tleXNbaV1dID0gdmFsO1xuICAgICAgICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHsgXzogcmVzIH1cbiAgICAgICAgICApO1xuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9KVxuICApO1xufVxuIl19