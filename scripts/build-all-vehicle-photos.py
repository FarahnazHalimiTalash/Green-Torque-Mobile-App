"""
Build a studio photo for every catalog make/model.
- Prefer HJUdall dealer studio shots (crop only — already clean showroom).
- Otherwise rembg-cutout onto the Escalade studio plate.
- Never substitutes a different brand.
"""

from __future__ import annotations

import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "lib" / "vehicle-catalog.ts"
ASSET_DIR = ROOT / "assets" / "vehicles"
PUBLIC_DIR = ROOT / "shop" / "public" / "vehicles"
MANIFEST = ROOT / "scripts" / "vehicle-photo-manifest.json"
OUT_W, OUT_H = 1400, 820

SESSION = new_session("u2net")
UA = {"User-Agent": "GreenTorquePhotoBot/1.0 (local app asset build)"}

OVERRIDES: dict[str, str] = {
    "tesla|model 3": "24 Tesla Model 3 Base.jpg",
    "tesla|model y": "23 Tesla Model Y Long Range.jpg",
    "tesla|model s": "Tesla Model S 2024 Blue.jpg",
    "tesla|model x": "23 Tesla Model X Plaid.jpg",
    "tesla|cybertruck": "Tesla Cybertruck.jpg",
    "cadillac|escalade": "25 Cadillac Escalade Sport Platinum.jpg",
    "cadillac|escalade iq": "25 Cadillac Escalade IQ Luxury 1.jpg",
    "cadillac|lyriq": "2023 Cadillac Lyriq in Satin Steel Metallic, front left.jpg",
    "cadillac|optiq": "25 Cadillac Optiq Luxury 2.jpg",
    "cadillac|xt5": "23 Cadillac XT5 Premium Luxury.jpg",
    "polestar|2": "Polestar 2 Genf 2019 1Y7A6000.jpg",
    "polestar|3": "Polestar 3 IAA 2023 1X7A0703.jpg",
    "polestar|4": "Polestar 4 Auto Zuerich 2024 DSC 6364.jpg",
    "genesis|gv60": "24 Genesis GV60 Standard.jpg",
    "acura|integra": "2023 Acura Integra A-Spec, front 12.29.22.jpg",
    "toyota|prius": "2023 Toyota Prius HEV front view.jpg",
    "toyota|prius prime": "Toyota Prius Plug-in Hybrid (MSP17).jpg",
    "ford|mustang mach-e": "21 Ford Mustang Mach-E Premium.jpg",
    "ford|f-150 lightning": "23 Ford F-150 Lightning Lariat.jpg",
    "chevrolet|bolt ev": "21 Chevrolet Bolt EV LT.jpg",
    "chevrolet|bolt euv": "23 Chevrolet Bolt EUV Premier.jpg",
    "chevrolet|blazer ev": "24 Chevrolet Blazer EV RS.jpg",
    "bmw|i4": "23 BMW i4 eDrive40.jpg",
    "hyundai|ioniq 5": "26 Hyundai Ioniq 5 Limited.jpg",
    "hyundai|ioniq 6": "23 Hyundai Ioniq 6 Limited.jpg",
    "hyundai|ioniq 9": "26 Hyundai Ioniq 9 Limited.jpg",
    "kia|ev6": "22 Kia EV6 Wind.jpg",
    "porsche|taycan": "22 Porsche Taycan Base.jpg",
    "rivian|r1t": "22 Rivian R1T Adventure.jpg",
    "rivian|r1s": "23 Rivian R1S Launch Edition.jpg",
}

# Same body with powertrain badge — share photo within make only.
BODY_ALIASES: dict[str, str] = {
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
}


def key_part(value: str) -> str:
    return value.strip().lower().replace("\u00a0", " ")


def slug_for(make: str, model: str) -> str:
    raw = f"{key_part(make)}-{key_part(model)}"
    raw = raw.replace("/", "-").replace("+", "plus")
    return re.sub(r"[^a-z0-9]+", "-", raw).strip("-")


def parse_catalog() -> list[tuple[str, str]]:
    text = CATALOG.read_text(encoding="utf-8")
    blocks = re.findall(r"name: '([^']+)',\s*models: \[(.*?)\],", text, re.S)
    pairs: list[tuple[str, str]] = []
    for make, body in blocks:
        for model in re.findall(r"name: '([^']+)'", body):
            pairs.append((make, model))
    return pairs


def http_json(url: str) -> dict:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=40) as resp:
        return json.loads(resp.read().decode("utf-8"))


def is_studio_native(file_name: str, snippet: str = "") -> bool:
    blob = f"{file_name} {snippet}".lower()
    return "hjudall" in blob or "shot at" in blob


def search_commons(make: str, model: str) -> tuple[str, bool] | None:
    simple = re.sub(
        r"\b(hybrid|plug-?in|phev|electric|recharge|electrified|4xe)\b",
        "",
        model,
        flags=re.I,
    )
    simple = re.sub(r"\s+", " ", simple).strip(" -/")
    queries = [
        f'"{make}" "{model}" HJUdall',
        f"{make} {model} HJUdall",
        f'"{make}" "{simple}" HJUdall' if simple and simple.lower() != model.lower() else "",
        f'"{make}" "{model}"',
        f"{make} {model}",
        f'"{make}" "{simple}"' if simple and simple.lower() != model.lower() else "",
    ]
    make_token = key_part(make).split("-")[0]
    model_tokens = [t for t in re.split(r"[^a-z0-9]+", key_part(model)) if len(t) > 1]

    for q in queries:
        if not q:
            continue
        url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(
            {
                "action": "query",
                "list": "search",
                "srsearch": q,
                "srnamespace": 6,
                "srlimit": 12,
                "format": "json",
            }
        )
        try:
            data = http_json(url)
        except Exception:
            continue
        ranked: list[tuple[int, str, bool]] = []
        for hit in data.get("query", {}).get("search", []):
            title = hit.get("title", "")
            if not title.startswith("File:"):
                continue
            name = title[5:]
            low = name.lower()
            snippet = hit.get("snippet", "")
            if any(
                bad in low
                for bad in (
                    "interior",
                    "engine",
                    "badge",
                    "logo",
                    "dashboard",
                    "seat",
                    "frunk",
                    "trunk",
                    "wheel",
                    "detail",
                )
            ):
                continue
            if not (low.endswith(".jpg") or low.endswith(".jpeg") or low.endswith(".png")):
                continue
            score = 0
            native = is_studio_native(name, snippet)
            if native:
                score += 60
            if make_token and make_token in low:
                score += 25
            matched_model = sum(1 for t in model_tokens if t in low)
            score += matched_model * 18
            # Keep strong make+studio hits even if model token is awkward (e.g. "3 Series")
            if matched_model == 0 and model_tokens and not native:
                continue
            if matched_model == 0 and model_tokens and native:
                # require at least one meaningful token or digit from model in filename
                if not any(t in low for t in model_tokens if len(t) > 2 or t.isdigit()):
                    continue
            ranked.append((score, name, native))
        ranked.sort(reverse=True)
        if ranked and ranked[0][0] >= 30:
            return ranked[0][1], ranked[0][2]
        time.sleep(0.35)
    return None


def download_commons(file_name: str, dest: Path) -> bool:
    url = (
        "https://commons.wikimedia.org/wiki/Special:FilePath/"
        + urllib.parse.quote(file_name)
        + "?width=1600"
    )
    for attempt in range(6):
        req = urllib.request.Request(url, headers=UA)
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                dest.write_bytes(resp.read())
            return dest.stat().st_size > 10_000
        except Exception as exc:
            msg = str(exc)
            if "429" in msg or "503" in msg:
                wait = 20 * (attempt + 1)
                print(f"  rate limited, sleep {wait}s…")
                time.sleep(wait)
                continue
            print(f"  download fail {file_name}: {exc}")
            return False
    print(f"  download fail {file_name}: still rate limited")
    return False


def cutout(img: Image.Image) -> Image.Image:
    return remove(img.convert("RGB"), session=SESSION)


def empty_studio_from_reference(ref: Image.Image) -> Image.Image:
    rgba = cutout(ref)
    alpha = rgba.split()[-1]
    mask = alpha.point(lambda a: 255 if a > 20 else 0).filter(ImageFilter.MaxFilter(15))
    base = ref.convert("RGB")
    px = base.load()
    m = mask.load()
    w, h = base.size
    for y in range(h):
        valid_x = [x for x in range(w) if m[x, y] == 0]
        if not valid_x:
            continue
        for x in range(w):
            if m[x, y] == 0:
                continue
            left = max((vx for vx in valid_x if vx <= x), default=valid_x[0])
            right = min((vx for vx in valid_x if vx >= x), default=valid_x[-1])
            if left == right:
                px[x, y] = px[left, y]
            else:
                t = (x - left) / max(1, right - left)
                lc = px[left, y]
                rc = px[right, y]
                px[x, y] = tuple(int(lc[i] * (1 - t) + rc[i] * t) for i in range(3))
    blurred = base.filter(ImageFilter.GaussianBlur(radius=6))
    return Image.composite(blurred, base, mask.filter(ImageFilter.GaussianBlur(4)))


def fit_cutout(cut: Image.Image, max_w: int, max_h: int) -> Image.Image:
    cut = cut.convert("RGBA")
    bbox = cut.getbbox()
    if bbox:
        cut = cut.crop(bbox)
    scale = min(max_w / cut.width, max_h / cut.height)
    new_size = (max(1, int(cut.width * scale)), max(1, int(cut.height * scale)))
    return cut.resize(new_size, Image.Resampling.LANCZOS)


def soft_shadow(width: int, height: int) -> Image.Image:
    shadow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)
    draw.ellipse((0, 0, width - 1, height - 1), fill=(15, 25, 20, 90))
    return shadow.filter(ImageFilter.GaussianBlur(radius=18))


def cover_crop(img: Image.Image) -> Image.Image:
    img = img.convert("RGB")
    scale = max(OUT_W / img.width, OUT_H / img.height)
    resized = img.resize((int(img.width * scale), int(img.height * scale)), Image.Resampling.LANCZOS)
    left = (resized.width - OUT_W) // 2
    top = max(0, (resized.height - OUT_H) // 2 - int(OUT_H * 0.04))
    cropped = resized.crop((left, top, left + OUT_W, top + OUT_H))
    cropped = ImageEnhance.Contrast(cropped).enhance(1.03)
    cropped = ImageEnhance.Sharpness(cropped).enhance(1.05)
    return cropped


def studioize_cutout(src: Path, plate: Image.Image) -> Image.Image:
    original = Image.open(src).convert("RGB")
    max_side = 1200
    if max(original.size) > max_side:
        scale = max_side / max(original.size)
        original = original.resize(
            (int(original.width * scale), int(original.height * scale)),
            Image.Resampling.LANCZOS,
        )
    cut = fit_cutout(cutout(original), int(OUT_W * 0.92), int(OUT_H * 0.78))
    canvas = plate.resize((OUT_W, OUT_H), Image.Resampling.LANCZOS).convert("RGBA")
    x = (OUT_W - cut.width) // 2
    y = OUT_H - cut.height - int(OUT_H * 0.06)
    sw, sh = int(cut.width * 0.78), max(28, int(cut.height * 0.08))
    shadow = soft_shadow(sw, sh)
    sx = x + (cut.width - sw) // 2
    sy = y + cut.height - int(sh * 0.55)
    canvas.alpha_composite(shadow, (sx, sy))
    canvas.alpha_composite(cut, (x, y))
    out = canvas.convert("RGB")
    out = ImageEnhance.Contrast(out).enhance(1.04)
    out = ImageEnhance.Sharpness(out).enhance(1.06)
    return out


def save_both(img: Image.Image, slug: str) -> None:
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    path = ASSET_DIR / f"{slug}.jpg"
    img.save(path, quality=90, optimize=True)
    (PUBLIC_DIR / f"{slug}.jpg").write_bytes(path.read_bytes())


def resolve_source_key(make: str, model: str) -> str:
    key = f"{key_part(make)}|{key_part(model)}"
    return BODY_ALIASES.get(key, key)


def main() -> None:
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

    plate_path = ASSET_DIR / "_studio-plate.jpg"
    if plate_path.exists():
        plate = Image.open(plate_path)
        print("Using cached studio plate")
    else:
        print("Building studio plate…")
        plate = empty_studio_from_reference(Image.open(ASSET_DIR / "escalade.jpg"))
        plate.convert("RGB").save(plate_path, quality=92)
        empty = plate.convert("RGB")
        empty.save(ASSET_DIR / "studio-empty.jpg", quality=92)
        empty.save(PUBLIC_DIR / "studio-empty.jpg", quality=92)

    if not (PUBLIC_DIR / "studio-empty.jpg").exists():
        if plate_path.exists():
            Image.open(plate_path).convert("RGB").save(PUBLIC_DIR / "studio-empty.jpg", quality=92)
            Image.open(plate_path).convert("RGB").save(ASSET_DIR / "studio-empty.jpg", quality=92)

    pairs = parse_catalog()
    print(f"Catalog models: {len(pairs)}")

    legacy_short = {
        "tesla|model 3": "model3.jpg",
        "tesla|model y": "model-y.jpg",
        "tesla|model s": "model-s.jpg",
        "tesla|model x": "model-x.jpg",
        "cadillac|escalade": "escalade.jpg",
        "cadillac|escalade iq": "escalade-iq.jpg",
        "cadillac|lyriq": "lyriq.jpg",
        "cadillac|optiq": "optiq.jpg",
        "cadillac|xt5": "xt5.jpg",
        "genesis|gv60": "gv60.jpg",
        "acura|integra": "integra.jpg",
        "toyota|prius": "prius.jpg",
        "toyota|prius prime": "prius-prime.jpg",
        "ford|mustang mach-e": "mach-e.jpg",
        "chevrolet|bolt ev": "bolt-ev.jpg",
        "chevrolet|bolt euv": "bolt-euv.jpg",
        "bmw|i4": "i4.jpg",
        "hyundai|ioniq 5": "ioniq5.jpg",
        "kia|ev6": "ev6.jpg",
        "porsche|taycan": "taycan.jpg",
        "rivian|r1t": "r1t.jpg",
        "rivian|r1s": "r1s.jpg",
    }

    manifest: dict[str, dict] = {}
    if MANIFEST.exists():
        manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))

    for make, model in pairs:
        key = f"{key_part(make)}|{key_part(model)}"
        source_key = resolve_source_key(make, model)
        slug = slug_for(make, model)
        out_asset = ASSET_DIR / f"{slug}.jpg"
        out_public = PUBLIC_DIR / f"{slug}.jpg"

        if out_asset.exists() and out_public.exists() and key in manifest and manifest[key].get("via") not in (
            "miss",
            "download-fail",
        ):
            print(f"skip {key}")
            continue

        if source_key != key:
            parts = source_key.split("|", 1)
            twin_slug = slug_for(parts[0], parts[1])
            twin_path = ASSET_DIR / f"{twin_slug}.jpg"
            if twin_path.exists():
                data = twin_path.read_bytes()
                out_asset.write_bytes(data)
                out_public.write_bytes(data)
                manifest[key] = {"slug": slug, "source": source_key, "via": "alias"}
                print(f"alias {key} <- {source_key}")
                MANIFEST.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
                continue

        if source_key in legacy_short:
            legacy_path = ASSET_DIR / legacy_short[source_key]
            if legacy_path.exists():
                data = legacy_path.read_bytes()
                out_asset.write_bytes(data)
                out_public.write_bytes(data)
                manifest[key] = {"slug": slug, "source": legacy_short[source_key], "via": "legacy"}
                print(f"legacy {key}")
                MANIFEST.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
                continue

        file_name: str | None = OVERRIDES.get(source_key)
        native = bool(file_name and is_studio_native(file_name))

        if not file_name:
            found = search_commons(make, model if source_key == key else source_key.split("|", 1)[1])
            if found:
                file_name, native = found

        if not file_name:
            print(f"MISS {key}")
            manifest[key] = {"slug": slug, "source": None, "via": "miss"}
            MANIFEST.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
            continue

        raw = ASSET_DIR / f"_raw-{slug}.jpg"
        print(f"get {key} <- {file_name} ({'studio' if native else 'cutout'})")
        if not download_commons(file_name, raw):
            manifest[key] = {"slug": slug, "source": file_name, "via": "download-fail"}
            MANIFEST.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
            continue

        try:
            if native:
                img = cover_crop(Image.open(raw))
            else:
                img = studioize_cutout(raw, plate)
            save_both(img, slug)
            manifest[key] = {
                "slug": slug,
                "source": file_name,
                "via": "studio-native" if native else "studio-cutout",
            }
            print(f"  wrote {slug}.jpg")
        except Exception as exc:
            print(f"  fail {key}: {exc}")
            manifest[key] = {"slug": slug, "source": file_name, "via": f"fail:{exc}"}
        finally:
            if raw.exists():
                raw.unlink()

        MANIFEST.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
        time.sleep(1.25)

    ok = sum(
        1
        for v in manifest.values()
        if v.get("via") not in ("miss", "download-fail") and not str(v.get("via", "")).startswith("fail")
    )
    print(f"Done. Mapped {ok}/{len(pairs)}")


if __name__ == "__main__":
    main()
