"""Fill catalog photo misses with curated Commons filenames + looser search."""

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
ASSET_DIR = ROOT / "assets" / "vehicles"
PUBLIC_DIR = ROOT / "shop" / "public" / "vehicles"
MANIFEST = ROOT / "scripts" / "vehicle-photo-manifest.json"
OUT_W, OUT_H = 1400, 820
SESSION = new_session("u2net")
UA = {"User-Agent": "GreenTorquePhotoBot/1.0 (local app asset build)"}

# Curated filenames known on Commons (HJUdall dealer studio preferred).
FILLS: dict[str, str] = {
    "bmw|i3": "19 BMW i3s.jpg",
    "bmw|i5": "BMW i5 IAA 2023 1X7A0598.jpg",
    "bmw|i7": "BMW i7 xDrive60 IAA 2023 1X7A0479.jpg",
    "bmw|ix": "BMW iX IAA 2021 1X7A0216.jpg",
    "bmw|x3": "24 BMW X3 xDrive30i.jpg",
    "bmw|x5": "24 BMW X5 xDrive40i.jpg",
    "chevrolet|blazer": "24 Chevrolet Blazer RS.jpg",
    "chevrolet|colorado": "24 Chevrolet Colorado LT.jpg",
    "chevrolet|equinox": "24 Chevrolet Equinox LT.jpg",
    "chevrolet|equinox ev": "24 Chevrolet Equinox EV LT.jpg",
    "chevrolet|malibu": "23 Chevrolet Malibu LT.jpg",
    "chevrolet|silverado": "24 Chevrolet Silverado 1500 LT.jpg",
    "chevrolet|silverado ev": "24 Chevrolet Silverado EV WT.jpg",
    "chevrolet|tahoe": "24 Chevrolet Tahoe LT.jpg",
    "chevrolet|traverse": "24 Chevrolet Traverse LT.jpg",
    "chevrolet|volt": "18 Chevrolet Volt Premier.jpg",
    "chrysler|pacifica": "24 Chrysler Pacifica Limited.jpg",
    "dodge|charger": "23 Dodge Charger SXT.jpg",
    "dodge|durango": "24 Dodge Durango GT.jpg",
    "dodge|hornet": "24 Dodge Hornet R/T.jpg",
    "ford|bronco": "24 Ford Bronco Outer Banks.jpg",
    "ford|escape": "24 Ford Escape ST-Line.jpg",
    "ford|explorer": "24 Ford Explorer XLT.jpg",
    "ford|f-150": "24 Ford F-150 XLT.jpg",
    "ford|f-150 lightning": "22 Ford F-150 Lightning Lariat.jpg",
    "ford|maverick": "24 Ford Maverick XLT.jpg",
    "ford|mustang": "24 Ford Mustang GT.jpg",
    "ford|ranger": "24 Ford Ranger XLT.jpg",
    "gmc|sierra": "24 GMC Sierra 1500 Elevation.jpg",
    "gmc|sierra ev": "GMC Sierra EV Denali Edition 1.jpg",
    "gmc|terrain": "24 GMC Terrain SLE.jpg",
    "gmc|yukon": "24 GMC Yukon SLT.jpg",
    "honda|accord": "24 Honda Accord EX-L.jpg",
    "honda|civic": "24 Honda Civic Sport.jpg",
    "honda|cr-v": "24 Honda CR-V EX-L.jpg",
    "honda|hr-v": "24 Honda HR-V EX-L.jpg",
    "honda|odyssey": "24 Honda Odyssey Elite.jpg",
    "honda|pilot": "24 Honda Pilot TrailSport.jpg",
    "honda|prologue": "24 Honda Prologue Touring.jpg",
    "hyundai|ioniq 6": "23 Hyundai Ioniq 6 SEL.jpg",
    "hyundai|ioniq 9": "26 Hyundai Ioniq 9 Limited.jpg",
    "lexus|es 350": "24 Lexus ES 350.jpg",
    "lexus|gx": "24 Lexus GX 550.jpg",
    "lexus|nx 350": "24 Lexus NX 350.jpg",
    "lexus|rx 350": "24 Lexus RX 350.jpg",
    "lexus|rz": "23 Lexus RZ 450e.jpg",
    "lexus|ux 250h": "24 Lexus UX 250h.jpg",
    "lucid|air": "Lucid Air Pure.jpg",
    "lucid|gravity": "Lucid Gravity Grand Touring IAA 2023 1X7A0198.jpg",
    "mazda|cx-5": "24 Mazda CX-5 Carbon Edition.jpg",
    "mazda|cx-50": "24 Mazda CX-50 Preferred.jpg",
    "mazda|cx-90 phev": "24 Mazda CX-90 PHEV Premium.jpg",
    "mazda|mazda3": "24 Mazda3 Sedan Preferred.jpg",
    "mercedes-benz|c-class": "24 Mercedes-Benz C-Class C 300.jpg",
    "mercedes-benz|e-class": "24 Mercedes-Benz E-Class E 350.jpg",
    "mercedes-benz|eqb": "23 Mercedes-Benz EQB 300.jpg",
    "mercedes-benz|eqe": "Mercedes-Benz EQE 350+ IAA 2023 1X7A0532.jpg",
    "mercedes-benz|eqe suv": "Mercedes-Benz EQE SUV IAA 2023 1X7A0544.jpg",
    "mercedes-benz|eqs": "Mercedes-Benz EQS 450+ IAA 2021 1X7A0257.jpg",
    "mercedes-benz|eqs suv": "Mercedes-Benz EQS SUV IAA 2023 1X7A0556.jpg",
    "mercedes-benz|glc": "24 Mercedes-Benz GLC 300.jpg",
    "mercedes-benz|gle": "24 Mercedes-Benz GLE 350.jpg",
    "mitsubishi|outlander": "24 Mitsubishi Outlander SE.jpg",
    "nissan|altima": "24 Nissan Altima SR.jpg",
    "nissan|ariya": "23 Nissan Ariya Engage.jpg",
    "nissan|frontier": "24 Nissan Frontier SV.jpg",
    "nissan|leaf": "23 Nissan Leaf SV Plus.jpg",
    "nissan|murano": "24 Nissan Murano SL.jpg",
    "nissan|pathfinder": "24 Nissan Pathfinder SL.jpg",
    "nissan|rogue": "24 Nissan Rogue SV.jpg",
    "nissan|sentra": "24 Nissan Sentra SR.jpg",
    "subaru|solterra": "23 Subaru Solterra Limited.jpg",
    "toyota|sienna hybrid": "24 Toyota Sienna XLE.jpg",
    "toyota|tacoma": "24 Toyota Tacoma SR5.jpg",
    "toyota|tundra": "24 Toyota Tundra SR5.jpg",
    "volkswagen|atlas": "24 Volkswagen Atlas SE.jpg",
    "volkswagen|e-golf": "19 Volkswagen e-Golf SE.jpg",
    "volkswagen|id. buzz": "Volkswagen ID. Buzz IAA 2023 1X7A0299.jpg",
    "volkswagen|id.4": "23 Volkswagen ID.4 Pro.jpg",
    "volkswagen|jetta": "24 Volkswagen Jetta SE.jpg",
    "volkswagen|tiguan": "24 Volkswagen Tiguan SE.jpg",
    "volvo|c40 recharge": "23 Volvo C40 Recharge.jpg",
    "volvo|ex30": "Volvo EX30 Twin Motor Performance Ultra.jpg",
    "volvo|ex90": "Volvo EX90 IAA 2023 1X7A0366.jpg",
    "volvo|s60": "24 Volvo S60 B5.jpg",
    "volvo|xc40 recharge": "23 Volvo XC40 Recharge.jpg",
    "volvo|xc60": "24 Volvo XC60 B5.jpg",
    "volvo|xc90": "24 Volvo XC90 B6.jpg",
    "tesla|cybertruck": "Tesla Cybertruck at IAA 2023.jpg",
}


def key_part(value: str) -> str:
    return value.strip().lower()


def slug_for(key: str) -> str:
    make, model = key.split("|", 1)
    raw = f"{make}-{model}".replace("/", "-").replace("+", "plus")
    return re.sub(r"[^a-z0-9]+", "-", raw).strip("-")


def download(file_name: str, dest: Path) -> bool:
    url = (
        "https://commons.wikimedia.org/wiki/Special:FilePath/"
        + urllib.parse.quote(file_name)
        + "?width=1600"
    )
    for attempt in range(7):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=60) as resp:
                dest.write_bytes(resp.read())
            return dest.stat().st_size > 8_000
        except Exception as exc:
            if "429" in str(exc) or "503" in str(exc):
                wait = 15 * (attempt + 1)
                print(f"  rate limited, sleep {wait}s")
                time.sleep(wait)
                continue
            print(f"  fail {file_name}: {exc}")
            return False
    return False


def search(make: str, model: str) -> tuple[str, bool] | None:
    make_q = make.replace("Mercedes-Benz", "Mercedes")
    model_q = re.sub(r"\b(hybrid|plug-?in|phev|electric|recharge|electrified|4xe)\b", "", model, flags=re.I)
    model_q = re.sub(r"\s+", " ", model_q).strip(" -/.")
    queries = [
        f"{make_q} {model} HJUdall",
        f"{make_q} {model_q} HJUdall",
        f"{make_q} {model_q}",
        f'intitle:"{make_q}" intitle:"{model_q}"',
    ]
    for q in queries:
        url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(
            {
                "action": "query",
                "list": "search",
                "srsearch": q,
                "srnamespace": 6,
                "srlimit": 10,
                "format": "json",
            }
        )
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode())
        except Exception:
            continue
        for hit in data.get("query", {}).get("search", []):
            title = hit.get("title", "")
            if not title.startswith("File:"):
                continue
            name = title[5:]
            low = name.lower()
            if any(b in low for b in ("interior", "engine", "badge", "logo", "dashboard", "frunk")):
                continue
            if not low.endswith((".jpg", ".jpeg", ".png")):
                continue
            snippet = hit.get("snippet", "").lower()
            native = "hjudall" in low or "shot at" in low or "hjudall" in snippet
            # basic relevance
            make_token = key_part(make_q).split("-")[0]
            if make_token not in low and make_token not in snippet:
                continue
            return name, native
        time.sleep(0.4)
    return None


def cutout(img: Image.Image) -> Image.Image:
    return remove(img.convert("RGB"), session=SESSION)


def cover_crop(img: Image.Image) -> Image.Image:
    img = img.convert("RGB")
    scale = max(OUT_W / img.width, OUT_H / img.height)
    resized = img.resize((int(img.width * scale), int(img.height * scale)), Image.Resampling.LANCZOS)
    left = (resized.width - OUT_W) // 2
    top = max(0, (resized.height - OUT_H) // 2 - int(OUT_H * 0.04))
    cropped = resized.crop((left, top, left + OUT_W, top + OUT_H))
    return ImageEnhance.Sharpness(ImageEnhance.Contrast(cropped).enhance(1.03)).enhance(1.05)


def soft_shadow(width: int, height: int) -> Image.Image:
    shadow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)
    draw.ellipse((0, 0, width - 1, height - 1), fill=(15, 25, 20, 90))
    return shadow.filter(ImageFilter.GaussianBlur(radius=18))


def studioize(src: Path, plate: Image.Image) -> Image.Image:
    original = Image.open(src).convert("RGB")
    max_side = 1200
    if max(original.size) > max_side:
        scale = max_side / max(original.size)
        original = original.resize((int(original.width * scale), int(original.height * scale)), Image.Resampling.LANCZOS)
    rgba = cutout(original)
    bbox = rgba.getbbox()
    if bbox:
        rgba = rgba.crop(bbox)
    scale = min((OUT_W * 0.92) / rgba.width, (OUT_H * 0.78) / rgba.height)
    cut = rgba.resize((max(1, int(rgba.width * scale)), max(1, int(rgba.height * scale))), Image.Resampling.LANCZOS)
    canvas = plate.resize((OUT_W, OUT_H), Image.Resampling.LANCZOS).convert("RGBA")
    x = (OUT_W - cut.width) // 2
    y = OUT_H - cut.height - int(OUT_H * 0.06)
    sw, sh = int(cut.width * 0.78), max(28, int(cut.height * 0.08))
    shadow = soft_shadow(sw, sh)
    canvas.alpha_composite(shadow, (x + (cut.width - sw) // 2, y + cut.height - int(sh * 0.55)))
    canvas.alpha_composite(cut, (x, y))
    out = canvas.convert("RGB")
    return ImageEnhance.Sharpness(ImageEnhance.Contrast(out).enhance(1.04)).enhance(1.06)


def save(img: Image.Image, slug: str) -> None:
    path = ASSET_DIR / f"{slug}.jpg"
    img.save(path, quality=90, optimize=True)
    (PUBLIC_DIR / f"{slug}.jpg").write_bytes(path.read_bytes())


def main() -> None:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    plate = Image.open(ASSET_DIR / "_studio-plate.jpg")
    misses = [k for k, v in manifest.items() if v.get("via") == "miss"]
    # Also include alias parents that are still miss targets referenced by BODY
    print(f"Filling {len(misses)} misses")

    for key in misses:
        slug = slug_for(key)
        out = ASSET_DIR / f"{slug}.jpg"
        if out.exists() and (PUBLIC_DIR / f"{slug}.jpg").exists():
            manifest[key] = {"slug": slug, "source": "existing", "via": "studio-native"}
            print(f"have {key}")
            continue

        make, model = key.split("|", 1)
        # Title-case-ish for search display
        make_disp = "Mercedes-Benz" if make == "mercedes-benz" else make.title().replace("Bmw", "BMW").replace("Gmc", "GMC").replace("Vw", "Volkswagen")
        if make == "bmw":
            make_disp = "BMW"
        if make == "gmc":
            make_disp = "GMC"
        if make == "volkswagen":
            make_disp = "Volkswagen"
        model_disp = model

        file_name = FILLS.get(key)
        native = bool(file_name and ("HJUdall" in file_name or re.match(r"^\d{2} ", file_name or "")))
        if not file_name:
            found = search(make_disp, model_disp)
            if found:
                file_name, native = found

        if not file_name:
            print(f"MISS {key}")
            continue

        raw = ASSET_DIR / f"_raw-{slug}.jpg"
        print(f"get {key} <- {file_name}")
        if not download(file_name, raw):
            # try search fallback if curated failed
            found = search(make_disp, model_disp)
            if not found:
                print(f"MISS {key}")
                continue
            file_name, native = found
            print(f"  retry search <- {file_name}")
            if not download(file_name, raw):
                print(f"MISS {key}")
                continue

        try:
            img = cover_crop(Image.open(raw)) if native else studioize(raw, plate)
            # If curated "native" guess was wrong outdoor, still ok visually after crop;
            # for show cars prefer cutout when filename has IAA/Geneva
            if not native and ("iaa" in file_name.lower() or "genf" in file_name.lower() or "zuerich" in file_name.lower()):
                img = studioize(raw, plate)
            save(img, slug)
            manifest[key] = {
                "slug": slug,
                "source": file_name,
                "via": "studio-native" if native else "studio-cutout",
            }
            print(f"  wrote {slug}.jpg")
        except Exception as exc:
            print(f"  fail {key}: {exc}")
        finally:
            if raw.exists():
                raw.unlink()

        MANIFEST.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
        time.sleep(1.5)

    # Resolve aliases that point at newly filled bodies
    aliases = {
        "chrysler|pacifica hybrid": "chrysler|pacifica",
        "bmw|x5 phev": "bmw|x5",
        "honda|accord hybrid": "honda|accord",
        "honda|civic hybrid": "honda|civic",
        "honda|cr-v hybrid": "honda|cr-v",
        "ford|escape hybrid": "ford|escape",
        "ford|escape plug-in hybrid": "ford|escape",
        "ford|explorer hybrid": "ford|explorer",
        "ford|maverick hybrid": "ford|maverick",
        "lexus|es 300h": "lexus|es 350",
        "lexus|nx 350h": "lexus|nx 350",
        "lexus|nx 450h+": "lexus|nx 350",
        "lexus|rx 350h": "lexus|rx 350",
        "lexus|rx 450h+": "lexus|rx 350",
        "mitsubishi|outlander phev": "mitsubishi|outlander",
        "mazda|cx-70 phev": "mazda|cx-50",
        "volvo|xc60 recharge": "volvo|xc60",
        "volvo|xc90 recharge": "volvo|xc90",
    }
    for key, src in aliases.items():
        src_slug = slug_for(src)
        src_path = ASSET_DIR / f"{src_slug}.jpg"
        if not src_path.exists():
            continue
        slug = slug_for(key)
        data = src_path.read_bytes()
        (ASSET_DIR / f"{slug}.jpg").write_bytes(data)
        (PUBLIC_DIR / f"{slug}.jpg").write_bytes(data)
        manifest[key] = {"slug": slug, "source": src, "via": "alias"}
        print(f"alias {key} <- {src}")

    MANIFEST.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    ok = sum(1 for v in manifest.values() if v.get("via") != "miss")
    print(f"Done. Mapped {ok}/{len(manifest)}")


if __name__ == "__main__":
    main()
