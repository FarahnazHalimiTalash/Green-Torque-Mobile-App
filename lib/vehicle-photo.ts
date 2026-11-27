import { SHOP_API_URL } from '@/lib/shop-api';
import type { EvType, Vehicle } from '@/types';
import type { ImageSourcePropType } from 'react-native';

/**
 * Exact make|model → studio asset slug.
 * Never falls back to a different brand (Polestar must never show Tesla).
 */

const BODY_ALIASES: Record<string, string> = {
  'kia|sportage hybrid': 'kia|sportage',
  'kia|sportage plug-in hybrid': 'kia|sportage',
  'kia|sorento hybrid': 'kia|sorento',
  'kia|sorento plug-in hybrid': 'kia|sorento',
  'kia|niro hybrid': 'kia|niro ev',
  'kia|niro plug-in hybrid': 'kia|niro ev',
  'kia|carnival hybrid': 'kia|carnival',
  'hyundai|tucson hybrid': 'hyundai|tucson',
  'hyundai|tucson plug-in hybrid': 'hyundai|tucson',
  'hyundai|santa fe hybrid': 'hyundai|santa fe',
  'hyundai|kona electric': 'hyundai|kona',
  'toyota|camry hybrid': 'toyota|camry',
  'toyota|rav4 hybrid': 'toyota|rav4',
  'toyota|rav4 prime': 'toyota|rav4',
  'toyota|highlander hybrid': 'toyota|highlander',
  'toyota|grand highlander hybrid': 'toyota|highlander',
  'honda|accord hybrid': 'honda|accord',
  'honda|civic hybrid': 'honda|civic',
  'honda|cr-v hybrid': 'honda|cr-v',
  'ford|escape hybrid': 'ford|escape',
  'ford|escape plug-in hybrid': 'ford|escape',
  'ford|explorer hybrid': 'ford|explorer',
  'ford|maverick hybrid': 'ford|maverick',
  'jeep|grand cherokee 4xe': 'jeep|grand cherokee',
  'jeep|wrangler 4xe': 'jeep|wrangler',
  'chrysler|pacifica hybrid': 'chrysler|pacifica',
  'bmw|x5 phev': 'bmw|x5',
  'bmw|330e': 'bmw|3 series',
  'lexus|es 300h': 'lexus|es 350',
  'lexus|nx 350h': 'lexus|nx 350',
  'lexus|nx 450h+': 'lexus|nx 350',
  'lexus|rx 350h': 'lexus|rx 350',
  'lexus|rx 450h+': 'lexus|rx 350',
  'porsche|cayenne e-hybrid': 'porsche|cayenne',
  'porsche|panamera e-hybrid': 'porsche|macan',
  'mitsubishi|outlander phev': 'mitsubishi|outlander',
  'mazda|cx-70 phev': 'mazda|cx-50',
  'subaru|crosstrek hybrid': 'subaru|crosstrek',
  'volvo|xc60 recharge': 'volvo|xc60',
  'volvo|xc90 recharge': 'volvo|xc90',
  'chevrolet|bolt euv': 'chevrolet|bolt ev',
};

/** Bundled studio shots kept as instant offline fallbacks for popular models. */
const BUNDLED: Record<string, ImageSourcePropType> = {
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
  'polestar|2': require('../assets/vehicles/polestar-2.jpg'),
  'polestar|3': require('../assets/vehicles/polestar-3.jpg'),
  'polestar|4': require('../assets/vehicles/polestar-4.jpg'),
};

const EMPTY_STUDIO: ImageSourcePropType = {
  uri: `${SHOP_API_URL}/vehicles/studio-empty.jpg`,
};

function keyPart(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function vehiclePhotoSlug(make: string, model: string): string {
  const key = `${keyPart(make)}|${keyPart(model)}`;
  const resolved = BODY_ALIASES[key] ?? key;
  const [resolvedMake, resolvedModel] = resolved.split('|');
  return `${resolvedMake}-${resolvedModel}`
    .replace(/\//g, '-')
    .replace(/\+/g, 'plus')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function photoUri(slug: string): ImageSourcePropType {
  return { uri: `${SHOP_API_URL}/vehicles/${slug}.jpg` };
}

export function vehiclePhotoFor(make: string, model: string, _evType: EvType = 'ice'): ImageSourcePropType {
  const key = `${keyPart(make)}|${keyPart(model)}`;
  const resolved = BODY_ALIASES[key] ?? key;

  if (BUNDLED[resolved]) return BUNDLED[resolved];
  if (BUNDLED[key]) return BUNDLED[key];

  // Exact model URI from the studio library — never a different brand.
  if (make.trim() && model.trim()) {
    return photoUri(vehiclePhotoSlug(make, model));
  }

  return EMPTY_STUDIO;
}

/** Always resolve from make/model so the card matches the selected vehicle. */
export function resolveVehiclePhoto(
  vehicle: Pick<Vehicle, 'make' | 'model' | 'evType' | 'photoUrl'>,
): ImageSourcePropType {
  return vehiclePhotoFor(vehicle.make, vehicle.model, vehicle.evType);
}
