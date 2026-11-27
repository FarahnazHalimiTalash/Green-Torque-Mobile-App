import type { EvType, Vehicle } from '@/types';
import type { ImageSourcePropType } from 'react-native';

/**
 * Bundled premium vehicle photos (light-polished, brochure framing).
 * Prefer local studio assets so cards stay sharp offline and consistent.
 */
const MODEL_PHOTOS: Record<string, ImageSourcePropType> = {
  'tesla|model 3': require('../assets/vehicles/model3.jpg'),
  'tesla|model y': require('../assets/vehicles/model-y.jpg'),
  'tesla|model s': require('../assets/vehicles/model-s.jpg'),
  'tesla|model x': require('../assets/vehicles/model-x.jpg'),
  'cadillac|escalade': require('../assets/vehicles/escalade.jpg'),
  'cadillac|escalade iq': require('../assets/vehicles/escalade-iq.jpg'),
  'cadillac|lyriq': require('../assets/vehicles/lyriq.jpg'),
  'cadillac|optiq': require('../assets/vehicles/optiq.jpg'),
  'cadillac|xt5': require('../assets/vehicles/xt5.jpg'),
  'genesis|gv60': require('../assets/vehicles/gv60.jpg'),
  'acura|integra': require('../assets/vehicles/integra.jpg'),
  'toyota|prius': require('../assets/vehicles/prius.jpg'),
  'toyota|prius prime': require('../assets/vehicles/prius-prime.jpg'),
  'ford|mustang mach-e': require('../assets/vehicles/mach-e.jpg'),
  'chevrolet|bolt ev': require('../assets/vehicles/bolt-ev.jpg'),
  'chevrolet|bolt euv': require('../assets/vehicles/bolt-euv.jpg'),
  'bmw|i4': require('../assets/vehicles/i4.jpg'),
  'hyundai|ioniq 5': require('../assets/vehicles/ioniq5.jpg'),
  'kia|ev6': require('../assets/vehicles/ev6.jpg'),
  'porsche|taycan': require('../assets/vehicles/taycan.jpg'),
  'rivian|r1t': require('../assets/vehicles/r1t.jpg'),
  'rivian|r1s': require('../assets/vehicles/r1s.jpg'),
};

const MAKE_PHOTOS: Record<string, ImageSourcePropType> = {
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

const TYPE_PHOTOS: Record<EvType, ImageSourcePropType> = {
  ev: MODEL_PHOTOS['tesla|model 3'],
  hybrid: MODEL_PHOTOS['toyota|prius'],
  ice: MODEL_PHOTOS['cadillac|escalade'],
};

function keyPart(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function vehiclePhotoFor(make: string, model: string, evType: EvType = 'ice'): ImageSourcePropType {
  const modelKey = `${keyPart(make)}|${keyPart(model)}`;
  return (
    MODEL_PHOTOS[modelKey] ??
    MAKE_PHOTOS[keyPart(make)] ??
    TYPE_PHOTOS[evType] ??
    TYPE_PHOTOS.ice
  );
}

/** Always resolve from make/model so the card matches the selected vehicle. */
export function resolveVehiclePhoto(
  vehicle: Pick<Vehicle, 'make' | 'model' | 'evType' | 'photoUrl'>,
): ImageSourcePropType {
  return vehiclePhotoFor(vehicle.make, vehicle.model, vehicle.evType);
}
