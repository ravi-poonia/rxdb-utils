"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  rxdb: true,
  prototypes: {
    RxDatabase(proto) {
      const prevCollection = proto.collection;
      Object.assign(proto, {
        async collection(model, ...other) {
          const defaultValues = model && model.options && model.options.defaultValues;
          const collection = await prevCollection.call(this, model, other);
          if (!defaultValues) return collection;
          collection.preInsert(data => {
            Object.entries(defaultValues).forEach(([key, value]) => {
              if (!Object.hasOwnProperty.call(data, [key])) {
                data[key] = value;
              }
            });
            return data;
          });
          return collection;
        }

      });
    }

  },
  overwritable: {},
  hooks: {}
};
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kZWZhdWx0LXZhbHVlcy5qcyJdLCJuYW1lcyI6WyJyeGRiIiwicHJvdG90eXBlcyIsIlJ4RGF0YWJhc2UiLCJwcm90byIsInByZXZDb2xsZWN0aW9uIiwiY29sbGVjdGlvbiIsIk9iamVjdCIsImFzc2lnbiIsIm1vZGVsIiwib3RoZXIiLCJkZWZhdWx0VmFsdWVzIiwib3B0aW9ucyIsImNhbGwiLCJwcmVJbnNlcnQiLCJkYXRhIiwiZW50cmllcyIsImZvckVhY2giLCJrZXkiLCJ2YWx1ZSIsImhhc093blByb3BlcnR5Iiwib3ZlcndyaXRhYmxlIiwiaG9va3MiXSwibWFwcGluZ3MiOiI7Ozs7OztlQUFlO0FBQ2JBLEVBQUFBLElBQUksRUFBRSxJQURPO0FBRWJDLEVBQUFBLFVBQVUsRUFBRTtBQUNWQyxJQUFBQSxVQUFVLENBQUNDLEtBQUQsRUFBUTtBQUNoQixZQUFNQyxjQUFjLEdBQUdELEtBQUssQ0FBQ0UsVUFBN0I7QUFDQUMsTUFBQUEsTUFBTSxDQUFDQyxNQUFQLENBQWNKLEtBQWQsRUFBcUI7QUFDbkIsY0FBTUUsVUFBTixDQUFpQkcsS0FBakIsRUFBd0IsR0FBR0MsS0FBM0IsRUFBa0M7QUFDaEMsZ0JBQU1DLGFBQWEsR0FDakJGLEtBQUssSUFBSUEsS0FBSyxDQUFDRyxPQUFmLElBQTBCSCxLQUFLLENBQUNHLE9BQU4sQ0FBY0QsYUFEMUM7QUFHQSxnQkFBTUwsVUFBVSxHQUFHLE1BQU1ELGNBQWMsQ0FBQ1EsSUFBZixDQUFvQixJQUFwQixFQUEwQkosS0FBMUIsRUFBaUNDLEtBQWpDLENBQXpCO0FBQ0EsY0FBSSxDQUFDQyxhQUFMLEVBQW9CLE9BQU9MLFVBQVA7QUFFcEJBLFVBQUFBLFVBQVUsQ0FBQ1EsU0FBWCxDQUFzQkMsSUFBRCxJQUFVO0FBQzdCUixZQUFBQSxNQUFNLENBQUNTLE9BQVAsQ0FBZUwsYUFBZixFQUE4Qk0sT0FBOUIsQ0FBc0MsQ0FBQyxDQUFDQyxHQUFELEVBQU1DLEtBQU4sQ0FBRCxLQUFrQjtBQUN0RCxrQkFBSSxDQUFDWixNQUFNLENBQUNhLGNBQVAsQ0FBc0JQLElBQXRCLENBQTJCRSxJQUEzQixFQUFpQyxDQUFDRyxHQUFELENBQWpDLENBQUwsRUFBOEM7QUFDNUNILGdCQUFBQSxJQUFJLENBQUNHLEdBQUQsQ0FBSixHQUFZQyxLQUFaO0FBQ0Q7QUFDRixhQUpEO0FBS0EsbUJBQU9KLElBQVA7QUFDRCxXQVBEO0FBU0EsaUJBQU9ULFVBQVA7QUFDRDs7QUFsQmtCLE9BQXJCO0FBb0JEOztBQXZCUyxHQUZDO0FBMkJiZSxFQUFBQSxZQUFZLEVBQUUsRUEzQkQ7QUE0QmJDLEVBQUFBLEtBQUssRUFBRTtBQTVCTSxDIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQge1xuICByeGRiOiB0cnVlLFxuICBwcm90b3R5cGVzOiB7XG4gICAgUnhEYXRhYmFzZShwcm90bykge1xuICAgICAgY29uc3QgcHJldkNvbGxlY3Rpb24gPSBwcm90by5jb2xsZWN0aW9uO1xuICAgICAgT2JqZWN0LmFzc2lnbihwcm90bywge1xuICAgICAgICBhc3luYyBjb2xsZWN0aW9uKG1vZGVsLCAuLi5vdGhlcikge1xuICAgICAgICAgIGNvbnN0IGRlZmF1bHRWYWx1ZXMgPVxuICAgICAgICAgICAgbW9kZWwgJiYgbW9kZWwub3B0aW9ucyAmJiBtb2RlbC5vcHRpb25zLmRlZmF1bHRWYWx1ZXM7XG5cbiAgICAgICAgICBjb25zdCBjb2xsZWN0aW9uID0gYXdhaXQgcHJldkNvbGxlY3Rpb24uY2FsbCh0aGlzLCBtb2RlbCwgb3RoZXIpO1xuICAgICAgICAgIGlmICghZGVmYXVsdFZhbHVlcykgcmV0dXJuIGNvbGxlY3Rpb247XG5cbiAgICAgICAgICBjb2xsZWN0aW9uLnByZUluc2VydCgoZGF0YSkgPT4ge1xuICAgICAgICAgICAgT2JqZWN0LmVudHJpZXMoZGVmYXVsdFZhbHVlcykuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgICAgICAgICAgIGlmICghT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwoZGF0YSwgW2tleV0pKSB7XG4gICAgICAgICAgICAgICAgZGF0YVtrZXldID0gdmFsdWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICByZXR1cm4gY29sbGVjdGlvbjtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9LFxuICBvdmVyd3JpdGFibGU6IHt9LFxuICBob29rczoge31cbn07XG4iXX0=