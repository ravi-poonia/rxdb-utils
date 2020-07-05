import RxQuery from "./rx-query.js";
import RxDocument from "./rx-document.js";
import { OBSERVABLES_SYMBOL } from "./constants.js";
export default {
  rxdb: true,
  prototypes: {
    RxQuery
  },
  overwritable: {},
  hooks: {
    createRxCollection(collection) {
      var {
        options
      } = collection;
      if (!options || !options.views) return;
      var desc = Object.getOwnPropertyDescriptors(options.views);
      var views = Object.entries(desc).filter((_ref) => {
        var [_, {
          get
        }] = _ref;
        return get;
      }); // Views keys live on collection._views

      collection._views = views.map((_ref2) => {
        var [key] = _ref2;
        return key;
      });
      var proto = collection.getDocumentPrototype();
      RxDocument(proto, views);
    },

    postCreateRxDocument(doc) {
      doc[OBSERVABLES_SYMBOL] = {};
    }

  }
};