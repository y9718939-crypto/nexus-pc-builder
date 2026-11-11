/* ===========================================================
   MODAL.JS
   The "Select a component" window. It uses the browser's built-in
   <dialog> element, which gives us for free:
     - the dark backdrop behind the window
     - the Esc key to close it
     - keyboard focus kept inside the window while it's open
   Our job is to fill it with products and react to clicks.
=========================================================== */
(function () {
  window.Nexus = window.Nexus || {};

  const dialog = document.getElementById('selection-modal');
  if (!dialog) {
    console.error('[Nexus] #selection-modal not found in the page.');
    return;
  }

  const el = Nexus.ui.el;
  const refs = {
    title: document.getElementById('modal-title'),
    search: document.getElementById('modal-search'),
    manufacturer: document.getElementById('modal-manufacturer'),
    sort: document.getElementById('modal-sort'),
    count: document.getElementById('modal-count'),
    grid: document.getElementById('modal-products'),
    empty: document.getElementById('modal-empty'),
    clearButton: document.getElementById('modal-clear'),
    closeButton: document.getElementById('modal-close')
  };

  // Which category the window is currently showing (e.g. the CPU category)
  let currentCategory = null;

  // Fill the manufacturer dropdown with the names found in this category.
  function fillManufacturerOptions(category) {
    refs.manufacturer.replaceChildren();

    const allOption = el('option', '', 'All manufacturers');
    allOption.value = 'all';
    refs.manufacturer.appendChild(allOption);

    Nexus.search.getManufacturers(category.products).forEach(function (name) {
      const option = el('option', '', name);
      option.value = name;
      refs.manufacturer.appendChild(option);
    });
  }

  // Build one product card.
  function buildProductCard(product, isSelected) {
    const item = el('li', 'product-card' + (isSelected ? ' product-card--selected' : ''));

    const image = el('div', 'product-card__image', currentCategory.short);
    image.setAttribute('aria-hidden', 'true');
    item.appendChild(image);

    item.appendChild(el('h3', 'product-card__name', product.name));
    item.appendChild(el('p', 'product-card__maker', product.manufacturer));
    item.appendChild(el('p', 'product-card__specs', product.specs || 'Specifications not available'));
    item.appendChild(el('p', 'product-card__price', Nexus.price.formatDZD(product.price)));

    const button = el('button', 'btn btn-sm ' + (isSelected ? 'btn-outline' : 'btn-primary'), isSelected ? 'Selected' : 'Select');
    button.type = 'button';
    button.dataset.productId = product.id;
    button.disabled = isSelected;
    button.setAttribute('aria-label', (isSelected ? 'Selected: ' : 'Select ') + product.name);
    item.appendChild(button);

    return item;
  }

  // Re-draw the product grid using the current search / filter / sort values.
  function render() {
    if (!currentCategory) return;

    const visibleProducts = Nexus.search.filterAndSort(currentCategory.products, {
      query: refs.search.value,
      manufacturer: refs.manufacturer.value,
      sort: refs.sort.value
    });
    const selectedProduct = Nexus.state.getSelectedProduct(currentCategory.id);

    refs.grid.replaceChildren();
    visibleProducts.forEach(function (product) {
      refs.grid.appendChild(buildProductCard(product, selectedProduct !== null && selectedProduct.id === product.id));
    });

    const total = currentCategory.products.length;
    refs.count.textContent = 'Showing ' + visibleProducts.length + ' of ' + total + ' products';
    refs.empty.hidden = visibleProducts.length !== 0;
    refs.grid.hidden = visibleProducts.length === 0;
  }

  function clearFilters() {
    refs.search.value = '';
    refs.manufacturer.value = 'all';
    refs.sort.value = 'default';
    render();
  }

  // Open the window for one category. Returns false if the id is unknown.
  function open(categoryId) {
    const category = Nexus.catalog.getCategory(categoryId);
    if (!category) return false;

    currentCategory = category;
    refs.title.textContent = 'Select ' + category.label;
    fillManufacturerOptions(category);
    clearFilters();

    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute('open', ''); // very old browsers: shows without the dark backdrop
    }
    return true;
  }

  function close() {
    if (typeof dialog.close === 'function') {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
    }
  }

  /* ----- Events ----- */

  refs.search.addEventListener('input', render);
  refs.manufacturer.addEventListener('change', render);
  refs.sort.addEventListener('change', render);
  refs.clearButton.addEventListener('click', clearFilters);
  refs.closeButton.addEventListener('click', close);

  // One listener on the whole grid (instead of one per card).
  refs.grid.addEventListener('click', function (event) {
    const button = event.target.closest('button[data-product-id]');
    if (!button || button.disabled || !currentCategory) return;

    if (Nexus.state.select(currentCategory.id, button.dataset.productId)) {
      close();
    }
  });

  // Clicking the dark area outside the window closes it. Clicks inside the
  // window land on its inner elements; only the backdrop targets the dialog itself.
  dialog.addEventListener('click', function (event) {
    if (event.target === dialog) close();
  });

  Nexus.modal = { open: open, close: close, element: dialog };
})();
