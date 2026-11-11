// Sample storage catalog. Prices are illustrative demo prices in DZD,
// not live market data — swap these for real listings later.
//
// `specs` is the text people read. `tech` holds the same facts as numbers and
// short codes so the compatibility engine can compare them. If you edit one,
// update the other. Sample values are approximate; verify before buying.

const STORAGE_PRODUCTS = [
  {
    id: 'sto-1',
    name: 'Samsung 980 1TB',
    manufacturer: 'Samsung',
    price: 8900,
    specs: 'NVMe SSD · PCIe 3.0',
    tech: {}
  },
  {
    id: 'sto-2',
    name: 'WD Black SN770 2TB',
    manufacturer: 'Western Digital',
    price: 16500,
    specs: 'NVMe SSD · PCIe 4.0',
    tech: {}
  },
  {
    id: 'sto-3',
    name: 'Crucial MX500 500GB',
    manufacturer: 'Crucial',
    price: 4200,
    specs: 'SATA SSD · 2.5"',
    tech: {}
  }
];
