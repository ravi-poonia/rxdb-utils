"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = register;

var _models = _interopRequireDefault(require("./models"));

var _collections = _interopRequireDefault(require("./collections"));

var _defaultValues = _interopRequireDefault(require("./default-values"));

var _timestamps = _interopRequireDefault(require("./timestamps"));

var _views = _interopRequireDefault(require("./views"));

var _select = _interopRequireDefault(require("./select"));

var _observables = _interopRequireDefault(require("./observables"));

var _hooks = _interopRequireDefault(require("./hooks"));

var _replication = _interopRequireDefault(require("./replication"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function register(addRxPlugin) {
  addRxPlugin(_models.default);
  addRxPlugin(_collections.default);
  addRxPlugin(_defaultValues.default);
  addRxPlugin(_timestamps.default);
  addRxPlugin(_views.default);
  addRxPlugin(_select.default);
  addRxPlugin(_observables.default);
  addRxPlugin(_hooks.default);
  addRxPlugin(_replication.default);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJyZWdpc3RlciIsImFkZFJ4UGx1Z2luIiwibW9kZWxzIiwiY29sbGVjdGlvbnMiLCJkZWZhdWx0VmFsdWVzIiwidGltZXN0YW1wcyIsInZpZXdzIiwic2VsZWN0Iiwib2JzZXJ2YWJsZXMiLCJob29rcyIsInJlcGxpY2F0aW9uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFFZSxTQUFTQSxRQUFULENBQW1CQyxXQUFuQixFQUFnQztBQUM3Q0EsRUFBQUEsV0FBVyxDQUFDQyxlQUFELENBQVg7QUFDQUQsRUFBQUEsV0FBVyxDQUFDRSxvQkFBRCxDQUFYO0FBQ0FGLEVBQUFBLFdBQVcsQ0FBQ0csc0JBQUQsQ0FBWDtBQUNBSCxFQUFBQSxXQUFXLENBQUNJLG1CQUFELENBQVg7QUFDQUosRUFBQUEsV0FBVyxDQUFDSyxjQUFELENBQVg7QUFDQUwsRUFBQUEsV0FBVyxDQUFDTSxlQUFELENBQVg7QUFDQU4sRUFBQUEsV0FBVyxDQUFDTyxvQkFBRCxDQUFYO0FBQ0FQLEVBQUFBLFdBQVcsQ0FBQ1EsY0FBRCxDQUFYO0FBQ0FSLEVBQUFBLFdBQVcsQ0FBQ1Msb0JBQUQsQ0FBWDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG1vZGVscyBmcm9tICcuL21vZGVscydcbmltcG9ydCBjb2xsZWN0aW9ucyBmcm9tICcuL2NvbGxlY3Rpb25zJ1xuaW1wb3J0IGRlZmF1bHRWYWx1ZXMgZnJvbSAnLi9kZWZhdWx0LXZhbHVlcydcbmltcG9ydCB0aW1lc3RhbXBzIGZyb20gJy4vdGltZXN0YW1wcydcbmltcG9ydCB2aWV3cyBmcm9tICcuL3ZpZXdzJ1xuaW1wb3J0IHNlbGVjdCBmcm9tICcuL3NlbGVjdCdcbmltcG9ydCBvYnNlcnZhYmxlcyBmcm9tICcuL29ic2VydmFibGVzJ1xuaW1wb3J0IGhvb2tzIGZyb20gJy4vaG9va3MnXG5pbXBvcnQgcmVwbGljYXRpb24gZnJvbSAnLi9yZXBsaWNhdGlvbidcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmVnaXN0ZXIgKGFkZFJ4UGx1Z2luKSB7XG4gIGFkZFJ4UGx1Z2luKG1vZGVscylcbiAgYWRkUnhQbHVnaW4oY29sbGVjdGlvbnMpXG4gIGFkZFJ4UGx1Z2luKGRlZmF1bHRWYWx1ZXMpXG4gIGFkZFJ4UGx1Z2luKHRpbWVzdGFtcHMpXG4gIGFkZFJ4UGx1Z2luKHZpZXdzKVxuICBhZGRSeFBsdWdpbihzZWxlY3QpXG4gIGFkZFJ4UGx1Z2luKG9ic2VydmFibGVzKVxuICBhZGRSeFBsdWdpbihob29rcylcbiAgYWRkUnhQbHVnaW4ocmVwbGljYXRpb24pXG59XG4iXX0=