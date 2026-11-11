// Sample CPU catalog. Prices are illustrative demo prices in DZD,
// not live market data — swap these for real listings later.
//
// `specs` is the text people read. `tech` holds the same facts as numbers and
// short codes so the compatibility engine can compare them. If you edit one,
// update the other. Sample values are approximate; verify before buying.

const CPU_PRODUCTS = [
  {
    id: 'cpu-1',
    name: 'AMD Ryzen 5 5600',
    manufacturer: 'AMD',
    price: 24900,
    specs: '6 cores · 12 threads · AM4 socket',
    tech: { socket: 'AM4', chipsets: ['A520', 'B450', 'B550', 'X470', 'X570'], generation: 'Ryzen 5000', tdpW: 65, maxPowerW: 88 }
  },
  {
    id: 'cpu-2',
    name: 'Intel Core i5-13400F',
    manufacturer: 'Intel',
    price: 32500,
    specs: '10 cores · 16 threads · LGA1700 socket',
    tech: { socket: 'LGA1700', chipsets: ['B660', 'B760', 'H610', 'H670', 'Z690', 'Z790'], generation: 'Intel 13th Gen', tdpW: 65, maxPowerW: 148 }
  },
  {
    id: 'cpu-3',
    name: 'AMD Ryzen 7 7800X3D',
    manufacturer: 'AMD',
    price: 52900,
    specs: '8 cores · 16 threads · AM5 socket',
    tech: { socket: 'AM5', chipsets: ['A620', 'B650', 'B650E', 'X670', 'X670E'], generation: 'Ryzen 7000', tdpW: 120, maxPowerW: 162 }
  }
];
