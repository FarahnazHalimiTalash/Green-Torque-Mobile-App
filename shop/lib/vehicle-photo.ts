import type { EvType, Vehicle } from "./types";

/**
 * Exact make|model studio assets under /vehicles/{slug}.jpg
 * Never falls back to a different brand.
 */

const BODY_ALIASES: Record<string, string> = {
  "kia|sportage hybrid": "kia|sportage",
  "kia|sportage plug-in hybrid": "kia|sportage",
  "kia|sorento hybrid": "kia|sorento",
  "kia|sorento plug-in hybrid": "kia|sorento",
  "kia|niro hybrid": "kia|niro ev",
  "kia|niro plug-in hybrid": "kia|niro ev",
  "kia|carnival hybrid": "kia|carnival",
  "hyundai|tucson hybrid": "hyundai|tucson",
  "hyundai|tucson plug-in hybrid": "hyundai|tucson",
  "hyundai|santa fe hybrid": "hyundai|santa fe",
  "hyundai|kona electric": "hyundai|kona",
  "toyota|camry hybrid": "toyota|camry",
  "toyota|rav4 hybrid": "toyota|rav4",
  "toyota|rav4 prime": "toyota|rav4",
  "toyota|highlander hybrid": "toyota|highlander",
  "toyota|grand highlander hybrid": "toyota|highlander",
  "honda|accord hybrid": "honda|accord",
  "honda|civic hybrid": "honda|civic",
  "honda|cr-v hybrid": "honda|cr-v",
  "ford|escape hybrid": "ford|escape",
  "ford|escape plug-in hybrid": "ford|escape",
  "ford|explorer hybrid": "ford|explorer",
  "ford|maverick hybrid": "ford|maverick",
  "jeep|grand cherokee 4xe": "jeep|grand cherokee",
  "jeep|wrangler 4xe": "jeep|wrangler",
  "chrysler|pacifica hybrid": "chrysler|pacifica",
  "bmw|x5 phev": "bmw|x5",
  "bmw|330e": "bmw|3 series",
  "lexus|es 300h": "lexus|es 350",
  "lexus|nx 350h": "lexus|nx 350",
  "lexus|nx 450h+": "lexus|nx 350",
  "lexus|rx 350h": "lexus|rx 350",
  "lexus|rx 450h+": "lexus|rx 350",
  "porsche|cayenne e-hybrid": "porsche|cayenne",
  "porsche|panamera e-hybrid": "porsche|macan",
  "mitsubishi|outlander phev": "mitsubishi|outlander",
  "mazda|cx-70 phev": "mazda|cx-50",
  "subaru|crosstrek hybrid": "subaru|crosstrek",
  "volvo|xc60 recharge": "volvo|xc60",
  "volvo|xc90 recharge": "volvo|xc90",
  "chevrolet|bolt euv": "chevrolet|bolt ev",
};

function keyPart(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function vehiclePhotoSlug(make: string, model: string): string {
  const key = `${keyPart(make)}|${keyPart(model)}`;
  const resolved = BODY_ALIASES[key] ?? key;
  const [resolvedMake, resolvedModel] = resolved.split("|");
  return `${resolvedMake}-${resolvedModel}`
    .replace(/\//g, "-")
    .replace(/\+/g, "plus")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function vehiclePhotoFor(make: string, model: string, _evType: EvType = "ice") {
  if (!make.trim() || !model.trim()) {
    return "/vehicles/studio-empty.jpg";
  }
  return `/vehicles/${vehiclePhotoSlug(make, model)}.jpg`;
}

export function resolveVehiclePhoto(vehicle: Pick<Vehicle, "make" | "model" | "evType" | "photoUrl">) {
  return vehiclePhotoFor(vehicle.make, vehicle.model, vehicle.evType);
}
