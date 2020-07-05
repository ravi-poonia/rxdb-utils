import models from "./models.js";
import collections from "./collections.js";
import defaultValues from "./default-values.js";
import timestamps from "./timestamps.js";
import views from "./views/index.js";
import select from "./select/index.js";
import observables from "./observables.js";
import hooks from "./hooks.js";
import replication from "./replication.js";
export default function register(addRxPlugin) {
  addRxPlugin(models);
  addRxPlugin(collections);
  addRxPlugin(defaultValues);
  addRxPlugin(timestamps);
  addRxPlugin(views);
  addRxPlugin(select);
  addRxPlugin(observables);
  addRxPlugin(hooks);
  addRxPlugin(replication);
}