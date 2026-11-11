/* ===========================================================
   PRICECALCULATOR.JS
   Adds up prices and formats them as Algerian Dinar (DZD).
   These are "pure" functions: give them the same input and they
   always return the same output, and they never touch the page.
   That makes them easy to test.
=========================================================== */
(function () {
  window.Nexus = window.Nexus || {};

  // A price only counts if it's a finite number that isn't negative.
  function isValidPrice(value) {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0;
  }

  // 52900 -> "52,900 DZD". Anything unusable -> "Price unavailable".
  function formatDZD(amount) {
    if (!isValidPrice(amount)) return 'Price unavailable';
    return Math.round(amount).toLocaleString('en-US') + ' DZD';
  }

  // Takes a list of products and returns:
  //   total          - the sum of all valid prices
  //   pricedCount    - how many products had a valid price
  //   unpricedCount  - how many were left out of the total
  // Products with a missing price are never silently counted as 0;
  // the caller is told so the page can warn the user.
  function calculateTotal(products) {
    const list = Array.isArray(products) ? products : [];
    let total = 0;
    let pricedCount = 0;
    let unpricedCount = 0;

    list.forEach(function (product) {
      if (product && isValidPrice(product.price)) {
        total += product.price;
        pricedCount += 1;
      } else {
        unpricedCount += 1;
      }
    });

    return { total: total, pricedCount: pricedCount, unpricedCount: unpricedCount };
  }

  Nexus.price = {
    isValidPrice: isValidPrice,
    formatDZD: formatDZD,
    calculateTotal: calculateTotal
  };
})();
