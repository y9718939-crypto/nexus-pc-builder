// Sample CPU cooler catalog. Prices are illustrative demo prices in DZD,
// not live market data — swap these for real listings later.
//
// `specs` is the text people read. `tech` holds the same facts as numbers and
// short codes so the compatibility engine can compare them. If you edit one,
// update the other. Sample values are approximate; verify before buying.

const COOLER_PRODUCTS = [
  {
    id: 'cooler-1',
    name: 'DeepCool AK400',
    manufacturer: 'DeepCool',
    price: 4900,
    specs: 'Air · AM4 / AM5 / LGA1700 · 155mm tall',
    tech: { type: 'air', sockets: ['AM4', 'AM5', 'LGA1700'], heightMm: 155, tdpRatingW: 220 }
  },
  {
    id: 'cooler-2',
    name: 'Noctua NH-U12S',
    manufacturer: 'Noctua',
    price: 11800,
    specs: 'Air · AM4 / AM5 / LGA1700 · 158mm tall',
    tech: { type: 'air', sockets: ['AM4', 'AM5', 'LGA1700'], heightMm: 158, tdpRatingW: null }
  },
  {
    id: 'cooler-3',
    name: 'Arctic Liquid Freezer III 240',
    manufacturer: 'Arctic',
    price: 13900,
    specs: 'Liquid · 240mm radiator · AM4 / AM5 / LGA1700',
    tech: { type: 'liquid', sockets: ['AM4', 'AM5', 'LGA1700'], radiatorMm: 240, tdpRatingW: null }
  }
];
