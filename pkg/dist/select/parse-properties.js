"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseProperties;

var _lodash = _interopRequireDefault(require("lodash.merge"));

var _lodash2 = _interopRequireDefault(require("lodash.flattendeep"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parseObj(obj) {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (!value) return acc;
    if (Array.isArray(value)) acc[key] = parseProperties(value);else if (typeof value === 'object') acc[key] = parseObj(value);else if (typeof value === 'string') acc[key] = parseString(value);else acc[key] = {};
    return acc;
  }, {});
}

function parseString(str) {
  const all = str.split('.');
  const obj = {};
  let current = obj;
  all.forEach(key => {
    if (!current[key]) current[key] = {};
    current = current[key];
  });
  return obj;
}

function parseProperties(propertiesArr) {
  if (!Array.isArray(propertiesArr)) throw Error('invalid properties');
  propertiesArr = (0, _lodash2.default)(propertiesArr);
  let properties = {};
  propertiesArr.forEach(property => {
    switch (typeof property) {
      case 'string':
        return properties = (0, _lodash.default)(properties, parseString(property));

      case 'object':
        return properties = (0, _lodash.default)(properties, parseObj(property));

      default:
        throw Error('invalid properties');
    }
  });
  return properties;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZWxlY3QvcGFyc2UtcHJvcGVydGllcy5qcyJdLCJuYW1lcyI6WyJwYXJzZU9iaiIsIm9iaiIsIk9iamVjdCIsImVudHJpZXMiLCJyZWR1Y2UiLCJhY2MiLCJrZXkiLCJ2YWx1ZSIsIkFycmF5IiwiaXNBcnJheSIsInBhcnNlUHJvcGVydGllcyIsInBhcnNlU3RyaW5nIiwic3RyIiwiYWxsIiwic3BsaXQiLCJjdXJyZW50IiwiZm9yRWFjaCIsInByb3BlcnRpZXNBcnIiLCJFcnJvciIsInByb3BlcnRpZXMiLCJwcm9wZXJ0eSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOzs7O0FBRUEsU0FBU0EsUUFBVCxDQUFrQkMsR0FBbEIsRUFBdUI7QUFDckIsU0FBT0MsTUFBTSxDQUFDQyxPQUFQLENBQWVGLEdBQWYsRUFBb0JHLE1BQXBCLENBQTJCLENBQUNDLEdBQUQsRUFBTSxDQUFDQyxHQUFELEVBQU1DLEtBQU4sQ0FBTixLQUF1QjtBQUN2RCxRQUFJLENBQUNBLEtBQUwsRUFBWSxPQUFPRixHQUFQO0FBRVosUUFBSUcsS0FBSyxDQUFDQyxPQUFOLENBQWNGLEtBQWQsQ0FBSixFQUEwQkYsR0FBRyxDQUFDQyxHQUFELENBQUgsR0FBV0ksZUFBZSxDQUFDSCxLQUFELENBQTFCLENBQTFCLEtBQ0ssSUFBSSxPQUFPQSxLQUFQLEtBQWlCLFFBQXJCLEVBQStCRixHQUFHLENBQUNDLEdBQUQsQ0FBSCxHQUFXTixRQUFRLENBQUNPLEtBQUQsQ0FBbkIsQ0FBL0IsS0FDQSxJQUFJLE9BQU9BLEtBQVAsS0FBaUIsUUFBckIsRUFBK0JGLEdBQUcsQ0FBQ0MsR0FBRCxDQUFILEdBQVdLLFdBQVcsQ0FBQ0osS0FBRCxDQUF0QixDQUEvQixLQUNBRixHQUFHLENBQUNDLEdBQUQsQ0FBSCxHQUFXLEVBQVg7QUFFTCxXQUFPRCxHQUFQO0FBQ0QsR0FUTSxFQVNKLEVBVEksQ0FBUDtBQVVEOztBQUVELFNBQVNNLFdBQVQsQ0FBcUJDLEdBQXJCLEVBQTBCO0FBQ3hCLFFBQU1DLEdBQUcsR0FBR0QsR0FBRyxDQUFDRSxLQUFKLENBQVUsR0FBVixDQUFaO0FBQ0EsUUFBTWIsR0FBRyxHQUFHLEVBQVo7QUFDQSxNQUFJYyxPQUFPLEdBQUdkLEdBQWQ7QUFDQVksRUFBQUEsR0FBRyxDQUFDRyxPQUFKLENBQWFWLEdBQUQsSUFBUztBQUNuQixRQUFJLENBQUNTLE9BQU8sQ0FBQ1QsR0FBRCxDQUFaLEVBQW1CUyxPQUFPLENBQUNULEdBQUQsQ0FBUCxHQUFlLEVBQWY7QUFDbkJTLElBQUFBLE9BQU8sR0FBR0EsT0FBTyxDQUFDVCxHQUFELENBQWpCO0FBQ0QsR0FIRDtBQUlBLFNBQU9MLEdBQVA7QUFDRDs7QUFFYyxTQUFTUyxlQUFULENBQXlCTyxhQUF6QixFQUF3QztBQUNyRCxNQUFJLENBQUNULEtBQUssQ0FBQ0MsT0FBTixDQUFjUSxhQUFkLENBQUwsRUFBbUMsTUFBTUMsS0FBSyxDQUFDLG9CQUFELENBQVg7QUFDbkNELEVBQUFBLGFBQWEsR0FBRyxzQkFBWUEsYUFBWixDQUFoQjtBQUVBLE1BQUlFLFVBQVUsR0FBRyxFQUFqQjtBQUNBRixFQUFBQSxhQUFhLENBQUNELE9BQWQsQ0FBdUJJLFFBQUQsSUFBYztBQUNsQyxZQUFRLE9BQU9BLFFBQWY7QUFDRSxXQUFLLFFBQUw7QUFDRSxlQUFRRCxVQUFVLEdBQUcscUJBQU1BLFVBQU4sRUFBa0JSLFdBQVcsQ0FBQ1MsUUFBRCxDQUE3QixDQUFyQjs7QUFDRixXQUFLLFFBQUw7QUFDRSxlQUFRRCxVQUFVLEdBQUcscUJBQU1BLFVBQU4sRUFBa0JuQixRQUFRLENBQUNvQixRQUFELENBQTFCLENBQXJCOztBQUNGO0FBQ0UsY0FBTUYsS0FBSyxDQUFDLG9CQUFELENBQVg7QUFOSjtBQVFELEdBVEQ7QUFXQSxTQUFPQyxVQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbWVyZ2UgZnJvbSAnbG9kYXNoLm1lcmdlJztcbmltcG9ydCBmbGF0dGVuRGVlcCBmcm9tICdsb2Rhc2guZmxhdHRlbmRlZXAnO1xuXG5mdW5jdGlvbiBwYXJzZU9iaihvYmopIHtcbiAgcmV0dXJuIE9iamVjdC5lbnRyaWVzKG9iaikucmVkdWNlKChhY2MsIFtrZXksIHZhbHVlXSkgPT4ge1xuICAgIGlmICghdmFsdWUpIHJldHVybiBhY2M7XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIGFjY1trZXldID0gcGFyc2VQcm9wZXJ0aWVzKHZhbHVlKTtcbiAgICBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSBhY2Nba2V5XSA9IHBhcnNlT2JqKHZhbHVlKTtcbiAgICBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSBhY2Nba2V5XSA9IHBhcnNlU3RyaW5nKHZhbHVlKTtcbiAgICBlbHNlIGFjY1trZXldID0ge307XG5cbiAgICByZXR1cm4gYWNjO1xuICB9LCB7fSk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlU3RyaW5nKHN0cikge1xuICBjb25zdCBhbGwgPSBzdHIuc3BsaXQoJy4nKTtcbiAgY29uc3Qgb2JqID0ge307XG4gIGxldCBjdXJyZW50ID0gb2JqO1xuICBhbGwuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgaWYgKCFjdXJyZW50W2tleV0pIGN1cnJlbnRba2V5XSA9IHt9O1xuICAgIGN1cnJlbnQgPSBjdXJyZW50W2tleV07XG4gIH0pO1xuICByZXR1cm4gb2JqO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZVByb3BlcnRpZXMocHJvcGVydGllc0Fycikge1xuICBpZiAoIUFycmF5LmlzQXJyYXkocHJvcGVydGllc0FycikpIHRocm93IEVycm9yKCdpbnZhbGlkIHByb3BlcnRpZXMnKTtcbiAgcHJvcGVydGllc0FyciA9IGZsYXR0ZW5EZWVwKHByb3BlcnRpZXNBcnIpO1xuXG4gIGxldCBwcm9wZXJ0aWVzID0ge307XG4gIHByb3BlcnRpZXNBcnIuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcbiAgICBzd2l0Y2ggKHR5cGVvZiBwcm9wZXJ0eSkge1xuICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgcmV0dXJuIChwcm9wZXJ0aWVzID0gbWVyZ2UocHJvcGVydGllcywgcGFyc2VTdHJpbmcocHJvcGVydHkpKSk7XG4gICAgICBjYXNlICdvYmplY3QnOlxuICAgICAgICByZXR1cm4gKHByb3BlcnRpZXMgPSBtZXJnZShwcm9wZXJ0aWVzLCBwYXJzZU9iaihwcm9wZXJ0eSkpKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IEVycm9yKCdpbnZhbGlkIHByb3BlcnRpZXMnKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBwcm9wZXJ0aWVzO1xufVxuIl19