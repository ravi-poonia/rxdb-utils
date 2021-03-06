"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createSubject;

var _rxjs = require("rxjs");

var _constants = require("./constants");

function createSubject(observable, opts = {}) {
  const options = {
    keepOpenCheck: () => false,
    onInit: () => {},
    onTeardown: () => {}
  };
  Object.assign(options, opts);
  let subject;
  let subscription;
  const lifecycle = {
    init() {
      subject = new _rxjs.ReplaySubject(1);
      subscription = observable.subscribe(subject);
      options.onInit();
    },

    teardown() {
      const subs = subscription;
      const subj = subject;
      options.onTeardown();
      subs.unsubscribe();
      subj.unsubscribe();
    },

    subscribe(obs) {
      return subject.subscribe(obs);
    },

    unsubscribe(subs) {
      subs.unsubscribe();
    }

  };
  let subscriptions = 0;
  let isAlive = false;
  let interval;
  return _rxjs.Observable.create(obs => {
    subscriptions++;
    clearInterval(interval);
    if (!isAlive) (isAlive = true) && lifecycle.init();
    const subs = lifecycle.subscribe(obs);
    return () => {
      subscriptions--;
      lifecycle.unsubscribe(subs);
      if (subscriptions) return;
      setTimeout(() => {
        if (subscriptions || !isAlive) return;

        const kill = () => {
          isAlive = false;
          lifecycle.teardown();
          clearInterval(interval);
        };

        if (!options.keepOpenCheck()) kill();else {
          clearInterval(interval);
          interval = setInterval(() => {
            if (subscriptions || !isAlive) return clearInterval(interval);
            if (!options.keepOpenCheck()) kill();
          }, _constants.CHECK_KEEP_OPEN_TIMEOUT);
        }
      }, _constants.CLOSE_SUBSCRIPTION_TIMEOUT);
    };
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy92aWV3cy9jcmVhdGUtc3ViamVjdC5qcyJdLCJuYW1lcyI6WyJjcmVhdGVTdWJqZWN0Iiwib2JzZXJ2YWJsZSIsIm9wdHMiLCJvcHRpb25zIiwia2VlcE9wZW5DaGVjayIsIm9uSW5pdCIsIm9uVGVhcmRvd24iLCJPYmplY3QiLCJhc3NpZ24iLCJzdWJqZWN0Iiwic3Vic2NyaXB0aW9uIiwibGlmZWN5Y2xlIiwiaW5pdCIsIlJlcGxheVN1YmplY3QiLCJzdWJzY3JpYmUiLCJ0ZWFyZG93biIsInN1YnMiLCJzdWJqIiwidW5zdWJzY3JpYmUiLCJvYnMiLCJzdWJzY3JpcHRpb25zIiwiaXNBbGl2ZSIsImludGVydmFsIiwiT2JzZXJ2YWJsZSIsImNyZWF0ZSIsImNsZWFySW50ZXJ2YWwiLCJzZXRUaW1lb3V0Iiwia2lsbCIsInNldEludGVydmFsIiwiQ0hFQ0tfS0VFUF9PUEVOX1RJTUVPVVQiLCJDTE9TRV9TVUJTQ1JJUFRJT05fVElNRU9VVCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUtlLFNBQVNBLGFBQVQsQ0FBdUJDLFVBQXZCLEVBQW1DQyxJQUFJLEdBQUcsRUFBMUMsRUFBOEM7QUFDM0QsUUFBTUMsT0FBTyxHQUFHO0FBQ2RDLElBQUFBLGFBQWEsRUFBRSxNQUFNLEtBRFA7QUFFZEMsSUFBQUEsTUFBTSxFQUFFLE1BQU0sQ0FBRSxDQUZGO0FBR2RDLElBQUFBLFVBQVUsRUFBRSxNQUFNLENBQUU7QUFITixHQUFoQjtBQUtBQyxFQUFBQSxNQUFNLENBQUNDLE1BQVAsQ0FBY0wsT0FBZCxFQUF1QkQsSUFBdkI7QUFFQSxNQUFJTyxPQUFKO0FBQ0EsTUFBSUMsWUFBSjtBQUNBLFFBQU1DLFNBQVMsR0FBRztBQUNoQkMsSUFBQUEsSUFBSSxHQUFHO0FBQ0xILE1BQUFBLE9BQU8sR0FBRyxJQUFJSSxtQkFBSixDQUFrQixDQUFsQixDQUFWO0FBQ0FILE1BQUFBLFlBQVksR0FBR1QsVUFBVSxDQUFDYSxTQUFYLENBQXFCTCxPQUFyQixDQUFmO0FBQ0FOLE1BQUFBLE9BQU8sQ0FBQ0UsTUFBUjtBQUNELEtBTGU7O0FBTWhCVSxJQUFBQSxRQUFRLEdBQUc7QUFDVCxZQUFNQyxJQUFJLEdBQUdOLFlBQWI7QUFDQSxZQUFNTyxJQUFJLEdBQUdSLE9BQWI7QUFDQU4sTUFBQUEsT0FBTyxDQUFDRyxVQUFSO0FBQ0FVLE1BQUFBLElBQUksQ0FBQ0UsV0FBTDtBQUNBRCxNQUFBQSxJQUFJLENBQUNDLFdBQUw7QUFDRCxLQVplOztBQWFoQkosSUFBQUEsU0FBUyxDQUFDSyxHQUFELEVBQU07QUFDYixhQUFPVixPQUFPLENBQUNLLFNBQVIsQ0FBa0JLLEdBQWxCLENBQVA7QUFDRCxLQWZlOztBQWdCaEJELElBQUFBLFdBQVcsQ0FBQ0YsSUFBRCxFQUFPO0FBQ2hCQSxNQUFBQSxJQUFJLENBQUNFLFdBQUw7QUFDRDs7QUFsQmUsR0FBbEI7QUFxQkEsTUFBSUUsYUFBYSxHQUFHLENBQXBCO0FBQ0EsTUFBSUMsT0FBTyxHQUFHLEtBQWQ7QUFDQSxNQUFJQyxRQUFKO0FBQ0EsU0FBT0MsaUJBQVdDLE1BQVgsQ0FBbUJMLEdBQUQsSUFBUztBQUNoQ0MsSUFBQUEsYUFBYTtBQUNiSyxJQUFBQSxhQUFhLENBQUNILFFBQUQsQ0FBYjtBQUNBLFFBQUksQ0FBQ0QsT0FBTCxFQUFjLENBQUNBLE9BQU8sR0FBRyxJQUFYLEtBQW9CVixTQUFTLENBQUNDLElBQVYsRUFBcEI7QUFFZCxVQUFNSSxJQUFJLEdBQUdMLFNBQVMsQ0FBQ0csU0FBVixDQUFvQkssR0FBcEIsQ0FBYjtBQUVBLFdBQU8sTUFBTTtBQUNYQyxNQUFBQSxhQUFhO0FBQ2JULE1BQUFBLFNBQVMsQ0FBQ08sV0FBVixDQUFzQkYsSUFBdEI7QUFFQSxVQUFJSSxhQUFKLEVBQW1CO0FBRW5CTSxNQUFBQSxVQUFVLENBQUMsTUFBTTtBQUNmLFlBQUlOLGFBQWEsSUFBSSxDQUFDQyxPQUF0QixFQUErQjs7QUFFL0IsY0FBTU0sSUFBSSxHQUFHLE1BQU07QUFDakJOLFVBQUFBLE9BQU8sR0FBRyxLQUFWO0FBQ0FWLFVBQUFBLFNBQVMsQ0FBQ0ksUUFBVjtBQUNBVSxVQUFBQSxhQUFhLENBQUNILFFBQUQsQ0FBYjtBQUNELFNBSkQ7O0FBTUEsWUFBSSxDQUFDbkIsT0FBTyxDQUFDQyxhQUFSLEVBQUwsRUFBOEJ1QixJQUFJLEdBQWxDLEtBQ0s7QUFDSEYsVUFBQUEsYUFBYSxDQUFDSCxRQUFELENBQWI7QUFDQUEsVUFBQUEsUUFBUSxHQUFHTSxXQUFXLENBQUMsTUFBTTtBQUMzQixnQkFBSVIsYUFBYSxJQUFJLENBQUNDLE9BQXRCLEVBQStCLE9BQU9JLGFBQWEsQ0FBQ0gsUUFBRCxDQUFwQjtBQUMvQixnQkFBSSxDQUFDbkIsT0FBTyxDQUFDQyxhQUFSLEVBQUwsRUFBOEJ1QixJQUFJO0FBQ25DLFdBSHFCLEVBR25CRSxrQ0FIbUIsQ0FBdEI7QUFJRDtBQUNGLE9BakJTLEVBaUJQQyxxQ0FqQk8sQ0FBVjtBQWtCRCxLQXhCRDtBQXlCRCxHQWhDTSxDQUFQO0FBaUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUmVwbGF5U3ViamVjdCwgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtcbiAgQ0xPU0VfU1VCU0NSSVBUSU9OX1RJTUVPVVQsXG4gIENIRUNLX0tFRVBfT1BFTl9USU1FT1VUXG59IGZyb20gJy4vY29uc3RhbnRzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlU3ViamVjdChvYnNlcnZhYmxlLCBvcHRzID0ge30pIHtcbiAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICBrZWVwT3BlbkNoZWNrOiAoKSA9PiBmYWxzZSxcbiAgICBvbkluaXQ6ICgpID0+IHt9LFxuICAgIG9uVGVhcmRvd246ICgpID0+IHt9XG4gIH07XG4gIE9iamVjdC5hc3NpZ24ob3B0aW9ucywgb3B0cyk7XG5cbiAgbGV0IHN1YmplY3Q7XG4gIGxldCBzdWJzY3JpcHRpb247XG4gIGNvbnN0IGxpZmVjeWNsZSA9IHtcbiAgICBpbml0KCkge1xuICAgICAgc3ViamVjdCA9IG5ldyBSZXBsYXlTdWJqZWN0KDEpO1xuICAgICAgc3Vic2NyaXB0aW9uID0gb2JzZXJ2YWJsZS5zdWJzY3JpYmUoc3ViamVjdCk7XG4gICAgICBvcHRpb25zLm9uSW5pdCgpO1xuICAgIH0sXG4gICAgdGVhcmRvd24oKSB7XG4gICAgICBjb25zdCBzdWJzID0gc3Vic2NyaXB0aW9uO1xuICAgICAgY29uc3Qgc3ViaiA9IHN1YmplY3Q7XG4gICAgICBvcHRpb25zLm9uVGVhcmRvd24oKTtcbiAgICAgIHN1YnMudW5zdWJzY3JpYmUoKTtcbiAgICAgIHN1YmoudW5zdWJzY3JpYmUoKTtcbiAgICB9LFxuICAgIHN1YnNjcmliZShvYnMpIHtcbiAgICAgIHJldHVybiBzdWJqZWN0LnN1YnNjcmliZShvYnMpO1xuICAgIH0sXG4gICAgdW5zdWJzY3JpYmUoc3Vicykge1xuICAgICAgc3Vicy51bnN1YnNjcmliZSgpO1xuICAgIH1cbiAgfTtcblxuICBsZXQgc3Vic2NyaXB0aW9ucyA9IDA7XG4gIGxldCBpc0FsaXZlID0gZmFsc2U7XG4gIGxldCBpbnRlcnZhbDtcbiAgcmV0dXJuIE9ic2VydmFibGUuY3JlYXRlKChvYnMpID0+IHtcbiAgICBzdWJzY3JpcHRpb25zKys7XG4gICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgaWYgKCFpc0FsaXZlKSAoaXNBbGl2ZSA9IHRydWUpICYmIGxpZmVjeWNsZS5pbml0KCk7XG5cbiAgICBjb25zdCBzdWJzID0gbGlmZWN5Y2xlLnN1YnNjcmliZShvYnMpO1xuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHN1YnNjcmlwdGlvbnMtLTtcbiAgICAgIGxpZmVjeWNsZS51bnN1YnNjcmliZShzdWJzKTtcblxuICAgICAgaWYgKHN1YnNjcmlwdGlvbnMpIHJldHVybjtcblxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGlmIChzdWJzY3JpcHRpb25zIHx8ICFpc0FsaXZlKSByZXR1cm47XG5cbiAgICAgICAgY29uc3Qga2lsbCA9ICgpID0+IHtcbiAgICAgICAgICBpc0FsaXZlID0gZmFsc2U7XG4gICAgICAgICAgbGlmZWN5Y2xlLnRlYXJkb3duKCk7XG4gICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKCFvcHRpb25zLmtlZXBPcGVuQ2hlY2soKSkga2lsbCgpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICAgICAgICBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIGlmIChzdWJzY3JpcHRpb25zIHx8ICFpc0FsaXZlKSByZXR1cm4gY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgICAgICAgICBpZiAoIW9wdGlvbnMua2VlcE9wZW5DaGVjaygpKSBraWxsKCk7XG4gICAgICAgICAgfSwgQ0hFQ0tfS0VFUF9PUEVOX1RJTUVPVVQpO1xuICAgICAgICB9XG4gICAgICB9LCBDTE9TRV9TVUJTQ1JJUFRJT05fVElNRU9VVCk7XG4gICAgfTtcbiAgfSk7XG59XG4iXX0=