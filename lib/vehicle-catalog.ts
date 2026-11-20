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
    name: 'Acura',
    models: [
      { name: 'Integra', ...years(2023), evType: 'ice' },
      { name: 'MDX', ...years(2001), evType: 'ice' },
      { name: 'RDX', ...years(2007), evType: 'ice' },
      { name: 'TLX', ...years(2015), evType: 'ice' },
    ],
  },
  {
    name: 'Audi',
    models: [
      { name: 'A4', ...years(2009), evType: 'ice' },
      { name: 'A6', ...years(2009), evType: 'ice' },
      { name: 'e-tron / Q8 e-tron', ...years(2019), evType: 'ev' },
      { name: 'e-tron GT', ...years(2022), evType: 'ev' },
      { name: 'Q4 e-tron', ...years(2022), evType: 'ev' },
      { name: 'Q5', ...years(2009), evType: 'ice' },
      { name: 'Q6 e-tron', ...years(2025), evType: 'ev' },
      { name: 'Q7', ...years(2007), evType: 'ice' },
    ],
  },
  {
    name: 'BMW',
    models: [
      { name: '3 Series', ...years(2006), evType: 'ice' },
      { name: '330e', ...years(2016), evType: 'hybrid' },
      { name: '5 Series', ...years(2006), evType: 'ice' },
      { name: 'i3', ...years(2014, 2021), evType: 'ev' },
      { name: 'i4', ...years(2022), evType: 'ev' },
      { name: 'i5', ...years(2024), evType: 'ev' },
      { name: 'i7', ...years(2023), evType: 'ev' },
      { name: 'iX', ...years(2022), evType: 'ev' },
      { name: 'X3', ...years(2004), evType: 'ice' },
      { name: 'X5', ...years(2000), evType: 'ice' },
      { name: 'X5 PHEV', ...years(2016), evType: 'hybrid' },
    ],
  },
  {
    name: 'Cadillac',
    models: [
      { name: 'Escalade', ...years(2002), evType: 'ice' },
      { name: 'Escalade IQ', ...years(2025), evType: 'ev' },
      { name: 'Lyriq', ...years(2023), evType: 'ev' },
      { name: 'Optiq', ...years(2025), evType: 'ev' },
      { name: 'XT5', ...years(2017), evType: 'ice' },
    ],
  },
  {
    name: 'Chevrolet',
    models: [
      { name: 'Blazer', ...years(2019), evType: 'ice' },
      { name: 'Blazer EV', ...years(2024), evType: 'ev' },
      { name: 'Bolt EV', ...years(2017, 2023), evType: 'ev' },
      { name: 'Bolt EUV', ...years(2022, 2023), evType: 'ev' },
      { name: 'Colorado', ...years(2004), evType: 'ice' },
      { name: 'Equinox', ...years(2005), evType: 'ice' },
      { name: 'Equinox EV', ...years(2024), evType: 'ev' },
      { name: 'Malibu', ...years(2008), evType: 'ice' },
      { name: 'Silverado', ...years(2007), evType: 'ice' },
      { name: 'Silverado EV', ...years(2024), evType: 'ev' },
      { name: 'Tahoe', ...years(2007), evType: 'ice' },
      { name: 'Traverse', ...years(2009), evType: 'ice' },
      { name: 'Volt', ...years(2011, 2019), evType: 'hybrid' },
    ],
  },
  {
    name: 'Chrysler',
    models: [
      { name: 'Pacifica', ...years(2017), evType: 'ice' },
      { name: 'Pacifica Hybrid', ...years(2017), evType: 'hybrid' },
    ],
  },
  {
    name: 'Dodge',
    models: [
      { name: 'Charger', ...years(2006), evType: 'ice' },
      { name: 'Durango', ...years(2011), evType: 'ice' },
      { name: 'Hornet', ...years(2023), evType: 'ice' },
    ],
  },
  {
    name: 'Ford',
    models: [
      { name: 'Bronco', ...years(2021), evType: 'ice' },
      { name: 'Escape', ...years(2001), evType: 'ice' },
      { name: 'Escape Hybrid', ...years(2020), evType: 'hybrid' },
      { name: 'Escape Plug-In Hybrid', ...years(2020), evType: 'hybrid' },
      { name: 'Explorer', ...years(2006), evType: 'ice' },
      { name: 'Explorer Hybrid', ...years(2020), evType: 'hybrid' },
      { name: 'F-150', ...years(2004), evType: 'ice' },
      { name: 'F-150 Lightning', ...years(2022), evType: 'ev' },
      { name: 'Maverick', ...years(2022), evType: 'ice' },
      { name: 'Maverick Hybrid', ...years(2022), evType: 'hybrid' },
      { name: 'Mustang', ...years(2005), evType: 'ice' },
      { name: 'Mustang Mach-E', ...years(2021), evType: 'ev' },
      { name: 'Ranger', ...years(2019), evType: 'ice' },
    ],
  },
  {
    name: 'Genesis',
    models: [
      { name: 'Electrified G80', ...years(2022), evType: 'ev' },
      { name: 'Electrified GV70', ...years(2023), evType: 'ev' },
      { name: 'G70', ...years(2019), evType: 'ice' },
      { name: 'GV60', ...years(2023), evType: 'ev' },
      { name: 'GV70', ...years(2022), evType: 'ice' },
      { name: 'GV80', ...years(2021), evType: 'ice' },
    ],
  },
  {
    name: 'GMC',
    models: [
      { name: 'Acadia', ...years(2007), evType: 'ice' },
      { name: 'Hummer EV', ...years(2022), evType: 'ev' },
      { name: 'Sierra', ...years(2007), evType: 'ice' },
      { name: 'Sierra EV', ...years(2024), evType: 'ev' },
      { name: 'Terrain', ...years(2010), evType: 'ice' },
      { name: 'Yukon', ...years(2007), evType: 'ice' },
    ],
  },
  {
    name: 'Honda',
    models: [
      { name: 'Accord', ...years(2003), evType: 'ice' },
      { name: 'Accord Hybrid', ...years(2014), evType: 'hybrid' },
      { name: 'Civic', ...years(2001), evType: 'ice' },
      { name: 'Civic Hybrid', ...years(2025), evType: 'hybrid' },
      { name: 'CR-V', ...years(2002), evType: 'ice' },
      { name: 'CR-V Hybrid', ...years(2020), evType: 'hybrid' },
      { name: 'HR-V', ...years(2016), evType: 'ice' },
      { name: 'Odyssey', ...years(2005), evType: 'ice' },
      { name: 'Pilot', ...years(2003), evType: 'ice' },
      { name: 'Prologue', ...years(2024), evType: 'ev' },
    ],
  },
  {
    name: 'Hyundai',
    models: [
      { name: 'Elantra', ...years(2001), evType: 'ice' },
      { name: 'Ioniq 5', ...years(2022), evType: 'ev' },
      { name: 'Ioniq 6', ...years(2023), evType: 'ev' },
      { name: 'Ioniq 9', ...years(2026), evType: 'ev' },
      { name: 'Kona', ...years(2018), evType: 'ice' },
      { name: 'Kona Electric', ...years(2019), evType: 'ev' },
      { name: 'Palisade', ...years(2020), evType: 'ice' },
      { name: 'Santa Fe', ...years(2001), evType: 'ice' },
      { name: 'Santa Fe Hybrid', ...years(2021), evType: 'hybrid' },
      { name: 'Sonata', ...years(2006), evType: 'ice' },
      { name: 'Tucson', ...years(2005), evType: 'ice' },
      { name: 'Tucson Hybrid', ...years(2022), evType: 'hybrid' },
      { name: 'Tucson Plug-in Hybrid', ...years(2022), evType: 'hybrid' },
    ],
  },
  {
    name: 'Jeep',
    models: [
      { name: 'Cherokee', ...years(2014, 2023), evType: 'ice' },
      { name: 'Gladiator', ...years(2020), evType: 'ice' },
      { name: 'Grand Cherokee', ...years(2005), evType: 'ice' },
      { name: 'Grand Cherokee 4xe', ...years(2022), evType: 'hybrid' },
      { name: 'Wrangler', ...years(2007), evType: 'ice' },
      { name: 'Wrangler 4xe', ...years(2021), evType: 'hybrid' },
    ],
  },
  {
    name: 'Kia',
    models: [
      { name: 'Carnival', ...years(2022), evType: 'ice' },
      { name: 'Carnival Hybrid', ...years(2025), evType: 'hybrid' },
      { name: 'EV6', ...years(2022), evType: 'ev' },
      { name: 'EV9', ...years(2024), evType: 'ev' },
      { name: 'Forte', ...years(2010), evType: 'ice' },
      { name: 'Niro EV', ...years(2019), evType: 'ev' },
      { name: 'Niro Hybrid', ...years(2017), evType: 'hybrid' },
      { name: 'Niro Plug-in Hybrid', ...years(2018), evType: 'hybrid' },
      { name: 'Sorento', ...years(2003), evType: 'ice' },
      { name: 'Sorento Hybrid', ...years(2021), evType: 'hybrid' },
      { name: 'Sorento Plug-in Hybrid', ...years(2022), evType: 'hybrid' },
      { name: 'Sportage', ...years(2005), evType: 'ice' },
      { name: 'Sportage Hybrid', ...years(2023), evType: 'hybrid' },
      { name: 'Sportage Plug-in Hybrid', ...years(2023), evType: 'hybrid' },
      { name: 'Telluride', ...years(2020), evType: 'ice' },
    ],
  },
  {
    name: 'Lexus',
    models: [
      { name: 'ES 350', ...years(2007), evType: 'ice' },
      { name: 'ES 300h', ...years(2013), evType: 'hybrid' },
      { name: 'GX', ...years(2003), evType: 'ice' },
      { name: 'NX 350', ...years(2022), evType: 'ice' },
      { name: 'NX 350h', ...years(2022), evType: 'hybrid' },
      { name: 'NX 450h+', ...years(2022), evType: 'hybrid' },
      { name: 'RX 350', ...years(2004), evType: 'ice' },
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
      { name: 'CX-5', ...years(2013), evType: 'ice' },
      { name: 'CX-50', ...years(2023), evType: 'ice' },
      { name: 'CX-70 PHEV', ...years(2025), evType: 'hybrid' },
      { name: 'CX-90 PHEV', ...years(2024), evType: 'hybrid' },
      { name: 'Mazda3', ...years(2004), evType: 'ice' },
    ],
  },
  {
    name: 'Mercedes-Benz',
    models: [
      { name: 'C-Class', ...years(2008), evType: 'ice' },
      { name: 'E-Class', ...years(2010), evType: 'ice' },
      { name: 'EQB', ...years(2022), evType: 'ev' },
      { name: 'EQE', ...years(2023), evType: 'ev' },
      { name: 'EQE SUV', ...years(2023), evType: 'ev' },
      { name: 'EQS', ...years(2022), evType: 'ev' },
      { name: 'EQS SUV', ...years(2023), evType: 'ev' },
      { name: 'GLC', ...years(2016), evType: 'ice' },
      { name: 'GLE', ...years(2016), evType: 'ice' },
    ],
  },
  {
    name: 'Mitsubishi',
    models: [
      { name: 'Outlander', ...years(2003), evType: 'ice' },
      { name: 'Outlander PHEV', ...years(2018), evType: 'hybrid' },
    ],
  },
  {
    name: 'Nissan',
    models: [
      { name: 'Altima', ...years(2002), evType: 'ice' },
      { name: 'Ariya', ...years(2023), evType: 'ev' },
      { name: 'Frontier', ...years(2005), evType: 'ice' },
      { name: 'Leaf', ...years(2011), evType: 'ev' },
      { name: 'Murano', ...years(2003), evType: 'ice' },
      { name: 'Pathfinder', ...years(2005), evType: 'ice' },
      { name: 'Rogue', ...years(2008), evType: 'ice' },
      { name: 'Sentra', ...years(2007), evType: 'ice' },
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
      { name: '911', ...years(2005), evType: 'ice' },
      { name: 'Cayenne', ...years(2003), evType: 'ice' },
      { name: 'Cayenne E-Hybrid', ...years(2019), evType: 'hybrid' },
      { name: 'Macan', ...years(2015), evType: 'ice' },
      { name: 'Panamera E-Hybrid', ...years(2018), evType: 'hybrid' },
      { name: 'Taycan', ...years(2020), evType: 'ev' },
    ],
  },
  {
    name: 'Ram',
    models: [
      { name: '1500', ...years(2002), evType: 'ice' },
      { name: '2500', ...years(2003), evType: 'ice' },
      { name: '3500', ...years(2003), evType: 'ice' },
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
      { name: 'Ascent', ...years(2019), evType: 'ice' },
      { name: 'Crosstrek', ...years(2013), evType: 'ice' },
      { name: 'Crosstrek Hybrid', ...years(2019, 2023), evType: 'hybrid' },
      { name: 'Forester', ...years(2003), evType: 'ice' },
      { name: 'Outback', ...years(2005), evType: 'ice' },
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
      { name: '4Runner', ...years(2003), evType: 'ice' },
      { name: 'bZ4X', ...years(2023), evType: 'ev' },
      { name: 'Camry', ...years(2002), evType: 'ice' },
      { name: 'Camry Hybrid', ...years(2007), evType: 'hybrid' },
      { name: 'Corolla', ...years(2003), evType: 'ice' },
      { name: 'Crown', ...years(2023), evType: 'hybrid' },
      { name: 'Grand Highlander Hybrid', ...years(2024), evType: 'hybrid' },
      { name: 'Highlander', ...years(2001), evType: 'ice' },
      { name: 'Highlander Hybrid', ...years(2006), evType: 'hybrid' },
      { name: 'Prius', ...years(2004), evType: 'hybrid' },
      { name: 'Prius Prime', ...years(2017), evType: 'hybrid' },
      { name: 'RAV4', ...years(2001), evType: 'ice' },
      { name: 'RAV4 Hybrid', ...years(2016), evType: 'hybrid' },
      { name: 'RAV4 Prime', ...years(2021), evType: 'hybrid' },
      { name: 'Sienna Hybrid', ...years(2021), evType: 'hybrid' },
      { name: 'Tacoma', ...years(2005), evType: 'ice' },
      { name: 'Tundra', ...years(2007), evType: 'ice' },
    ],
  },
  {
    name: 'Volkswagen',
    models: [
      { name: 'Atlas', ...years(2018), evType: 'ice' },
      { name: 'e-Golf', ...years(2015, 2020), evType: 'ev' },
      { name: 'ID. Buzz', ...years(2025), evType: 'ev' },
      { name: 'ID.4', ...years(2021), evType: 'ev' },
      { name: 'Jetta', ...years(2005), evType: 'ice' },
      { name: 'Tiguan', ...years(2009), evType: 'ice' },
    ],
  },
  {
    name: 'Volvo',
    models: [
      { name: 'C40 Recharge', ...years(2022, 2024), evType: 'ev' },
      { name: 'EX30', ...years(2025), evType: 'ev' },
      { name: 'EX90', ...years(2025), evType: 'ev' },
      { name: 'S60', ...years(2011), evType: 'ice' },
      { name: 'XC40 Recharge', ...years(2021), evType: 'ev' },
      { name: 'XC60', ...years(2009), evType: 'ice' },
      { name: 'XC60 Recharge', ...years(2018), evType: 'hybrid' },
      { name: 'XC90', ...years(2003), evType: 'ice' },
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
