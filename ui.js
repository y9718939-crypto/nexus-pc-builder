/* ===========================================================
   UI.JS
   Draws the component rows and the build summary from the
   current state. It only READS state; it never changes it.

   SAFETY: text is always put on the page with `textContent`,
   never `innerHTML`. textContent treats everything as plain
   text, so a product name like "<script>..." can't run code.
=========================================================== */
(function () {
  window.Nexus = window.Nexus || {};

  // Small helper: create an element, give it a class and some text.
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // Helper for the Select / Change / Remove buttons in each row.
  // data-action and data-category tell main.js what was clicked.
  function actionButton(text, className, action, category) {
    const button = el('button', className, text);
    button.type = 'button';
    button.dataset.action = action;
    button.dataset.category = category.id;
    // Screen readers hear "Change Processor", not just "Change"
    button.setAttribute('aria-label', text + ' ' + category.label);
    return button;
  }

  // "1 item" / "2 items"
  function plural(count, singular) {
    return count + ' ' + singular + (count === 1 ? '' : 's');
  }

  // Which badge colour goes with each compatibility status.
  const BADGE_CLASS = {
    compatible: 'badge-success',
    warning: 'badge-warning',
    incompatible: 'badge-danger',
    unknown: 'badge-neutral'
  };

  // A small coloured badge. The words carry the meaning; colour only backs them up.
  function statusBadge(status, label) {
    return el('span', 'badge ' + (BADGE_CLASS[status] || 'badge-neutral'), label);
  }

  /* ---------- Component rows ---------- */

  // issues: the result of Nexus.compat.getIssuesByCategory(report)
  function renderComponentList(listElement, issues) {
    const problems = issues || {};
    listElement.replaceChildren();

    Nexus.catalog.categories.forEach(function (category) {
      const product = Nexus.state.getSelectedProduct(category.id);
      const issue = product ? problems[category.id] : null;
      const row = el('li', 'component-row ' + (product ? 'component-row--selected' : 'component-row--empty') + (issue ? ' component-row--' + issue.status : ''));

      const icon = el('div', 'component-row__icon', category.short);
      icon.setAttribute('aria-hidden', 'true');
      row.appendChild(icon);

      const info = el('div', 'component-row__info');
      info.appendChild(el('div', 'component-row__label', category.label));

      if (product) {
        info.appendChild(el('div', 'component-row__name', product.name));
        if (product.specs) info.appendChild(el('div', 'component-row__specs', product.specs));
        if (issue) {
          // "Incompatible: ..." / "Warning: ..." (words, not just colour)
          info.appendChild(el('div', 'component-row__issue component-row__issue--' + issue.status, Nexus.compat.STATUS_LABELS[issue.status] + ': ' + issue.message));
        }
        row.appendChild(info);
        row.appendChild(el('div', 'component-row__price', Nexus.price.formatDZD(product.price)));

        const actions = el('div', 'component-row__actions');
        actions.appendChild(actionButton('Change', 'btn btn-outline btn-sm', 'open', category));
        actions.appendChild(actionButton('Remove', 'btn btn-ghost btn-sm', 'remove', category));
        row.appendChild(actions);
      } else {
        info.appendChild(el('div', 'component-row__empty-text', 'No component selected'));
        row.appendChild(info);

        const actions = el('div', 'component-row__actions');
        actions.appendChild(actionButton('Select', 'btn btn-primary btn-sm', 'open', category));
        row.appendChild(actions);
      }

      listElement.appendChild(row);
    });
  }

  /* ---------- Build summary ---------- */

  // refs is an object of page elements, collected once in main.js.
  // report is the result of Nexus.compat.evaluate(...).
  function renderSummary(refs, report) {
    const categories = Nexus.catalog.categories;
    const items = Nexus.state.getSelectedItems();
    const totals = Nexus.price.calculateTotal(items.map(function (item) { return item.product; }));
    const totalText = Nexus.price.formatDZD(totals.total);

    // Count, e.g. "2 of 8 components selected"
    refs.count.textContent = items.length + ' of ' + categories.length + ' components selected';

    // One line per selected component
    refs.items.replaceChildren();
    if (items.length === 0) {
      refs.items.appendChild(el('p', 'summary-empty', 'Nothing selected yet. Choose a processor to start your build.'));
    } else {
      items.forEach(function (item) {
        const line = el('div', 'summary-row');
        line.appendChild(el('span', '', item.category.label));
        line.appendChild(el('span', '', Nexus.price.formatDZD(item.product.price)));
        refs.items.appendChild(line);
      });
    }

    // Total, plus a warning if some selected products have no price
    refs.total.textContent = totalText;
    if (totals.unpricedCount > 0) {
      refs.priceNote.textContent = 'Total excludes ' + plural(totals.unpricedCount, 'item') + ' with no listed price.';
      refs.priceNote.hidden = false;
    } else {
      refs.priceNote.textContent = '';
      refs.priceNote.hidden = true;
    }

    // Missing components
    const missing = categories.filter(function (category) {
      return !Nexus.state.getSelectedProduct(category.id);
    });
    refs.missing.textContent = missing.length === 0
      ? 'All components selected.'
      : 'Missing: ' + missing.map(function (category) { return category.label; }).join(', ');

    // Copy and Save only make sense once something is selected
    refs.copyButton.disabled = items.length === 0;
    refs.saveButton.disabled = items.length === 0;

    renderCompatibility(refs, report);

    // Compact bar shown at the bottom of the screen on tablets and phones
    refs.mobileCount.textContent = items.length + '/' + categories.length + ' selected';
    refs.mobileTotal.textContent = totalText;
  }

  /* ---------- Compatibility section of the summary ---------- */

  function renderCompatibility(refs, report) {
    // Overall badge, e.g. "Compatible so far" or "Incompatible"
    refs.compatOverall.className = 'badge ' + (BADGE_CLASS[report.overall.status] || 'badge-neutral');
    refs.compatOverall.textContent = report.overall.label;

    // One entry per check that could run. Compatible ones get a short
    // explanation too, so people can see WHAT was verified.
    refs.compatList.replaceChildren();
    report.checks.forEach(function (check) {
      const item = el('li', 'compat-item');
      const head = el('div', 'compat-item__head');
      head.appendChild(el('span', 'compat-item__title', check.title));
      head.appendChild(statusBadge(check.status, Nexus.compat.STATUS_LABELS[check.status]));
      item.appendChild(head);
      item.appendChild(el('p', 'compat-item__message', check.message));
      refs.compatList.appendChild(item);
    });

    // Checks that can't run yet, grouped as "Waiting for: Motherboard, Case"
    const neededIds = [];
    report.waiting.forEach(function (check) {
      check.needs.forEach(function (id) {
        if (neededIds.indexOf(id) === -1) neededIds.push(id);
      });
    });
    const neededLabels = Nexus.catalog.categories
      .filter(function (category) { return neededIds.indexOf(category.id) !== -1; })
      .map(function (category) { return category.label; });
    refs.compatWaiting.textContent = neededLabels.length > 0
      ? 'More checks unlock when you choose: ' + neededLabels.join(', ') + '.'
      : '';
    refs.compatWaiting.hidden = neededLabels.length === 0;

    // Estimated power draw, once the processor and graphics card are chosen
    if (report.power) {
      refs.compatPower.textContent = 'Estimated peak power draw: ' + report.power.estimatedW + ' W. Recommended power supply: ' + report.power.recommendedW + ' W or more.';
      refs.compatPower.hidden = false;
    } else {
      refs.compatPower.textContent = '';
      refs.compatPower.hidden = true;
    }
  }

  /* ---------- Text for the "Copy Summary" button ---------- */

  function buildSummaryText(report) {
    const categories = Nexus.catalog.categories;
    const items = Nexus.state.getSelectedItems();
    const totals = Nexus.price.calculateTotal(items.map(function (item) { return item.product; }));

    const lines = ['NEXUS PC BUILDER - my build', ''];
    items.forEach(function (item) {
      lines.push(item.category.label + ': ' + item.product.name + ' - ' + Nexus.price.formatDZD(item.product.price));
    });

    const missing = categories.filter(function (category) {
      return !Nexus.state.getSelectedProduct(category.id);
    });
    if (missing.length > 0) {
      lines.push('', 'Missing: ' + missing.map(function (category) { return category.label; }).join(', '));
    }

    lines.push('', 'Total: ' + Nexus.price.formatDZD(totals.total));
    if (totals.unpricedCount > 0) {
      lines.push('(Total excludes ' + plural(totals.unpricedCount, 'item') + ' with no listed price.)');
    }

    if (report) {
      lines.push('', 'Compatibility: ' + report.overall.label);
      report.checks.forEach(function (check) {
        if (check.status !== 'compatible') {
          lines.push('- ' + check.title + ' (' + Nexus.compat.STATUS_LABELS[check.status] + '): ' + check.message);
        }
      });
      if (report.power) {
        lines.push('Estimated peak power draw: ' + report.power.estimatedW + ' W. Recommended power supply: ' + report.power.recommendedW + ' W or more.');
      }
    }
    lines.push('');
    lines.push('Prices are illustrative demo prices, not live market data.');

    return lines.join('\n');
  }

  Nexus.ui = {
    el: el,
    statusBadge: statusBadge,
    renderComponentList: renderComponentList,
    renderSummary: renderSummary,
    buildSummaryText: buildSummaryText
  };
})();
