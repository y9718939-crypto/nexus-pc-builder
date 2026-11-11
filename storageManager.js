/* ===========================================================
   STORAGEMANAGER.JS
   Saves and loads one build in the browser's localStorage, a small
   key-value store that stays on this device (nothing is uploaded).

   Everything read back is treated as untrusted: localStorage can be
   blocked (private mode), full, or edited by hand, so every call is
   wrapped in try/catch and the saved data is checked before use.
   What we save is only product IDs, e.g. { cpu: 'cpu-3', gpu: 'gpu-1' },
   never prices: prices are always looked up fresh from the catalog.
=========================================================== */
(function () {
  window.Nexus = window.Nexus || {};

  const STORAGE_KEY = 'nexus.savedBuild.v1';
  const FORMAT_VERSION = 1;

  // Returns localStorage, or null if the browser won't let us use it.
  function getStore() {
    try {
      return window.localStorage || null;
    } catch (error) {
      return null; // some browsers throw just for touching localStorage
    }
  }

  // Result: { ok: true } or { ok: false, reason: 'empty' | 'unavailable' | 'failed' }
  function save(selectionIds) {
    if (!selectionIds || typeof selectionIds !== 'object' || Object.keys(selectionIds).length === 0) {
      return { ok: false, reason: 'empty' };
    }
    const store = getStore();
    if (!store) return { ok: false, reason: 'unavailable' };

    try {
      store.setItem(STORAGE_KEY, JSON.stringify({
        version: FORMAT_VERSION,
        savedAt: new Date().toISOString(),
        selection: selectionIds
      }));
      return { ok: true };
    } catch (error) {
      return { ok: false, reason: 'failed' }; // storage full or blocked
    }
  }

  // Result: { ok: true, selection, savedAt }
  //      or { ok: false, reason: 'unavailable' | 'none' | 'corrupt' }
  function load() {
    const store = getStore();
    if (!store) return { ok: false, reason: 'unavailable' };

    let raw;
    try {
      raw = store.getItem(STORAGE_KEY);
    } catch (error) {
      return { ok: false, reason: 'unavailable' };
    }
    if (raw === null) return { ok: false, reason: 'none' };

    let data;
    try {
      data = JSON.parse(raw);
    } catch (error) {
      return { ok: false, reason: 'corrupt' };
    }

    const looksRight = data && typeof data === 'object' &&
      data.version === FORMAT_VERSION &&
      data.selection && typeof data.selection === 'object' && !Array.isArray(data.selection);
    if (!looksRight) return { ok: false, reason: 'corrupt' };

    // Keep only entries shaped like { knownCategory: 'text id' }.
    // Whether the product itself still exists is checked later by state.replaceAll.
    const selection = {};
    Nexus.catalog.categories.forEach(function (category) {
      const productId = data.selection[category.id];
      if (typeof productId === 'string') selection[category.id] = productId;
    });

    return {
      ok: true,
      selection: selection,
      savedAt: typeof data.savedAt === 'string' ? data.savedAt : null
    };
  }

  function hasSavedBuild() {
    const result = load();
    return result.ok && Object.keys(result.selection).length > 0;
  }

  Nexus.storage = {
    save: save,
    load: load,
    hasSavedBuild: hasSavedBuild
  };
})();
