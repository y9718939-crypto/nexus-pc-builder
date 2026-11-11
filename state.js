/* ===========================================================
   STATE.JS
   The "brain's memory": which product is selected in each
   category. Nothing else in the app stores this information.

   How updates flow:
     1. Something calls select(), remove() or reset()
     2. The selection changes
     3. Every function registered with subscribe() runs
        (the page re-draws itself from the new selection)
   So the page never has to guess what changed.
=========================================================== */
(function () {
  window.Nexus = window.Nexus || {};

  // Example: { cpu: 'cpu-3', gpu: 'gpu-1' }  (category id -> product id)
  const selection = {};
  const listeners = [];

  function notify() {
    listeners.forEach(function (listener) {
      // try/catch so one broken listener can't stop the others
      try {
        listener();
      } catch (error) {
        console.error('[Nexus] A state listener failed:', error);
      }
    });
  }

  // Register a function to run after every change.
  function subscribe(listener) {
    if (typeof listener === 'function') listeners.push(listener);
  }

  // Select a product. Returns false (and changes nothing) if the
  // category or product doesn't exist, so bad input can't get in.
  function select(categoryId, productId) {
    if (!Nexus.catalog.getProduct(categoryId, productId)) return false;
    selection[categoryId] = productId;
    notify();
    return true;
  }

  function remove(categoryId) {
    if (!(categoryId in selection)) return false;
    delete selection[categoryId];
    notify();
    return true;
  }

  function reset() {
    Object.keys(selection).forEach(function (categoryId) {
      delete selection[categoryId];
    });
    notify();
  }

  // The selected product for one category, or null.
  function getSelectedProduct(categoryId) {
    if (!(categoryId in selection)) return null;
    return Nexus.catalog.getProduct(categoryId, selection[categoryId]);
  }

  // Every selected product, in the same order as the categories:
  // [{ category, product }, ...]
  function getSelectedItems() {
    const items = [];
    Nexus.catalog.categories.forEach(function (category) {
      const product = getSelectedProduct(category.id);
      if (product) items.push({ category: category, product: product });
    });
    return items;
  }

  // The chosen products keyed by category: { cpu: product, gpu: product, ... }
  // (this is the shape the compatibility engine expects).
  function getSelectedMap() {
    const map = {};
    getSelectedItems().forEach(function (item) {
      map[item.category.id] = item.product;
    });
    return map;
  }

  // A plain copy of the selection ({ cpu: 'cpu-1', ... }) for saving to storage.
  function getSelectionIds() {
    return Object.assign({}, selection);
  }

  // Replace the whole build in one step (used by "Load saved" and prebuilt
  // builds). Entries that don't match a real product are skipped and counted,
  // so a damaged save can never put bad data into the page. If NOTHING valid
  // is left, the current build is kept untouched.
  // The page redraws once at the end, not once per part.
  function replaceAll(ids) {
    const source = ids && typeof ids === 'object' ? ids : {};
    const valid = {};
    let skipped = 0;

    Object.keys(source).forEach(function (categoryId) {
      if (Nexus.catalog.getProduct(categoryId, source[categoryId])) {
        valid[categoryId] = source[categoryId];
      } else {
        skipped += 1;
      }
    });

    const applied = Object.keys(valid).length;
    if (applied === 0) return { applied: 0, skipped: skipped };

    Object.keys(selection).forEach(function (categoryId) {
      delete selection[categoryId];
    });
    Object.assign(selection, valid);
    notify();
    return { applied: applied, skipped: skipped };
  }

  Nexus.state = {
    subscribe: subscribe,
    select: select,
    remove: remove,
    reset: reset,
    getSelectedProduct: getSelectedProduct,
    getSelectedItems: getSelectedItems,
    getSelectedMap: getSelectedMap,
    getSelectionIds: getSelectionIds,
    replaceAll: replaceAll
  };
})();
