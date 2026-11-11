// Sample memory catalog. Prices are illustrative demo prices in DZD,
// not live market data — swap these for real listings later.
//
// `specs` is the text people read. `tech` holds the same facts as numbers and
// short codes so the compatibility engine can compare them. If you edit one,
// update the other. Sample values are approximate; verify before buying.

const RAM_PRODUCTS = [
  {
    id: 'ram-1',
    name: 'Corsair Vengeance 16GB',
    manufacturer: 'Corsair',
    price: 9800,
    specs: 'DDR5 · 2x8GB · 5600MHz',
    tech: { type: 'DDR5', modules: 2 }
  },
  {
    id: 'ram-2',
    name: 'Kingston Fury Beast 32GB',
    manufacturer: 'Kingston',
    price: 17500,
    specs: 'DDR5 · 2x16GB · 6000MHz',
    tech: { type: 'DDR5', modules: 2 }
  },
  {
    id: 'ram-3',
    name: 'G.Skill Ripjaws 16GB',
    manufacturer: 'G.Skill',
    price: 7200,
    specs: 'DDR4 · 2x8GB · 3200MHz',
    tech: { type: 'DDR4', modules: 2 }
  }
];
