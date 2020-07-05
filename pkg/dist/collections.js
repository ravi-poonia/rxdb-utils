"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _default = {
  rxdb: true,
  prototypes: {},
  overwritable: {},
  hooks: {
    preCreateRxCollection(model) {
      if (!model.statics) model.statics = {};
      if (!model.methods) model.methods = {};

      model.statics.collections = function collections() {
        return this.database.collections;
      };

      model.methods.collections = function collections() {
        return this.collection.collections();
      };

      return model;
    }

  }
};
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb2xsZWN0aW9ucy5qcyJdLCJuYW1lcyI6WyJyeGRiIiwicHJvdG90eXBlcyIsIm92ZXJ3cml0YWJsZSIsImhvb2tzIiwicHJlQ3JlYXRlUnhDb2xsZWN0aW9uIiwibW9kZWwiLCJzdGF0aWNzIiwibWV0aG9kcyIsImNvbGxlY3Rpb25zIiwiZGF0YWJhc2UiLCJjb2xsZWN0aW9uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7ZUFBZTtBQUNiQSxFQUFBQSxJQUFJLEVBQUUsSUFETztBQUViQyxFQUFBQSxVQUFVLEVBQUUsRUFGQztBQUdiQyxFQUFBQSxZQUFZLEVBQUUsRUFIRDtBQUliQyxFQUFBQSxLQUFLLEVBQUU7QUFDTEMsSUFBQUEscUJBQXFCLENBQUNDLEtBQUQsRUFBUTtBQUMzQixVQUFJLENBQUNBLEtBQUssQ0FBQ0MsT0FBWCxFQUFvQkQsS0FBSyxDQUFDQyxPQUFOLEdBQWdCLEVBQWhCO0FBQ3BCLFVBQUksQ0FBQ0QsS0FBSyxDQUFDRSxPQUFYLEVBQW9CRixLQUFLLENBQUNFLE9BQU4sR0FBZ0IsRUFBaEI7O0FBRXBCRixNQUFBQSxLQUFLLENBQUNDLE9BQU4sQ0FBY0UsV0FBZCxHQUE0QixTQUFTQSxXQUFULEdBQXVCO0FBQ2pELGVBQU8sS0FBS0MsUUFBTCxDQUFjRCxXQUFyQjtBQUNELE9BRkQ7O0FBSUFILE1BQUFBLEtBQUssQ0FBQ0UsT0FBTixDQUFjQyxXQUFkLEdBQTRCLFNBQVNBLFdBQVQsR0FBdUI7QUFDakQsZUFBTyxLQUFLRSxVQUFMLENBQWdCRixXQUFoQixFQUFQO0FBQ0QsT0FGRDs7QUFJQSxhQUFPSCxLQUFQO0FBQ0Q7O0FBZEk7QUFKTSxDIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQge1xuICByeGRiOiB0cnVlLFxuICBwcm90b3R5cGVzOiB7fSxcbiAgb3ZlcndyaXRhYmxlOiB7fSxcbiAgaG9va3M6IHtcbiAgICBwcmVDcmVhdGVSeENvbGxlY3Rpb24obW9kZWwpIHtcbiAgICAgIGlmICghbW9kZWwuc3RhdGljcykgbW9kZWwuc3RhdGljcyA9IHt9O1xuICAgICAgaWYgKCFtb2RlbC5tZXRob2RzKSBtb2RlbC5tZXRob2RzID0ge307XG5cbiAgICAgIG1vZGVsLnN0YXRpY3MuY29sbGVjdGlvbnMgPSBmdW5jdGlvbiBjb2xsZWN0aW9ucygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YWJhc2UuY29sbGVjdGlvbnM7XG4gICAgICB9O1xuXG4gICAgICBtb2RlbC5tZXRob2RzLmNvbGxlY3Rpb25zID0gZnVuY3Rpb24gY29sbGVjdGlvbnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb24uY29sbGVjdGlvbnMoKTtcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiBtb2RlbDtcbiAgICB9XG4gIH1cbn07XG4iXX0=