import type { EvType, Vehicle } from '@/types';

/** Wikimedia Commons photos named for the exact vehicle (verified). */
function commons(fileName: string) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=1200`;
}

/**
 * Stock photos keyed by "make|model" (lowercase).
 * Every URL points at a Commons/Unsplash file of that specific model — not a random car.
 */
const MODEL_PHOTOS: Record<string, string> = {
  // Confirmed Tesla Model 3 (same image used on the accurate demo card)
  'tesla|model 3':
    'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80',
  'tesla|model y': commons('23 Tesla Model Y Long Range.jpg'),
  'tesla|model s': commons('Tesla Model S 2024 Blue.jpg'),
  'tesla|model x': commons('23 Tesla Model X Plaid.jpg'),
  'cadillac|escalade': commons('25 Cadillac Escalade Sport Platinum.jpg'),
  'cadillac|escalade iq': commons('25 Cadillac Escalade IQ Luxury 1.jpg'),
  'cadillac|lyriq': commons('2023 Cadillac Lyriq in Satin Steel Metallic, front left.jpg'),
  'cadillac|optiq': commons('25 Cadillac Optiq Luxury 2.jpg'),
  'cadillac|xt5': commons('23 Cadillac XT5 Premium Luxury.jpg'),
  'genesis|gv60': commons('24 Genesis GV60 Standard.jpg'),
  // Street photo of Integra only — no show crowds / people in frame
  'acura|integra': commons('2023 Acura Integra A-Spec, front 12.29.22.jpg'),
  'toyota|prius': commons('2023 Toyota Prius HEV front view.jpg'),
  'toyota|prius prime': commons('Toyota Prius Plug-in Hybrid (MSP17).jpg'),
  'ford|mustang mach-e': commons('21 Ford Mustang Mach-E Premium.jpg'),
  'chevrolet|bolt ev': commons('21 Chevrolet Bolt EV LT.jpg'),
  'chevrolet|bolt euv': commons('23 Chevrolet Bolt EUV Premier.jpg'),
  'bmw|i4': commons('23 BMW i4 eDrive40.jpg'),
  'hyundai|ioniq 5': commons('26 Hyundai Ioniq 5 Limited.jpg'),
  'kia|ev6': commons('22 Kia EV6 Wind.jpg'),
  'porsche|taycan': commons('22 Porsche Taycan Base.jpg'),
  'rivian|r1t': commons('22 Rivian R1T Adventure.jpg'),
  'rivian|r1s': commons('23 Rivian R1S Launch Edition.jpg'),
};

/** Same-brand fallback only (never cross-brand). */
const MAKE_PHOTOS: Record<string, string> = {
  tesla: MODEL_PHOTOS['tesla|model 3'],
  cadillac: MODEL_PHOTOS['cadillac|escalade'],
  genesis: MODEL_PHOTOS['genesis|gv60'],
  acura: MODEL_PHOTOS['acura|integra'],
  toyota: MODEL_PHOTOS['toyota|prius'],
  ford: MODEL_PHOTOS['ford|mustang mach-e'],
  chevrolet: MODEL_PHOTOS['chevrolet|bolt ev'],
  bmw: MODEL_PHOTOS['bmw|i4'],
  hyundai: MODEL_PHOTOS['hyundai|ioniq 5'],
  kia: MODEL_PHOTOS['kia|ev6'],
  porsche: MODEL_PHOTOS['porsche|taycan'],
  rivian: MODEL_PHOTOS['rivian|r1t'],
};

const TYPE_PHOTOS: Record<EvType, string> = {
  ev: MODEL_PHOTOS['tesla|model 3'],
  hybrid: MODEL_PHOTOS['toyota|prius'],
  ice: MODEL_PHOTOS['cadillac|escalade'],
};

function keyPart(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function vehiclePhotoFor(make: string, model: string, evType: EvType = 'ice') {
  const modelKey = `${keyPart(make)}|${keyPart(model)}`;
  return (
    MODEL_PHOTOS[modelKey] ??
    MAKE_PHOTOS[keyPart(make)] ??
    TYPE_PHOTOS[evType] ??
    TYPE_PHOTOS.ice
  );
}

/**
 * Always resolve from make/model so the card matches the selected vehicle.
 * Ignores stale/wrong saved photoUrl values from earlier mappings.
 */
export function resolveVehiclePhoto(vehicle: Pick<Vehicle, 'make' | 'model' | 'evType' | 'photoUrl'>) {
  return vehiclePhotoFor(vehicle.make, vehicle.model, vehicle.evType);
}
