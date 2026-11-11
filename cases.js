// Sample PC case catalog. Prices are illustrative demo prices in DZD,
// not live market data — swap these for real listings later.
//
// `specs` is the text people read. `tech` holds the same facts as numbers and
// short codes so the compatibility engine can compare them. If you edit one,
// update the other. Sample values are approximate; verify before buying.

const CASE_PRODUCTS = [
  {
    id: 'case-1',
    name: 'Cooler Master MasterBox Q300L',
    manufacturer: 'Cooler Master',
    price: 8900,
    specs: 'Micro-ATX · GPU up to 360mm',
    tech: { formFactors: ['Micro-ATX', 'Mini-ITX'], maxGpuLengthMm: 360, maxCoolerHeightMm: 159, radiatorSupportMm: [120, 240] }
  },
  {
    id: 'case-2',
    name: 'Corsair 4000D Airflow',
    manufacturer: 'Corsair',
    price: 15500,
    specs: 'ATX Mid Tower · GPU up to 360mm',
    tech: { formFactors: ['ATX', 'Micro-ATX', 'Mini-ITX'], maxGpuLengthMm: 360, maxCoolerHeightMm: 170, radiatorSupportMm: [120, 140, 240, 280, 360] }
  },
  {
    id: 'case-3',
    name: 'NZXT H5 Flow',
    manufacturer: 'NZXT',
    price: 16500,
    specs: 'ATX Mid Tower · GPU up to 365mm',
    tech: { formFactors: ['ATX', 'Micro-ATX', 'Mini-ITX'], maxGpuLengthMm: 365, maxCoolerHeightMm: 165, radiatorSupportMm: [120, 140, 240, 280] }
  }
];
