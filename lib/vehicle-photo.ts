import type { EvType, Vehicle } from '@/types';

const UNSplash = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

/** Stock photos keyed by "make|model" (lowercase). */
const MODEL_PHOTOS: Record<string, string> = {
  'tesla|model 3': UNSplash('photo-1560958089-b8a1929cea89'),
  'tesla|model y': UNSplash('photo-1617788138017-80ad40651399'),
  'tesla|model s': UNSplash('photo-1536700503339-1e4b06520771'),
  'tesla|model x': UNSplash('photo-1617704548623-340376564e68'),
  'cadillac|escalade': UNSplash('photo-1617531653332-bd46c24f2068'),
  'cadillac|escalade iq': UNSplash('photo-1617531653332-bd46c24f2068'),
  'cadillac|lyriq': UNSplash('photo-1617469767053-d3b523a0b982'),
  'cadillac|optiq': UNSplash('photo-1617469767053-d3b523a0b982'),
  'cadillac|xt5': UNSplash('photo-1606664515524-ed2f786a0bd6'),
  'genesis|gv60': UNSplash('photo-1617814076367-b759c7d7e738'),
  'genesis|gv70': UNSplash('photo-1617814076367-b759c7d7e738'),
  'genesis|electrified gv70': UNSplash('photo-1617814076367-b759c7d7e738'),
  'toyota|prius': UNSplash('photo-1621007947382-bb3c3994e3fb'),
  'toyota|rav4': UNSplash('photo-1621007947382-bb3c3994e3fb'),
  'toyota|camry': UNSplash('photo-1621007947382-bb3c3994e3fb'),
  'ford|mustang mach-e': UNSplash('photo-1612825173281-9a193378527e'),
  'ford|f-150 lightning': UNSplash('photo-1605893477799-b99e3b8b93c2'),
  'chevrolet|bolt ev': UNSplash('photo-1552519507-da3b142c6e3d'),
  'chevrolet|bolt euv': UNSplash('photo-1552519507-da3b142c6e3d'),
  'chevrolet|equinox ev': UNSplash('photo-1494976388531-d1058494cdd8'),
  'bmw|i4': UNSplash('photo-1555215695-3004980ad094'),
  'bmw|ix': UNSplash('photo-1555215695-3004980ad094'),
  'bmw|i3': UNSplash('photo-1555215695-3004980ad094'),
  'audi|e-tron / q8 e-tron': UNSplash('photo-1606664515524-ed2f786a0bd6'),
  'audi|q4 e-tron': UNSplash('photo-1606664515524-ed2f786a0bd6'),
  'rivian|r1t': UNSplash('photo-1612825173281-9a193378527e'),
  'rivian|r1s': UNSplash('photo-1612825173281-9a193378527e'),
  'hyundai|ioniq 5': UNSplash('photo-1617814076367-b759c7d7e738'),
  'hyundai|ioniq 6': UNSplash('photo-1617814076367-b759c7d7e738'),
  'kia|ev6': UNSplash('photo-1617814076367-b759c7d7e738'),
  'kia|ev9': UNSplash('photo-1617814076367-b759c7d7e738'),
  'porsche|taycan': UNSplash('photo-1503376780353-7e6692767b70'),
  'mercedes-benz|eqs': UNSplash('photo-1618843479313-40f8afb4b4d8'),
  'mercedes-benz|eqe': UNSplash('photo-1618843479313-40f8afb4b4d8'),
};

const MAKE_PHOTOS: Record<string, string> = {
  tesla: UNSplash('photo-1560958089-b8a1929cea89'),
  cadillac: UNSplash('photo-1617531653332-bd46c24f2068'),
  genesis: UNSplash('photo-1617814076367-b759c7d7e738'),
  toyota: UNSplash('photo-1621007947382-bb3c3994e3fb'),
  ford: UNSplash('photo-1494976388531-d1058494cdd8'),
  chevrolet: UNSplash('photo-1552519507-da3b142c6e3d'),
  bmw: UNSplash('photo-1555215695-3004980ad094'),
  audi: UNSplash('photo-1606664515524-ed2f786a0bd6'),
  hyundai: UNSplash('photo-1617814076367-b759c7d7e738'),
  kia: UNSplash('photo-1617814076367-b759c7d7e738'),
  porsche: UNSplash('photo-1503376780353-7e6692767b70'),
  'mercedes-benz': UNSplash('photo-1618843479313-40f8afb4b4d8'),
  rivian: UNSplash('photo-1612825173281-9a193378527e'),
  honda: UNSplash('photo-1617531651650-b16e1affe645'),
  lexus: UNSplash('photo-1617531651650-b16e1affe645'),
  nissan: UNSplash('photo-1609521263047-f8f205293f24'),
  volkswagen: UNSplash('photo-1609521263047-f8f205293f24'),
};

const TYPE_PHOTOS: Record<EvType, string> = {
  ev: UNSplash('photo-1593941707881-a5bcdf7b8d49'),
  hybrid: UNSplash('photo-1621007947382-bb3c3994e3fb'),
  ice: UNSplash('photo-1494976388531-d1058494cdd8'),
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

/** Prefer a saved photo; otherwise resolve a stock image for the make/model. */
export function resolveVehiclePhoto(vehicle: Pick<Vehicle, 'make' | 'model' | 'evType' | 'photoUrl'>) {
  return vehicle.photoUrl?.trim() || vehiclePhotoFor(vehicle.make, vehicle.model, vehicle.evType);
}
