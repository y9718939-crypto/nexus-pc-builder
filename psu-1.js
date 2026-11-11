// Sample power supply catalog. Prices are illustrative demo prices in DZD,
// not live market data — swap these for real listings later.
//
// `specs` is the text people read. `tech` holds the same facts as numbers and
// short codes so the compatibility engine can compare them. If you edit one,
// update the other. Sample values are approximate; verify before buying.

const PSU_PRODUCTS = [
  {
    id: 'psu-1',
    name: 'Corsair CV650',
    manufacturer: 'Corsair',
    price: 7800,
    specs: '650W · 80+ Bronze',
    tech: { wattage: 650 }
  },
  {
    id: 'psu-2',
    name: 'EVGA SuperNOVA 750 GT',
    manufacturer: 'EVGA',
    price: 11500,
    specs: '750W · 80+ Gold',
    tech: { wattage: 750 }
  },
  {
    id: 'psu-3',
    name: 'be quiet! Pure Power 11 850W',
    manufacturer: 'be quiet!',
    price: 14200,
    specs: '850W · 80+ Gold',
    tech: { wattage: 850 }
  }
];
