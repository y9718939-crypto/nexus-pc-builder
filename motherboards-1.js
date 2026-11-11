// Sample motherboard catalog. Prices are illustrative demo prices in DZD,
// not live market data — swap these for real listings later.
//
// `specs` is the text people read. `tech` holds the same facts as numbers and
// short codes so the compatibility engine can compare them. If you edit one,
// update the other. Sample values are approximate; verify before buying.

const MOTHERBOARD_PRODUCTS = [
  {
    id: 'mb-1',
    name: 'ASUS Prime B650-Plus',
    manufacturer: 'ASUS',
    price: 27500,
    specs: 'AM5 socket · DDR5 · ATX',
    tech: { socket: 'AM5', chipset: 'B650', memoryType: 'DDR5', formFactor: 'ATX', memorySlots: 4 }
  },
  {
    id: 'mb-2',
    name: 'MSI PRO B760M',
    manufacturer: 'MSI',
    price: 22000,
    specs: 'LGA1700 socket · DDR5 · Micro-ATX',
    tech: { socket: 'LGA1700', chipset: 'B760', memoryType: 'DDR5', formFactor: 'Micro-ATX', memorySlots: 4 }
  },
  {
    id: 'mb-3',
    name: 'Gigabyte B550 AORUS Elite',
    manufacturer: 'Gigabyte',
    price: 19500,
    specs: 'AM4 socket · DDR4 · ATX',
    tech: { socket: 'AM4', chipset: 'B550', memoryType: 'DDR4', formFactor: 'ATX', memorySlots: 4 }
  }
];
