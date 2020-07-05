"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rxQuery = _interopRequireDefault(require("./rx-query"));

var _rxDocument = _interopRequireDefault(require("./rx-document"));

var _constants = require("./constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  rxdb: true,
  prototypes: {
    RxQuery: _rxQuery.default
  },
  overwritable: {},
  hooks: {
    createRxCollection(collection) {
      const {
        options
      } = collection;
      if (!options || !options.views) return;
      const desc = Object.getOwnPropertyDescriptors(options.views);
      const views = Object.entries(desc).filter(([_, {
        get
      }]) => get); // Views keys live on collection._views

      collection._views = views.map(([key]) => key);
      const proto = collection.getDocumentPrototype();
      (0, _rxDocument.default)(proto, views);
    },

    postCreateRxDocument(doc) {
      doc[_constants.OBSERVABLES_SYMBOL] = {};
    }

  }
};
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy92aWV3cy9pbmRleC5qcyJdLCJuYW1lcyI6WyJyeGRiIiwicHJvdG90eXBlcyIsIlJ4UXVlcnkiLCJvdmVyd3JpdGFibGUiLCJob29rcyIsImNyZWF0ZVJ4Q29sbGVjdGlvbiIsImNvbGxlY3Rpb24iLCJvcHRpb25zIiwidmlld3MiLCJkZXNjIiwiT2JqZWN0IiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyIsImVudHJpZXMiLCJmaWx0ZXIiLCJfIiwiZ2V0IiwiX3ZpZXdzIiwibWFwIiwia2V5IiwicHJvdG8iLCJnZXREb2N1bWVudFByb3RvdHlwZSIsInBvc3RDcmVhdGVSeERvY3VtZW50IiwiZG9jIiwiT0JTRVJWQUJMRVNfU1lNQk9MIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7Ozs7ZUFFZTtBQUNiQSxFQUFBQSxJQUFJLEVBQUUsSUFETztBQUViQyxFQUFBQSxVQUFVLEVBQUU7QUFDVkMsSUFBQUEsT0FBTyxFQUFQQTtBQURVLEdBRkM7QUFLYkMsRUFBQUEsWUFBWSxFQUFFLEVBTEQ7QUFNYkMsRUFBQUEsS0FBSyxFQUFFO0FBQ0xDLElBQUFBLGtCQUFrQixDQUFDQyxVQUFELEVBQWE7QUFDN0IsWUFBTTtBQUFFQyxRQUFBQTtBQUFGLFVBQWNELFVBQXBCO0FBQ0EsVUFBSSxDQUFDQyxPQUFELElBQVksQ0FBQ0EsT0FBTyxDQUFDQyxLQUF6QixFQUFnQztBQUVoQyxZQUFNQyxJQUFJLEdBQUdDLE1BQU0sQ0FBQ0MseUJBQVAsQ0FBaUNKLE9BQU8sQ0FBQ0MsS0FBekMsQ0FBYjtBQUNBLFlBQU1BLEtBQUssR0FBR0UsTUFBTSxDQUFDRSxPQUFQLENBQWVILElBQWYsRUFBcUJJLE1BQXJCLENBQTRCLENBQUMsQ0FBQ0MsQ0FBRCxFQUFJO0FBQUVDLFFBQUFBO0FBQUYsT0FBSixDQUFELEtBQWtCQSxHQUE5QyxDQUFkLENBTDZCLENBTTdCOztBQUNBVCxNQUFBQSxVQUFVLENBQUNVLE1BQVgsR0FBb0JSLEtBQUssQ0FBQ1MsR0FBTixDQUFVLENBQUMsQ0FBQ0MsR0FBRCxDQUFELEtBQVdBLEdBQXJCLENBQXBCO0FBRUEsWUFBTUMsS0FBSyxHQUFHYixVQUFVLENBQUNjLG9CQUFYLEVBQWQ7QUFDQSwrQkFBV0QsS0FBWCxFQUFrQlgsS0FBbEI7QUFDRCxLQVpJOztBQWFMYSxJQUFBQSxvQkFBb0IsQ0FBQ0MsR0FBRCxFQUFNO0FBQ3hCQSxNQUFBQSxHQUFHLENBQUNDLDZCQUFELENBQUgsR0FBMEIsRUFBMUI7QUFDRDs7QUFmSTtBQU5NLEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUnhRdWVyeSBmcm9tICcuL3J4LXF1ZXJ5JztcbmltcG9ydCBSeERvY3VtZW50IGZyb20gJy4vcngtZG9jdW1lbnQnO1xuaW1wb3J0IHsgT0JTRVJWQUJMRVNfU1lNQk9MIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHJ4ZGI6IHRydWUsXG4gIHByb3RvdHlwZXM6IHtcbiAgICBSeFF1ZXJ5XG4gIH0sXG4gIG92ZXJ3cml0YWJsZToge30sXG4gIGhvb2tzOiB7XG4gICAgY3JlYXRlUnhDb2xsZWN0aW9uKGNvbGxlY3Rpb24pIHtcbiAgICAgIGNvbnN0IHsgb3B0aW9ucyB9ID0gY29sbGVjdGlvbjtcbiAgICAgIGlmICghb3B0aW9ucyB8fCAhb3B0aW9ucy52aWV3cykgcmV0dXJuO1xuXG4gICAgICBjb25zdCBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMob3B0aW9ucy52aWV3cyk7XG4gICAgICBjb25zdCB2aWV3cyA9IE9iamVjdC5lbnRyaWVzKGRlc2MpLmZpbHRlcigoW18sIHsgZ2V0IH1dKSA9PiBnZXQpO1xuICAgICAgLy8gVmlld3Mga2V5cyBsaXZlIG9uIGNvbGxlY3Rpb24uX3ZpZXdzXG4gICAgICBjb2xsZWN0aW9uLl92aWV3cyA9IHZpZXdzLm1hcCgoW2tleV0pID0+IGtleSk7XG5cbiAgICAgIGNvbnN0IHByb3RvID0gY29sbGVjdGlvbi5nZXREb2N1bWVudFByb3RvdHlwZSgpO1xuICAgICAgUnhEb2N1bWVudChwcm90bywgdmlld3MpO1xuICAgIH0sXG4gICAgcG9zdENyZWF0ZVJ4RG9jdW1lbnQoZG9jKSB7XG4gICAgICBkb2NbT0JTRVJWQUJMRVNfU1lNQk9MXSA9IHt9O1xuICAgIH1cbiAgfVxufTtcbiJdfQ==