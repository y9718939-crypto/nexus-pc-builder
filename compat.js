/* ===========================================================
   COMPAT.JS
   The compatibility engine. Give it the parts chosen so far and
   it returns a report. It only reads data and never touches the
   page, so every rule can be tested on its own.

   Every check ends in one of four statuses:
     compatible    - the facts we have say it works
     warning       - it should work, but something needs attention
     incompatible  - it will not work
     unknown       - we don't have enough data to say

   GOLDEN RULE: never say "compatible" unless the data to prove it
   is actually present. Missing data always becomes "unknown".

   A check is "waiting" until both of its parts are chosen; waiting
   checks are listed separately, not shown as problems.
=========================================================== */
(function () {
  window.Nexus = window.Nexus || {};

  const STATUS = Object.freeze({
    COMPATIBLE: 'compatible',
    WARNING: 'warning',
    INCOMPATIBLE: 'incompatible',
    UNKNOWN: 'unknown'
  });

  const STATUS_LABELS = Object.freeze({
    compatible: 'Compatible',
    warning: 'Warning',
    incompatible: 'Incompatible',
    unknown: 'Unknown'
  });

  // Tunable numbers. Change them here and every check follows.
  const RULES = Object.freeze({
    baseSystemW: 100,        // motherboard, memory, storage, fans, USB devices
    psuHeadroomPercent: 30,  // PSU should be about 30% above the estimated peak draw
    psuRoundToW: 50,         // recommended wattage is rounded up to a neat number
    gpuTightMm: 10,          // a graphics card with less spare room than this gets a warning
    coolerTightMm: 3         // same idea for CPU cooler height
  });

  /* ---------- Small helpers ---------- */

  function isNumber(value) {
    return typeof value === 'number' && Number.isFinite(value);
  }

  function listHas(list, value) {
    return Array.isArray(list) && list.indexOf(value) !== -1;
  }

  // A product's technical facts. Products without any get an empty object,
  // so the checks below report "unknown" instead of crashing.
  function techOf(product) {
    return (product && product.tech) || {};
  }

  function outcome(status, message) {
    return { status: status, message: message };
  }

  /* ---------- Power estimate ---------- */

  // Estimated peak draw = processor peak + graphics card + a fixed allowance
  // for everything else. Recommended PSU = estimate + 30%, rounded up, but never
  // lower than what the graphics card maker recommends.
  // Whole numbers only: 500 * 1.3 is 650.0000000000001 in JavaScript, which
  // would wrongly round up to 700, so we work in percentages instead.
  function estimatePower(cpu, gpu) {
    const cpuWatts = techOf(cpu).maxPowerW;
    const gpuWatts = techOf(gpu).powerW;
    if (!isNumber(cpuWatts) || !isNumber(gpuWatts)) return null;

    const estimatedW = Math.round(cpuWatts + gpuWatts + RULES.baseSystemW);
    const withHeadroom = (estimatedW * (100 + RULES.psuHeadroomPercent)) / 100;
    let recommendedW = Math.ceil(withHeadroom / RULES.psuRoundToW) * RULES.psuRoundToW;

    const vendorRecommendation = techOf(gpu).recommendedPsuW;
    if (isNumber(vendorRecommendation)) recommendedW = Math.max(recommendedW, vendorRecommendation);

    return { estimatedW: estimatedW, recommendedW: recommendedW };
  }

  /* ---------- The individual checks ---------- */

  function checkCpuMotherboard(parts) {
    const cpu = parts.cpu;
    const board = parts.motherboard;
    const cpuTech = techOf(cpu);
    const boardTech = techOf(board);

    if (!cpuTech.socket || !boardTech.socket) {
      const missingName = !cpuTech.socket ? cpu.name : board.name;
      return outcome(STATUS.UNKNOWN, 'Socket information is missing for the ' + missingName + ', so this pair can\'t be checked.');
    }
    if (cpuTech.socket !== boardTech.socket) {
      return outcome(STATUS.INCOMPATIBLE, 'The ' + cpu.name + ' uses socket ' + cpuTech.socket + ', but the ' + board.name + ' has socket ' + boardTech.socket + '.');
    }
    if (!Array.isArray(cpuTech.chipsets) || !boardTech.chipset) {
      return outcome(STATUS.UNKNOWN, 'Socket ' + cpuTech.socket + ' matches, but chipset support data is missing, so full compatibility can\'t be confirmed.');
    }
    if (!listHas(cpuTech.chipsets, boardTech.chipset)) {
      return outcome(STATUS.INCOMPATIBLE, 'The ' + boardTech.chipset + ' chipset on the ' + board.name + ' isn\'t listed as supported by the ' + cpu.name + '.');
    }
    if (listHas(boardTech.biosUpdateMayBeNeededFor, cpuTech.generation)) {
      return outcome(STATUS.WARNING, 'The socket and chipset match, but this board may need a BIOS update before it starts with the ' + cpu.name + '. Check the board maker\'s CPU support list.');
    }

    // Be upfront when BIOS requirements are not part of the data.
    const biosNote = Array.isArray(boardTech.biosUpdateMayBeNeededFor) ? '' : ' BIOS versions aren\'t tracked in this catalog.';
    return outcome(STATUS.COMPATIBLE, 'Socket ' + cpuTech.socket + ' matches and the ' + boardTech.chipset + ' chipset is supported.' + biosNote);
  }

  function checkMemoryMotherboard(parts) {
    const ram = parts.ram;
    const board = parts.motherboard;
    const ramTech = techOf(ram);
    const boardTech = techOf(board);

    if (!ramTech.type || !boardTech.memoryType) {
      return outcome(STATUS.UNKNOWN, 'Memory type information is missing, so this pair can\'t be checked.');
    }
    if (ramTech.type !== boardTech.memoryType) {
      return outcome(STATUS.INCOMPATIBLE, ramTech.type + ' memory won\'t work in this motherboard, which uses ' + boardTech.memoryType + '.');
    }
    if (isNumber(ramTech.modules) && isNumber(boardTech.memorySlots)) {
      if (ramTech.modules > boardTech.memorySlots) {
        return outcome(STATUS.INCOMPATIBLE, 'The memory kit has ' + ramTech.modules + ' modules but the motherboard has only ' + boardTech.memorySlots + ' memory slots.');
      }
      return outcome(STATUS.COMPATIBLE, 'Both use ' + ramTech.type + '. The kit uses ' + ramTech.modules + ' of ' + boardTech.memorySlots + ' slots.');
    }
    return outcome(STATUS.COMPATIBLE, 'Both use ' + ramTech.type + '.');
  }

  function checkMotherboardCase(parts) {
    const board = parts.motherboard;
    const pcCase = parts.case;
    const formFactor = techOf(board).formFactor;
    const supported = techOf(pcCase).formFactors;

    if (!formFactor || !Array.isArray(supported)) {
      return outcome(STATUS.UNKNOWN, 'Motherboard size or case support data is missing, so this pair can\'t be checked.');
    }
    if (!listHas(supported, formFactor)) {
      return outcome(STATUS.INCOMPATIBLE, 'A ' + formFactor + ' motherboard won\'t fit: this case supports ' + supported.join(', ') + '.');
    }
    return outcome(STATUS.COMPATIBLE, 'The ' + formFactor + ' motherboard fits this case.');
  }

  function checkGpuCase(parts) {
    const length = techOf(parts.gpu).lengthMm;
    const maxLength = techOf(parts.case).maxGpuLengthMm;

    if (!isNumber(length) || !isNumber(maxLength)) {
      return outcome(STATUS.UNKNOWN, 'Graphics card length or case clearance is missing, so this pair can\'t be checked.');
    }
    const spare = maxLength - length;
    if (spare < 0) {
      return outcome(STATUS.INCOMPATIBLE, 'The graphics card is ' + length + ' mm long but the case only fits ' + maxLength + ' mm.');
    }
    if (spare < RULES.gpuTightMm) {
      return outcome(STATUS.WARNING, 'It fits, but with only ' + spare + ' mm to spare (' + length + ' mm card, ' + maxLength + ' mm limit). Check fan and cable clearance.');
    }
    return outcome(STATUS.COMPATIBLE, 'A ' + length + ' mm card in a case that fits ' + maxLength + ' mm (' + spare + ' mm to spare).');
  }

  function checkCoolerCpu(parts) {
    const coolerTech = techOf(parts.cooler);
    const cpuTech = techOf(parts.cpu);

    if (!Array.isArray(coolerTech.sockets) || !cpuTech.socket) {
      return outcome(STATUS.UNKNOWN, 'Cooler socket support or processor socket is missing, so this pair can\'t be checked.');
    }
    if (!listHas(coolerTech.sockets, cpuTech.socket)) {
      return outcome(STATUS.INCOMPATIBLE, 'The ' + parts.cooler.name + ' doesn\'t list support for socket ' + cpuTech.socket + '.');
    }
    const hasRating = isNumber(coolerTech.tdpRatingW) && isNumber(cpuTech.tdpW);
    if (hasRating && coolerTech.tdpRatingW < cpuTech.tdpW) {
      return outcome(STATUS.WARNING, 'It supports socket ' + cpuTech.socket + ', but the cooler is rated for ' + coolerTech.tdpRatingW + ' W and the processor is ' + cpuTech.tdpW + ' W.');
    }
    const ratingNote = hasRating
      ? ' Rated for ' + coolerTech.tdpRatingW + ' W; the processor is ' + cpuTech.tdpW + ' W.'
      : ' No cooling rating is listed, so cooling capacity isn\'t checked.';
    return outcome(STATUS.COMPATIBLE, 'Supports socket ' + cpuTech.socket + '.' + ratingNote);
  }

  function checkCoolerCase(parts) {
    const coolerTech = techOf(parts.cooler);
    const caseTech = techOf(parts.case);

    if (coolerTech.type === 'air') {
      if (!isNumber(coolerTech.heightMm) || !isNumber(caseTech.maxCoolerHeightMm)) {
        return outcome(STATUS.UNKNOWN, 'Cooler height or case clearance is missing, so this pair can\'t be checked.');
      }
      const spare = caseTech.maxCoolerHeightMm - coolerTech.heightMm;
      if (spare < 0) {
        return outcome(STATUS.INCOMPATIBLE, 'The cooler is ' + coolerTech.heightMm + ' mm tall but the case only fits ' + caseTech.maxCoolerHeightMm + ' mm.');
      }
      if (spare < RULES.coolerTightMm) {
        return outcome(STATUS.WARNING, 'It fits, but with only ' + spare + ' mm to spare (' + coolerTech.heightMm + ' mm cooler, ' + caseTech.maxCoolerHeightMm + ' mm limit).');
      }
      return outcome(STATUS.COMPATIBLE, 'A ' + coolerTech.heightMm + ' mm cooler in a case that fits ' + caseTech.maxCoolerHeightMm + ' mm.');
    }

    if (coolerTech.type === 'liquid') {
      if (!isNumber(coolerTech.radiatorMm) || !Array.isArray(caseTech.radiatorSupportMm)) {
        return outcome(STATUS.UNKNOWN, 'Radiator size or case radiator support is missing, so this pair can\'t be checked.');
      }
      if (!listHas(caseTech.radiatorSupportMm, coolerTech.radiatorMm)) {
        return outcome(STATUS.INCOMPATIBLE, 'The case doesn\'t list support for a ' + coolerTech.radiatorMm + ' mm radiator (it lists ' + caseTech.radiatorSupportMm.join(', ') + ' mm).');
      }
      return outcome(STATUS.COMPATIBLE, 'The case lists support for a ' + coolerTech.radiatorMm + ' mm radiator.');
    }

    return outcome(STATUS.UNKNOWN, 'The cooler type isn\'t listed, so this pair can\'t be checked.');
  }

  function checkPowerSupply(parts) {
    const power = estimatePower(parts.cpu, parts.gpu);
    const wattage = techOf(parts.psu).wattage;

    if (!power || !isNumber(wattage)) {
      return outcome(STATUS.UNKNOWN, 'Power data is missing for the processor, graphics card or power supply, so power can\'t be checked.');
    }
    if (wattage < power.estimatedW) {
      return outcome(STATUS.INCOMPATIBLE, 'This ' + wattage + ' W power supply can\'t cover the estimated ' + power.estimatedW + ' W peak draw.');
    }
    if (wattage < power.recommendedW) {
      return outcome(STATUS.WARNING, 'It covers the estimated ' + power.estimatedW + ' W draw, but ' + power.recommendedW + ' W or more is recommended for a safe margin.');
    }
    const headroom = Math.round(((wattage - power.estimatedW) / power.estimatedW) * 100);
    return outcome(STATUS.COMPATIBLE, wattage + ' W covers the estimated ' + power.estimatedW + ' W draw with about ' + headroom + '% headroom.');
  }

  // Every check: which parts it needs, and the function that judges them.
  const CHECKS = [
    { id: 'cpu-motherboard',  title: 'Processor & Motherboard', needs: ['cpu', 'motherboard'], run: checkCpuMotherboard },
    { id: 'ram-motherboard',  title: 'Memory & Motherboard',    needs: ['ram', 'motherboard'], run: checkMemoryMotherboard },
    { id: 'motherboard-case', title: 'Motherboard & Case',      needs: ['motherboard', 'case'], run: checkMotherboardCase },
    { id: 'gpu-case',         title: 'Graphics Card & Case',    needs: ['gpu', 'case'],         run: checkGpuCase },
    { id: 'cooler-cpu',       title: 'CPU Cooler & Processor',  needs: ['cooler', 'cpu'],       run: checkCoolerCpu },
    { id: 'cooler-case',      title: 'CPU Cooler & Case',       needs: ['cooler', 'case'],      run: checkCoolerCase },
    { id: 'psu-power',        title: 'Power Supply',            needs: ['psu', 'cpu', 'gpu'],   run: checkPowerSupply }
  ];

  /* ---------- Putting it together ---------- */

  // One badge's worth of summary for the whole build.
  function summarize(checks, waiting) {
    const count = function (status) {
      return checks.filter(function (check) { return check.status === status; }).length;
    };

    if (checks.length === 0) return { status: STATUS.UNKNOWN, label: 'Not checked yet' };
    if (count(STATUS.INCOMPATIBLE) > 0) return { status: STATUS.INCOMPATIBLE, label: 'Incompatible' };
    if (count(STATUS.WARNING) > 0) return { status: STATUS.WARNING, label: 'Warnings' };
    if (count(STATUS.UNKNOWN) > 0) return { status: STATUS.UNKNOWN, label: 'Some checks unknown' };
    if (waiting.length > 0) return { status: STATUS.COMPATIBLE, label: 'Compatible so far' };
    return { status: STATUS.COMPATIBLE, label: 'All checks passed' };
  }

  // parts: { cpu: product, motherboard: product, ... } (only the chosen ones)
  function evaluate(parts) {
    const selected = parts || {};
    const checks = [];
    const waiting = [];

    CHECKS.forEach(function (check) {
      const missing = check.needs.filter(function (categoryId) { return !selected[categoryId]; });
      if (missing.length > 0) {
        waiting.push({ id: check.id, title: check.title, needs: missing });
        return;
      }

      let result;
      try {
        result = check.run(selected);
      } catch (error) {
        console.error('[Nexus] Compatibility check "' + check.id + '" failed:', error);
        result = outcome(STATUS.UNKNOWN, 'This check couldn\'t run because the product data was unexpected.');
      }
      checks.push({
        id: check.id,
        title: check.title,
        categories: check.needs.slice(),
        status: result.status,
        message: result.message
      });
    });

    return {
      checks: checks,
      waiting: waiting,
      overall: summarize(checks, waiting),
      power: selected.cpu && selected.gpu ? estimatePower(selected.cpu, selected.gpu) : null
    };
  }

  // For each part involved in a warning or incompatibility, the most serious
  // problem: { cpu: { status, message }, ... }. Used to flag rows on the page.
  function getIssuesByCategory(report) {
    const rank = { warning: 1, incompatible: 2 };
    const issues = {};

    report.checks.forEach(function (check) {
      if (!rank[check.status]) return;
      check.categories.forEach(function (categoryId) {
        const current = issues[categoryId];
        if (!current || rank[check.status] > rank[current.status]) {
          issues[categoryId] = { status: check.status, message: check.message };
        }
      });
    });
    return issues;
  }

  Nexus.compat = {
    STATUS: STATUS,
    STATUS_LABELS: STATUS_LABELS,
    RULES: RULES,
    evaluate: evaluate,
    estimatePower: estimatePower,
    getIssuesByCategory: getIssuesByCategory
  };
})();
