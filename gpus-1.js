// Sample GPU catalog. Prices are illustrative demo prices in DZD,
// not live market data — swap these for real listings later.
//
// `specs` is the text people read. `tech` holds the same facts as numbers and
// short codes so the compatibility engine can compare them. If you edit one,
// update the other. Sample values are approximate; verify before buying.

const GPU_PRODUCTS = [
  {
    id: 'gpu-1',
    name: 'NVIDIA RTX 4060',
    manufacturer: 'NVIDIA',
    price: 68000,
    specs: '8GB GDDR6 · 2 slots',
    tech: { lengthMm: 240, powerW: 115, recommendedPsuW: 550 }
  },
  {
    id: 'gpu-2',
    name: 'AMD Radeon RX 7700 XT',
    manufacturer: 'AMD',
    price: 89500,
    specs: '12GB GDDR6 · 2.5 slots',
    tech: { lengthMm: 267, powerW: 245, recommendedPsuW: 700 }
  },
  {
    id: 'gpu-3',
    name: 'NVIDIA RTX 4070 Super',
    manufacturer: 'NVIDIA',
    price: 118500,
    specs: '12GB GDDR6X · 2.5 slots',
    tech: { lengthMm: 267, powerW: 220, recommendedPsuW: 650 }
  }
];
