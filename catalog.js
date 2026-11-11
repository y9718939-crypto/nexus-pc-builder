/* ===========================================================
   CATALOG.JS
   Turns the raw product lists in js/data/ into one clean,
   checked catalog the rest of the app can trust.

   - Lists the 8 component categories (in the order they show up)
   - Cleans each product: missing manufacturer / specs / price
     get safe fallbacks instead of crashing the page
   - Skips broken or duplicate products and tells you in the
     browser console (press F12 to see it)
=========================================================== */
(function () {
  // One shared object for the whole app, so files can talk to each other
  // without needing a build tool. Every module adds itself to it.
  window.Nexus = window.Nexus || {};

  // `typeof X !== 'undefined'` protects us if a data file ever fails to
  // load: that category just shows no products instead of breaking the page.
  const CATEGORY_DEFINITIONS = [
    { id: 'cpu',         label: 'Processor',     short: 'CPU',  rawProducts: typeof CPU_PRODUCTS !== 'undefined' ? CPU_PRODUCTS : [] },
    { id: 'gpu',         label: 'Graphics Card', short: 'GPU',  rawProducts: typeof GPU_PRODUCTS !== 'undefined' ? GPU_PRODUCTS : [] },
    { id: 'motherboard', label: 'Motherboard',   short: 'MB',   rawProducts: typeof MOTHERBOARD_PRODUCTS !== 'undefined' ? MOTHERBOARD_PRODUCTS : [] },
    { id: 'ram',         label: 'Memory',        short: 'RAM',  rawProducts: typeof RAM_PRODUCTS !== 'undefined' ? RAM_PRODUCTS : [] },
    { id: 'storage',     label: 'Storage',       short: 'SSD',  rawProducts: typeof STORAGE_PRODUCTS !== 'undefined' ? STORAGE_PRODUCTS : [] },
    { id: 'psu',         label: 'Power Supply',  short: 'PSU',  rawProducts: typeof PSU_PRODUCTS !== 'undefined' ? PSU_PRODUCTS : [] },
    { id: 'case',        label: 'PC Case',       short: 'CASE', rawProducts: typeof CASE_PRODUCTS !== 'undefined' ? CASE_PRODUCTS : [] },
    { id: 'cooler',      label: 'CPU Cooler',    short: 'FAN',  rawProducts: typeof COOLER_PRODUCTS !== 'undefined' ? COOLER_PRODUCTS : [] }
  ];

  // Returns a trimmed string, or '' if the value isn't usable text.
  function cleanText(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  // Copies a product's `tech` facts, keeping only simple values (text, numbers,
  // true/false, or lists of those). Anything else is dropped, so the
  // compatibility engine can trust what it reads.
  function cleanTech(raw) {
    const tech = {};
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return Object.freeze(tech);

    Object.keys(raw).forEach(function (key) {
      const value = raw[key];
      const isSimple = function (item) {
        return typeof item === 'string' || typeof item === 'boolean' || (typeof item === 'number' && Number.isFinite(item));
      };
      if (isSimple(value)) {
        tech[key] = value;
      } else if (Array.isArray(value) && value.every(isSimple)) {
        tech[key] = Object.freeze(value.slice());
      }
    });
    return Object.freeze(tech);
  }

  // Checks one raw product and returns a clean copy, or null if it
  // can't be used (no id or no name).
  function normalizeProduct(raw, categoryId) {
    if (!raw || typeof raw !== 'object') return null;

    const id = cleanText(raw.id);
    const name = cleanText(raw.name);
    if (!id || !name) return null;

    // A price is only valid if it's a real, non-negative number.
    // Otherwise we store null, and the interface shows "Price unavailable".
    const hasValidPrice =
      typeof raw.price === 'number' && Number.isFinite(raw.price) && raw.price >= 0;

    return Object.freeze({
      id: id,
      name: name,
      categoryId: categoryId,
      manufacturer: cleanText(raw.manufacturer) || 'Unknown manufacturer',
      price: hasValidPrice ? raw.price : null,
      specs: cleanText(raw.specs),
      tech: cleanTech(raw.tech)
    });
  }

  // Cleans every category in a list of definitions. Used once for the real
  // catalog below, and by the test page with deliberately broken data.
  function buildCategories(definitions) {
    return definitions.map(function (definition) {
      const products = [];
      const seenIds = new Set();

      definition.rawProducts.forEach(function (raw, index) {
        const product = normalizeProduct(raw, definition.id);

        if (!product) {
          console.warn('[Nexus] Skipped an invalid ' + definition.id + ' product at position ' + index + ' (needs an id and a name).');
          return;
        }
        if (seenIds.has(product.id)) {
          console.warn('[Nexus] Skipped duplicate product id "' + product.id + '" in ' + definition.id + '.');
          return;
        }

        seenIds.add(product.id);
        products.push(product);
      });

      return Object.freeze({
        id: definition.id,
        label: definition.label,
        short: definition.short,
        products: Object.freeze(products)
      });
    });
  }

  // Build the real catalog once, when the page loads.
  const categories = buildCategories(CATEGORY_DEFINITIONS);

  function getCategory(categoryId) {
    return categories.find(function (category) { return category.id === categoryId; }) || null;
  }

  function getProduct(categoryId, productId) {
    const category = getCategory(categoryId);
    if (!category) return null;
    return category.products.find(function (product) { return product.id === productId; }) || null;
  }

  Nexus.catalog = {
    buildCategories: buildCategories,
    categories: categories,
    getCategory: getCategory,
    getProduct: getProduct
  };
})();
