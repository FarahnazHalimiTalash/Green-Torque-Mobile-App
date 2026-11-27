"""
Re-composite every vehicle onto a clean solid studio plate (white or black).
Removes checkered floors, beige walls, extra shadows, and color noise.
"""

from __future__ import annotations

import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "assets" / "vehicles"
PUBLIC_DIR = ROOT / "shop" / "public" / "vehicles"
OUT_W, OUT_H = 1400, 820

SESSION = new_session("u2net")

SKIP = {
    "_studio-plate.jpg",
    "studio-empty.jpg",
}

# Prefer dark seamless studio for these makes (premium / night-showroom look).
DARK_MAKES = {
    "tesla",
    "polestar",
    "lucid",
    "rivian",
    "porsche",
    "bmw",
    "mercedes-benz",
    "mercedes",
    "audi",
    "genesis",
    "lexus",
}


def make_from_filename(name: str) -> str:
    stem = Path(name).stem.lower()
    # slug form: tesla-model-3, cadillac-escalade
    # legacy: model3, mach-e, i4, gv60, etc.
    legacy_make = {
        "model3": "tesla",
        "model-y": "tesla",
        "model-s": "tesla",
        "model-x": "tesla",
        "escalade": "cadillac",
        "escalade-iq": "cadillac",
        "lyriq": "cadillac",
        "optiq": "cadillac",
        "xt5": "cadillac",
        "gv60": "genesis",
        "integra": "acura",
        "prius": "toyota",
        "prius-prime": "toyota",
        "mach-e": "ford",
        "bolt-ev": "chevrolet",
        "bolt-euv": "chevrolet",
        "i4": "bmw",
        "ioniq5": "hyundai",
        "ev6": "kia",
        "taycan": "porsche",
        "r1t": "rivian",
        "r1s": "rivian",
    }
    if stem in legacy_make:
        return legacy_make[stem]
    return stem.split("-")[0]


def cutout(img: Image.Image) -> Image.Image:
    return remove(img.convert("RGB"), session=SESSION)


def car_luminance(cut: Image.Image) -> float:
    rgba = cut.convert("RGBA")
    alpha = rgba.split()[-1]
    # Sample opaque pixels
    pixels = list(rgba.getdata())
    alphas = list(alpha.getdata())
    total = 0.0
    count = 0
    for (r, g, b, a), al in zip(pixels, alphas):
        if al < 40:
            continue
        total += 0.2126 * r + 0.7152 * g + 0.0722 * b
        count += 1
    if count == 0:
        return 128.0
    return total / count


def choose_theme(make: str, luminance: float) -> str:
    """Return 'light' or 'dark' seamless studio."""
    # Strong luminance override for contrast (white car → dark plate, black car → light).
    if luminance >= 175:
        return "dark"
    if luminance <= 70:
        return "light"
    if make in DARK_MAKES:
        return "dark"
    return "light"


def seamless_plate(theme: str) -> Image.Image:
    """Clean cyclorama: flat wall + soft floor falloff, no patterns."""
    if theme == "dark":
        wall = (18, 18, 20)
        floor = (10, 10, 12)
        mid = (14, 14, 16)
    else:
        wall = (248, 248, 250)
        floor = (236, 236, 238)
        mid = (243, 243, 245)

    img = Image.new("RGB", (OUT_W, OUT_H), wall)
    draw = ImageDraw.Draw(img)
    horizon = int(OUT_H * 0.62)
    for y in range(horizon, OUT_H):
        t = (y - horizon) / max(1, OUT_H - horizon)
        # ease into floor tone
        t = t * t
        color = tuple(int(mid[i] * (1 - t) + floor[i] * t) for i in range(3))
        draw.line([(0, y), (OUT_W, y)], fill=color)

    # Very soft vignette (almost invisible) to avoid flat clipping
    vignette = Image.new("L", (OUT_W, OUT_H), 0)
    vdraw = ImageDraw.Draw(vignette)
    inset = 40
    vdraw.ellipse((-inset, -inset, OUT_W + inset, OUT_H + inset), fill=255)
    vignette = vignette.filter(ImageFilter.GaussianBlur(80))
    if theme == "dark":
        shade = Image.new("RGB", (OUT_W, OUT_H), (0, 0, 0))
        img = Image.composite(img, Image.blend(img, shade, 0.12), vignette)
    else:
        shade = Image.new("RGB", (OUT_W, OUT_H), (255, 255, 255))
        img = Image.composite(img, Image.blend(img, shade, 0.08), vignette)
    return img


def soft_contact_shadow(width: int, height: int, theme: str) -> Image.Image:
    alpha = 70 if theme == "light" else 110
    shadow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(shadow)
    draw.ellipse((0, 0, width - 1, height - 1), fill=(0, 0, 0, alpha))
    return shadow.filter(ImageFilter.GaussianBlur(radius=22))


def fit_cutout(cut: Image.Image) -> Image.Image:
    cut = cut.convert("RGBA")
    # Tighten matte: kill semi-transparent fringe noise
    r, g, b, a = cut.split()
    a = a.point(lambda v: 0 if v < 28 else (255 if v > 200 else v))
    cut = Image.merge("RGBA", (r, g, b, a))
    bbox = cut.getbbox()
    if bbox:
        cut = cut.crop(bbox)
    max_w, max_h = int(OUT_W * 0.90), int(OUT_H * 0.72)
    scale = min(max_w / cut.width, max_h / cut.height)
    new_size = (max(1, int(cut.width * scale)), max(1, int(cut.height * scale)))
    return cut.resize(new_size, Image.Resampling.LANCZOS)


def polish_one(src: Path, dest_asset: Path, dest_public: Path) -> str:
    original = Image.open(src).convert("RGB")
    max_side = 1200
    if max(original.size) > max_side:
        s = max_side / max(original.size)
        original = original.resize(
            (int(original.width * s), int(original.height * s)),
            Image.Resampling.LANCZOS,
        )

    cut = cutout(original)
    lum = car_luminance(cut)
    make = make_from_filename(src.name)
    theme = choose_theme(make, lum)
    plate = seamless_plate(theme).convert("RGBA")
    cut = fit_cutout(cut)

    x = (OUT_W - cut.width) // 2
    y = OUT_H - cut.height - int(OUT_H * 0.07)

    sw = int(cut.width * 0.72)
    sh = max(22, int(cut.height * 0.055))
    shadow = soft_contact_shadow(sw, sh, theme)
    sx = x + (cut.width - sw) // 2
    sy = y + cut.height - int(sh * 0.45)
    plate.alpha_composite(shadow, (sx, sy))
    plate.alpha_composite(cut, (x, y))

    out = plate.convert("RGB")
    # Mild clarity without amplifying noise
    out = ImageEnhance.Contrast(out).enhance(1.03)
    out = ImageEnhance.Sharpness(out).enhance(1.08)
    out = ImageEnhance.Color(out).enhance(0.96)  # calm distracted color cast

    dest_asset.parent.mkdir(parents=True, exist_ok=True)
    dest_public.parent.mkdir(parents=True, exist_ok=True)
    out.save(dest_asset, quality=92, optimize=True)
    dest_public.write_bytes(dest_asset.read_bytes())
    return theme


def main() -> None:
    files = sorted(
        p
        for p in ASSET_DIR.glob("*.jpg")
        if p.name not in SKIP and not p.name.startswith("_raw")
    )
    print(f"Polishing {len(files)} vehicles…")

    # Clean empty plate (light)
    empty = seamless_plate("light")
    empty.save(ASSET_DIR / "studio-empty.jpg", quality=92)
    empty.save(PUBLIC_DIR / "studio-empty.jpg", quality=92)

    dark_n = light_n = 0
    for i, path in enumerate(files, 1):
        if path.name.startswith("_"):
            continue
        print(f"[{i}/{len(files)}] {path.name}", flush=True)
        try:
            theme = polish_one(path, ASSET_DIR / path.name, PUBLIC_DIR / path.name)
            if theme == "dark":
                dark_n += 1
            else:
                light_n += 1
            print(f"  {theme}", flush=True)
        except Exception as exc:
            print(f"  FAIL {exc}", flush=True)

    print(f"Done. light={light_n} dark={dark_n}")


if __name__ == "__main__":
    main()
