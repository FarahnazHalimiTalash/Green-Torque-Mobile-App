import type { EvType, Vehicle } from "./types";

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

const MODEL_PHOTOS: Record<string, string> = {
  "tesla|model 3": unsplash("photo-1560958089-b8a1929cea89"),
  "tesla|model y": unsplash("photo-1617788138017-80ad40651399"),
  "tesla|model s": unsplash("photo-1536700503339-1e4b06520771"),
  "tesla|model x": unsplash("photo-1617704548623-340376564e68"),
  "cadillac|escalade": unsplash("photo-1617531653332-bd46c24f2068"),
  "cadillac|escalade iq": unsplash("photo-1617531653332-bd46c24f2068"),
  "cadillac|lyriq": unsplash("photo-1617469767053-d3b523a0b982"),
  "cadillac|optiq": unsplash("photo-1617469767053-d3b523a0b982"),
  "cadillac|xt5": unsplash("photo-1606664515524-ed2f786a0bd6"),
  "genesis|gv60": unsplash("photo-1617814076367-b759c7d7e738"),
  "genesis|gv70": unsplash("photo-1617814076367-b759c7d7e738"),
  "genesis|electrified gv70": unsplash("photo-1617814076367-b759c7d7e738"),
  "toyota|prius": unsplash("photo-1621007947382-bb3c3994e3fb"),
};

const MAKE_PHOTOS: Record<string, string> = {
  tesla: unsplash("photo-1560958089-b8a1929cea89"),
  cadillac: unsplash("photo-1617531653332-bd46c24f2068"),
  genesis: unsplash("photo-1617814076367-b759c7d7e738"),
  toyota: unsplash("photo-1621007947382-bb3c3994e3fb"),
};

const TYPE_PHOTOS: Record<EvType, string> = {
  ev: unsplash("photo-1593941707881-a5bcdf7b8d49"),
  hybrid: unsplash("photo-1621007947382-bb3c3994e3fb"),
  ice: unsplash("photo-1494976388531-d1058494cdd8"),
};

function keyPart(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function vehiclePhotoFor(make: string, model: string, evType: EvType = "ice") {
  const modelKey = `${keyPart(make)}|${keyPart(model)}`;
  return MODEL_PHOTOS[modelKey] ?? MAKE_PHOTOS[keyPart(make)] ?? TYPE_PHOTOS[evType] ?? TYPE_PHOTOS.ice;
}

export function resolveVehiclePhoto(vehicle: Pick<Vehicle, "make" | "model" | "evType" | "photoUrl">) {
  return vehicle.photoUrl?.trim() || vehiclePhotoFor(vehicle.make, vehicle.model, vehicle.evType);
}
