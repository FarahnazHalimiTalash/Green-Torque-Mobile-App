import type { EvType } from '@/types';

export type CatalogModel = {
  name: string;
  yearStart: number;
  yearEnd: number;
  evType: EvType;
};

export type CatalogMake = {
  name: string;
  models: CatalogModel[];
};

const CURRENT_YEAR = 2026;

function years(yearStart: number, yearEnd = CURRENT_YEAR): Pick<CatalogModel, 'yearStart' | 'yearEnd'> {
  return { yearStart, yearEnd };
}

export const VEHICLE_MAKES: CatalogMake[] = [
  {
    name: 'Audi',
    models: [
      { name: 'e-tron / Q8 e-tron', ...years(2019), evType: 'ev' },
      { name: 'e-tron GT', ...years(2022), evType: 'ev' },
      { name: 'Q4 e-tron', ...years(2022), evType: 'ev' },
      { name: 'Q6 e-tron', ...years(2025), evType: 'ev' },
    ],
  },
  {
    name: 'BMW',
    models: [
      { name: 'i3', ...years(2014, 2021), evType: 'ev' },
      { name: 'i4', ...years(2022), evType: 'ev' },
      { name: 'i5', ...years(2024), evType: 'ev' },
      { name: 'i7', ...years(2023), evType: 'ev' },
      { name: 'iX', ...years(2022), evType: 'ev' },
      { name: '330e', ...years(2016), evType: 'hybrid' },
      { name: 'X5 PHEV', ...years(2016), evType: 'hybrid' },
    ],
  },
  {
    name: 'Cadillac',
    models: [
      { name: 'Lyriq', ...years(2023), evType: 'ev' },
      { name: 'Optiq', ...years(2025), evType: 'ev' },
      { name: 'Escalade IQ', ...years(2025), evType: 'ev' },
    ],
  },
  {
    name: 'Chevrolet',
    models: [
      { name: 'Bolt EV', ...years(2017, 2023), evType: 'ev' },
      { name: 'Bolt EUV', ...years(2022, 2023), evType: 'ev' },
      { name: 'Blazer EV', ...years(2024), evType: 'ev' },
      { name: 'Equinox EV', ...years(2024), evType: 'ev' },
      { name: 'Silverado EV', ...years(2024), evType: 'ev' },
      { name: 'Volt', ...years(2011, 2019), evType: 'hybrid' },
    ],
  },
  {
    name: 'Chrysler',
    models: [{ name: 'Pacifica Hybrid', ...years(2017), evType: 'hybrid' }],
  },
  {
    name: 'Ford',
    models: [
      { name: 'Escape Hybrid', ...years(2020), evType: 'hybrid' },
      { name: 'Escape Plug-In Hybrid', ...years(2020), evType: 'hybrid' },
      { name: 'Explorer Hybrid', ...years(2020), evType: 'hybrid' },
      { name: 'F-150 Lightning', ...years(2022), evType: 'ev' },
      { name: 'Maverick Hybrid', ...years(2022), evType: 'hybrid' },
      { name: 'Mustang Mach-E', ...years(2021), evType: 'ev' },
    ],
  },
  {
    name: 'Genesis',
    models: [
      { name: 'Electrified G80', ...years(2022), evType: 'ev' },
      { name: 'Electrified GV70', ...years(2023), evType: 'ev' },
      { name: 'GV60', ...years(2023), evType: 'ev' },
    ],
  },
  {
    name: 'GMC',
    models: [
      { name: 'Hummer EV', ...years(2022), evType: 'ev' },
      { name: 'Sierra EV', ...years(2024), evType: 'ev' },
    ],
  },
  {
    name: 'Honda',
    models: [
      { name: 'Accord Hybrid', ...years(2014), evType: 'hybrid' },
      { name: 'Civic Hybrid', ...years(2025), evType: 'hybrid' },
      { name: 'CR-V Hybrid', ...years(2020), evType: 'hybrid' },
      { name: 'Prologue', ...years(2024), evType: 'ev' },
    ],
  },
  {
    name: 'Hyundai',
    models: [
      { name: 'Ioniq 5', ...years(2022), evType: 'ev' },
      { name: 'Ioniq 6', ...years(2023), evType: 'ev' },
      { name: 'Ioniq 9', ...years(2026), evType: 'ev' },
      { name: 'Kona Electric', ...years(2019), evType: 'ev' },
      { name: 'Santa Fe Hybrid', ...years(2021), evType: 'hybrid' },
      { name: 'Tucson Hybrid', ...years(2022), evType: 'hybrid' },
      { name: 'Tucson Plug-in Hybrid', ...years(2022), evType: 'hybrid' },
    ],
  },
  {
    name: 'Jeep',
    models: [
      { name: 'Grand Cherokee 4xe', ...years(2022), evType: 'hybrid' },
      { name: 'Wrangler 4xe', ...years(2021), evType: 'hybrid' },
    ],
  },
  {
    name: 'Kia',
    models: [
      { name: 'Carnival Hybrid', ...years(2025), evType: 'hybrid' },
      { name: 'EV6', ...years(2022), evType: 'ev' },
      { name: 'EV9', ...years(2024), evType: 'ev' },
      { name: 'Niro EV', ...years(2019), evType: 'ev' },
      { name: 'Niro Hybrid', ...years(2017), evType: 'hybrid' },
      { name: 'Niro Plug-in Hybrid', ...years(2018), evType: 'hybrid' },
      { name: 'Sorento Hybrid', ...years(2021), evType: 'hybrid' },
      { name: 'Sorento Plug-in Hybrid', ...years(2022), evType: 'hybrid' },
      { name: 'Sportage Hybrid', ...years(2023), evType: 'hybrid' },
      { name: 'Sportage Plug-in Hybrid', ...years(2023), evType: 'hybrid' },
    ],
  },
  {
    name: 'Lexus',
    models: [
      { name: 'ES 300h', ...years(2013), evType: 'hybrid' },
      { name: 'NX 350h', ...years(2022), evType: 'hybrid' },
      { name: 'NX 450h+', ...years(2022), evType: 'hybrid' },
      { name: 'RX 350h', ...years(2023), evType: 'hybrid' },
      { name: 'RX 450h+', ...years(2023), evType: 'hybrid' },
      { name: 'RZ', ...years(2023), evType: 'ev' },
      { name: 'TX 550h+', ...years(2024), evType: 'hybrid' },
      { name: 'UX 250h', ...years(2019, 2024), evType: 'hybrid' },
    ],
  },
  {
    name: 'Lucid',
    models: [
      { name: 'Air', ...years(2022), evType: 'ev' },
      { name: 'Gravity', ...years(2025), evType: 'ev' },
    ],
  },
  {
    name: 'Mazda',
    models: [
      { name: 'CX-70 PHEV', ...years(2025), evType: 'hybrid' },
      { name: 'CX-90 PHEV', ...years(2024), evType: 'hybrid' },
    ],
  },
  {
    name: 'Mercedes-Benz',
    models: [
      { name: 'EQB', ...years(2022), evType: 'ev' },
      { name: 'EQE', ...years(2023), evType: 'ev' },
      { name: 'EQE SUV', ...years(2023), evType: 'ev' },
      { name: 'EQS', ...years(2022), evType: 'ev' },
      { name: 'EQS SUV', ...years(2023), evType: 'ev' },
    ],
  },
  {
    name: 'Mitsubishi',
    models: [{ name: 'Outlander PHEV', ...years(2018), evType: 'hybrid' }],
  },
  {
    name: 'Nissan',
    models: [
      { name: 'Ariya', ...years(2023), evType: 'ev' },
      { name: 'Leaf', ...years(2011), evType: 'ev' },
    ],
  },
  {
    name: 'Polestar',
    models: [
      { name: '2', ...years(2021), evType: 'ev' },
      { name: '3', ...years(2025), evType: 'ev' },
      { name: '4', ...years(2025), evType: 'ev' },
    ],
  },
  {
    name: 'Porsche',
    models: [
      { name: 'Cayenne E-Hybrid', ...years(2019), evType: 'hybrid' },
      { name: 'Panamera E-Hybrid', ...years(2018), evType: 'hybrid' },
      { name: 'Taycan', ...years(2020), evType: 'ev' },
    ],
  },
  {
    name: 'Rivian',
    models: [
      { name: 'R1S', ...years(2022), evType: 'ev' },
      { name: 'R1T', ...years(2022), evType: 'ev' },
    ],
  },
  {
    name: 'Subaru',
    models: [
      { name: 'Crosstrek Hybrid', ...years(2019, 2023), evType: 'hybrid' },
      { name: 'Solterra', ...years(2023), evType: 'ev' },
    ],
  },
  {
    name: 'Tesla',
    models: [
      { name: 'Cybertruck', ...years(2024), evType: 'ev' },
      { name: 'Model 3', ...years(2017), evType: 'ev' },
      { name: 'Model S', ...years(2012), evType: 'ev' },
      { name: 'Model X', ...years(2015), evType: 'ev' },
      { name: 'Model Y', ...years(2020), evType: 'ev' },
    ],
  },
  {
    name: 'Toyota',
    models: [
      { name: 'bZ4X', ...years(2023), evType: 'ev' },
      { name: 'Camry Hybrid', ...years(2007), evType: 'hybrid' },
      { name: 'Crown', ...years(2023), evType: 'hybrid' },
      { name: 'Grand Highlander Hybrid', ...years(2024), evType: 'hybrid' },
      { name: 'Highlander Hybrid', ...years(2006), evType: 'hybrid' },
      { name: 'Prius', ...years(2004), evType: 'hybrid' },
      { name: 'Prius Prime', ...years(2017), evType: 'hybrid' },
      { name: 'RAV4 Hybrid', ...years(2016), evType: 'hybrid' },
      { name: 'RAV4 Prime', ...years(2021), evType: 'hybrid' },
      { name: 'Sienna Hybrid', ...years(2021), evType: 'hybrid' },
    ],
  },
  {
    name: 'Volkswagen',
    models: [
      { name: 'e-Golf', ...years(2015, 2020), evType: 'ev' },
      { name: 'ID. Buzz', ...years(2025), evType: 'ev' },
      { name: 'ID.4', ...years(2021), evType: 'ev' },
    ],
  },
  {
    name: 'Volvo',
    models: [
      { name: 'C40 Recharge', ...years(2022, 2024), evType: 'ev' },
      { name: 'EX30', ...years(2025), evType: 'ev' },
      { name: 'EX90', ...years(2025), evType: 'ev' },
      { name: 'XC40 Recharge', ...years(2021), evType: 'ev' },
      { name: 'XC60 Recharge', ...years(2018), evType: 'hybrid' },
      { name: 'XC90 Recharge', ...years(2016), evType: 'hybrid' },
    ],
  },
];

export const MAKE_OPTIONS = VEHICLE_MAKES.map((make) => ({ label: make.name, value: make.name }));

export function modelsForMake(make: string): CatalogModel[] {
  return VEHICLE_MAKES.find((item) => item.name === make)?.models ?? [];
}

export function yearsForModel(make: string, model: string): number[] {
  const found = modelsForMake(make).find((item) => item.name === model);
  if (!found) return [];
  const list: number[] = [];
  for (let year = found.yearEnd; year >= found.yearStart; year -= 1) {
    list.push(year);
  }
  return list;
}

export function evTypeForModel(make: string, model: string): EvType | undefined {
  return modelsForMake(make).find((item) => item.name === model)?.evType;
}
