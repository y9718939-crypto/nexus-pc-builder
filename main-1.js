/* ===========================================================
   MAIN.JS
   The entry point for builder.html. It finds the elements on the
   page, connects buttons to the right actions, and asks the UI to
   redraw whenever the selection changes.
   It loads last, after every module it depends on.
=========================================================== */
(function () {
  const listElement = document.getElementById('component-list');
  const summaryRefs = {
    count: document.getElementById('summary-count'),
    items: document.getElementById('summary-items'),
    total: document.getElementById('summary-total'),
    priceNote: document.getElementById('summary-price-note'),
    missing: document.getElementById('summary-missing'),
    compatOverall: document.getElementById('compat-overall'),
    compatList: document.getElementById('compat-list'),
    compatWaiting: document.getElementById('compat-waiting'),
    compatPower: document.getElementById('compat-power'),
    saveButton: document.getElementById('save-btn'),
    copyButton: document.getElementById('copy-btn'),
    mobileCount: document.getElementById('mobile-count'),
    mobileTotal: document.getElementById('mobile-total')
  };
  const loadButton = document.getElementById('load-btn');
  const statusElement = document.getElementById('build-status');
  const resetButtons = document.querySelectorAll('[data-action="reset"]');

  // If the page markup is broken, say so clearly instead of failing silently.
  const missingElement = !listElement || !loadButton || !statusElement ||
    Object.values(summaryRefs).some(function (ref) { return !ref; });
  if (missingElement) {
    console.error('[Nexus] builder.html is missing an element main.js needs.');
    return;
  }

  // Redraw everything from the current state.
  function renderAll() {
    const report = Nexus.compat.evaluate(Nexus.state.getSelectedMap());
    Nexus.ui.renderComponentList(listElement, Nexus.compat.getIssuesByCategory(report));
    Nexus.ui.renderSummary(summaryRefs, report);
  }

  // Run renderAll() after every change to the selection, then once now.
  Nexus.state.subscribe(renderAll);
  renderAll();

  /* ----- Status line under the buttons (read aloud by screen readers) ----- */

  let statusTimer = null;

  function showStatus(message) {
    statusElement.textContent = message;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(function () { statusElement.textContent = ''; }, 5000);
  }

  /* ----- Clicks on the component rows (Select / Change / Remove) ----- */

  // The category whose window was opened last, so we can return focus there.
  let lastCategoryId = null;

  listElement.addEventListener('click', function (event) {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const categoryId = button.dataset.category;

    if (button.dataset.action === 'open') {
      lastCategoryId = categoryId;
      Nexus.modal.open(categoryId);
    } else if (button.dataset.action === 'remove') {
      Nexus.state.remove(categoryId);
      focusRowButton(categoryId); // the row was redrawn, so put focus back on it
    }
  });

  // Move keyboard focus to a row's main button after the page redraws.
  function focusRowButton(categoryId) {
    const button = listElement.querySelector('button[data-action="open"][data-category="' + categoryId + '"]');
    if (button) button.focus();
  }

  // When the window closes, return focus to the row it was opened from.
  Nexus.modal.element.addEventListener('close', function () {
    if (lastCategoryId) focusRowButton(lastCategoryId);
  });

  /* ----- Reset buttons ----- */

  resetButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      Nexus.state.reset();
      showStatus('Build cleared.');
    });
  });

  /* ----- Save / Load (stored on this device only) ----- */

  // "Load Saved" is only useful when something has been saved.
  function refreshLoadButton() {
    loadButton.disabled = !Nexus.storage.hasSavedBuild();
  }
  refreshLoadButton();

  summaryRefs.saveButton.addEventListener('click', function () {
    const result = Nexus.storage.save(Nexus.state.getSelectionIds());
    if (result.ok) {
      showStatus('Build saved on this device.');
    } else if (result.reason === 'empty') {
      showStatus('Choose at least one component before saving.');
    } else {
      showStatus("Couldn't save: your browser is blocking local storage (private mode, or storage is full).");
    }
    refreshLoadButton();
  });

  loadButton.addEventListener('click', function () {
    const result = Nexus.storage.load();
    if (!result.ok) {
      const messages = {
        none: 'There is no saved build yet.',
        corrupt: "The saved build couldn't be read, so it was ignored.",
        unavailable: "Couldn't load: your browser is blocking local storage."
      };
      showStatus(messages[result.reason] || "Couldn't load the saved build.");
      refreshLoadButton();
      return;
    }

    const applied = Nexus.state.replaceAll(result.selection);
    if (applied.applied === 0) {
      showStatus('The saved build no longer matches any products, so your current build was kept.');
    } else if (applied.skipped > 0) {
      showStatus('Loaded your saved build. ' + applied.skipped + ' item(s) are no longer in the catalog and were left out.');
    } else {
      showStatus('Loaded your saved build.');
    }
  });

  /* ----- Prebuilt builds: builder.html?build=budget-gaming ----- */

  function loadPrebuiltFromUrl() {
    let buildId = null;
    try {
      buildId = new URLSearchParams(window.location.search).get('build');
    } catch (error) {
      return;
    }
    if (!buildId) return;

    // Only an ID that exists in our own list is ever used.
    const builds = typeof PREBUILT_BUILDS !== 'undefined' ? PREBUILT_BUILDS : [];
    const build = builds.find(function (item) { return item.id === buildId; });

    if (!build) {
      showStatus("That prebuilt build wasn't found.");
    } else {
      const applied = Nexus.state.replaceAll(build.parts);
      showStatus(applied.applied > 0 ? 'Loaded "' + build.name + '". Prices are demo prices.' : "That prebuilt build couldn't be loaded.");
    }

    // Drop ?build=... from the address so a refresh doesn't undo later changes.
    try {
      window.history.replaceState(null, '', window.location.pathname);
    } catch (error) {
      // Some browsers block this for local files. Harmless.
    }
  }
  loadPrebuiltFromUrl();

  /* ----- Copy Summary ----- */

  // Try the modern clipboard API first; fall back to an older method.
  function copyText(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }

  function legacyCopy(text) {
    const helper = document.createElement('textarea');
    helper.value = text;
    helper.setAttribute('readonly', '');
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.appendChild(helper);
    helper.select();
    let succeeded = false;
    try {
      succeeded = document.execCommand('copy');
    } catch (error) {
      succeeded = false;
    }
    document.body.removeChild(helper);
    return succeeded;
  }

  summaryRefs.copyButton.addEventListener('click', function () {
    const report = Nexus.compat.evaluate(Nexus.state.getSelectedMap());
    copyText(Nexus.ui.buildSummaryText(report)).then(function (copied) {
      showStatus(copied ? 'Build summary copied.' : "Couldn't copy automatically. Your browser blocked clipboard access.");
    });
  });
})();
