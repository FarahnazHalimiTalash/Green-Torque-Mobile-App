import type { EvType, Vehicle } from "./types";

/** Local studio-plate photos (same set as the customer app). */
function local(fileName: string) {
  return `/vehicles/${fileName}`;
}

const MODEL_PHOTOS: Record<string, string> = {
  "tesla|model 3": local("model3.jpg"),
  "tesla|model y": local("model-y.jpg"),
  "tesla|model s": local("model-s.jpg"),
  "tesla|model x": local("model-x.jpg"),
  "cadillac|escalade": local("escalade.jpg"),
  "cadillac|escalade iq": local("escalade-iq.jpg"),
  "cadillac|lyriq": local("lyriq.jpg"),
  "cadillac|optiq": local("optiq.jpg"),
  "cadillac|xt5": local("xt5.jpg"),
  "genesis|gv60": local("gv60.jpg"),
  "acura|integra": local("integra.jpg"),
  "toyota|prius": local("prius.jpg"),
  "toyota|prius prime": local("prius-prime.jpg"),
  "ford|mustang mach-e": local("mach-e.jpg"),
  "chevrolet|bolt ev": local("bolt-ev.jpg"),
  "chevrolet|bolt euv": local("bolt-euv.jpg"),
  "bmw|i4": local("i4.jpg"),
  "hyundai|ioniq 5": local("ioniq5.jpg"),
  "kia|ev6": local("ev6.jpg"),
  "porsche|taycan": local("taycan.jpg"),
  "rivian|r1t": local("r1t.jpg"),
  "rivian|r1s": local("r1s.jpg"),
};

const MAKE_PHOTOS: Record<string, string> = {
  tesla: MODEL_PHOTOS["tesla|model 3"],
  cadillac: MODEL_PHOTOS["cadillac|escalade"],
  genesis: MODEL_PHOTOS["genesis|gv60"],
  acura: MODEL_PHOTOS["acura|integra"],
  toyota: MODEL_PHOTOS["toyota|prius"],
  ford: MODEL_PHOTOS["ford|mustang mach-e"],
  chevrolet: MODEL_PHOTOS["chevrolet|bolt ev"],
  bmw: MODEL_PHOTOS["bmw|i4"],
  hyundai: MODEL_PHOTOS["hyundai|ioniq 5"],
  kia: MODEL_PHOTOS["kia|ev6"],
  porsche: MODEL_PHOTOS["porsche|taycan"],
  rivian: MODEL_PHOTOS["rivian|r1t"],
};

const TYPE_PHOTOS: Record<EvType, string> = {
  ev: MODEL_PHOTOS["tesla|model 3"],
  hybrid: MODEL_PHOTOS["toyota|prius"],
  ice: MODEL_PHOTOS["cadillac|escalade"],
};

function keyPart(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function vehiclePhotoFor(make: string, model: string, evType: EvType = "ice") {
  const modelKey = `${keyPart(make)}|${keyPart(model)}`;
  return MODEL_PHOTOS[modelKey] ?? MAKE_PHOTOS[keyPart(make)] ?? TYPE_PHOTOS[evType] ?? TYPE_PHOTOS.ice;
}

export function resolveVehiclePhoto(vehicle: Pick<Vehicle, "make" | "model" | "evType" | "photoUrl">) {
  return vehiclePhotoFor(vehicle.make, vehicle.model, vehicle.evType);
}
