// Sample prebuilt configurations. Each one lists product IDs from the
// catalog, so names, specs, prices and compatibility are always looked up
// from the real product data instead of being typed in twice.
// Totals are calculated by the page, so they never go out of date.
// All prices are illustrative demo prices, not verified retailer prices.
const PREBUILT_BUILDS = [
  {
    id: 'budget-gaming',
    name: 'Budget Gaming PC',
    summary: 'An affordable entry point for 1080p gaming and everyday use.',
    parts: { cpu: 'cpu-1', gpu: 'gpu-1', motherboard: 'mb-3', ram: 'ram-3', storage: 'sto-3', psu: 'psu-1', case: 'case-2', cooler: 'cooler-1' }
  },
  {
    id: '1080p-gaming',
    name: '1080p Gaming PC',
    summary: 'Smooth, high-settings 1080p gaming in a compact case.',
    parts: { cpu: 'cpu-2', gpu: 'gpu-1', motherboard: 'mb-2', ram: 'ram-1', storage: 'sto-1', psu: 'psu-1', case: 'case-1', cooler: 'cooler-1' }
  },
  {
    id: '1440p-gaming',
    name: '1440p Gaming PC',
    summary: 'High-refresh 1440p gaming with plenty of memory and storage.',
    parts: { cpu: 'cpu-2', gpu: 'gpu-2', motherboard: 'mb-2', ram: 'ram-2', storage: 'sto-2', psu: 'psu-2', case: 'case-3', cooler: 'cooler-2' }
  },
  {
    id: 'high-end-gaming',
    name: 'High-End Gaming PC',
    summary: 'Top-tier gaming performance with liquid cooling and room to grow.',
    parts: { cpu: 'cpu-3', gpu: 'gpu-3', motherboard: 'mb-1', ram: 'ram-2', storage: 'sto-2', psu: 'psu-3', case: 'case-3', cooler: 'cooler-3' }
  },
  {
    id: 'workstation',
    name: 'Workstation PC',
    summary: 'Fast cores, 32 GB of memory and 2 TB of storage for editing, rendering and development.',
    parts: { cpu: 'cpu-3', gpu: 'gpu-1', motherboard: 'mb-1', ram: 'ram-2', storage: 'sto-2', psu: 'psu-2', case: 'case-2', cooler: 'cooler-2' }
  }
];
