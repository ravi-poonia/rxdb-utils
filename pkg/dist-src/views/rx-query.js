import { of, combineLatest } from 'rxjs';
import { switchMap, map, take } from 'rxjs/operators';
import flattenDeep from 'lodash.flattendeep';
import hash from 'object-hash';
import createSubject from "./create-subject.js";
import { ENSURE_CLEANUP_TIMEOUT, ENSURE_SYMBOL } from "./constants.js";
export default function RxQuery(proto) {
  Object.assign(proto, {
    ensure$() {
      for (var _len = arguments.length, properties = new Array(_len), _key = 0; _key < _len; _key++) {
        properties[_key] = arguments[_key];
      }

      if (!this.collection.options || !this.collection.options.views) {
        throw Error('RxQuery.ensure$() can only be used on collection with defined views');
      }

      properties = flattenDeep(properties);
      if (!properties.length) properties = this.collection._views;
      var ensureHash = hash(properties, {
        unorderedArrays: true
      });
      var ensures = this[ENSURE_SYMBOL];
      if (!ensures) ensures = this[ENSURE_SYMBOL] = {};
      var obs = ensures[ensureHash];
      if (!obs) obs = ensures[ensureHash] = createEnsure(this.$, properties);
      return obs;
    }

  });
}

function createEnsure(observable, properties) {
  var unensureFns = {};
  var lastDocs;
  var obs = observable.pipe(switchMap(ans => {
    if (!ans) return of(ans);
    var docs = Array.isArray(ans) ? ans : [ans];
    var rxArr = [];
    lastDocs = docs;
    docs.forEach(doc => {
      var primary = doc.primary;
      if (unensureFns[primary]) return;
      var unensure = doc[ENSURE_SYMBOL](properties);
      unensureFns[primary] = unensure;
      properties.forEach(property => {
        rxArr.push(doc[property].$);
      });
    });
    return rxArr.length ? combineLatest(...rxArr).pipe(take(1), map(() => ans)) : of(ans);
  }));
  var interval;
  var lastCleanupDocs;
  return createSubject(obs, {
    onInit() {
      // Periodic cleanup of ensured docs that are not part of the
      // query response anymore
      interval = setInterval(() => {
        if (!lastDocs || lastCleanupDocs === lastDocs) return;
        lastCleanupDocs = lastDocs;
        var primaries = lastCleanupDocs.reduce((acc, doc) => {
          acc[doc.primary] = true;
          return acc;
        }, {});
        Object.keys(unensureFns).forEach(key => {
          if (primaries[key]) return;
          unensureFns[key]();
          delete unensureFns[key];
        });
      }, ENSURE_CLEANUP_TIMEOUT);
    },

    onTeardown() {
      var fns = unensureFns;
      unensureFns = {};
      lastDocs = null;
      lastCleanupDocs = null;
      clearInterval(interval);
      Object.values(fns).forEach(fn => fn());
    }

  });
}