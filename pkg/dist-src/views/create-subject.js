import { ReplaySubject, Observable } from 'rxjs';
import { CLOSE_SUBSCRIPTION_TIMEOUT, CHECK_KEEP_OPEN_TIMEOUT } from "./constants.js";
export default function createSubject(observable) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var options = {
    keepOpenCheck: () => false,
    onInit: () => {},
    onTeardown: () => {}
  };
  Object.assign(options, opts);
  var subject;
  var subscription;
  var lifecycle = {
    init() {
      subject = new ReplaySubject(1);
      subscription = observable.subscribe(subject);
      options.onInit();
    },

    teardown() {
      var subs = subscription;
      var subj = subject;
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
  var subscriptions = 0;
  var isAlive = false;
  var interval;
  return Observable.create(obs => {
    subscriptions++;
    clearInterval(interval);
    if (!isAlive) (isAlive = true) && lifecycle.init();
    var subs = lifecycle.subscribe(obs);
    return () => {
      subscriptions--;
      lifecycle.unsubscribe(subs);
      if (subscriptions) return;
      setTimeout(() => {
        if (subscriptions || !isAlive) return;

        var kill = () => {
          isAlive = false;
          lifecycle.teardown();
          clearInterval(interval);
        };

        if (!options.keepOpenCheck()) kill();else {
          clearInterval(interval);
          interval = setInterval(() => {
            if (subscriptions || !isAlive) return clearInterval(interval);
            if (!options.keepOpenCheck()) kill();
          }, CHECK_KEEP_OPEN_TIMEOUT);
        }
      }, CLOSE_SUBSCRIPTION_TIMEOUT);
    };
  });
}