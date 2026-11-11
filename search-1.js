/* ===========================================================
   SEARCH.JS
   Search, manufacturer filter, and price sort for the product
   list in the selection window. Pure functions: they receive a
   list and return a new list, and never change the original.
=========================================================== */
(function () {
  window.Nexus = window.Nexus || {};

  // Stops someone pasting a huge block of text into the search box.
  const MAX_QUERY_LENGTH = 60;

  // " Ryzen  7 " -> ["ryzen", "7"]
  function toSearchTerms(query) {
    const text = typeof query === 'string' ? query : '';
    return text
      .trim()
      .slice(0, MAX_QUERY_LENGTH)
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
  }

  // Sorted, duplicate-free list of manufacturers for the dropdown.
  function getManufacturers(products) {
    const names = new Set(products.map(function (product) { return product.manufacturer; }));
    return Array.from(names).sort(function (a, b) { return a.localeCompare(b); });
  }

  // options.query         text typed in the search box
  // options.manufacturer  a manufacturer name, or 'all'
  // options.sort          'default' | 'price-asc' | 'price-desc'
  function filterAndSort(products, options) {
    const settings = options || {};
    const terms = toSearchTerms(settings.query);
    const manufacturer = settings.manufacturer || 'all';

    // Every typed word must appear somewhere in the name, manufacturer or specs.
    const result = products.filter(function (product) {
      if (manufacturer !== 'all' && product.manufacturer !== manufacturer) return false;
      const searchableText = (product.name + ' ' + product.manufacturer + ' ' + product.specs).toLowerCase();
      return terms.every(function (term) { return searchableText.includes(term); });
    });

    if (settings.sort === 'price-asc' || settings.sort === 'price-desc') {
      const direction = settings.sort === 'price-asc' ? 1 : -1;
      result.sort(function (a, b) {
        // Products with no price always go to the end.
        if (a.price === null || b.price === null) {
          if (a.price === b.price) return 0;
          return a.price === null ? 1 : -1;
        }
        return (a.price - b.price) * direction;
      });
    }

    return result;
  }

  Nexus.search = {
    getManufacturers: getManufacturers,
    filterAndSort: filterAndSort
  };
})();
