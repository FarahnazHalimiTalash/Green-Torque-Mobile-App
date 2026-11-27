"""
Put every vehicle on the same clean showroom studio plate used by Escalade / Model 3.
Uses the lightweight u2net rembg session for speed.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parents[1] / "assets" / "vehicles"
OUT_W, OUT_H = 1400, 820

# True dealer-studio plates — keep as the visual standard.
KEEP_AS_IS = {"escalade.jpg", "model3.jpg", "escalade-iq.jpg", "optiq.jpg", "xt5.jpg"}

SESSION = new_session("u2net")


def cutout(img: Image.Image) -> Image.Image:
    return remove(img.convert("RGB"), session=SESSION)


def empty_studio_from_reference(ref: Image.Image) -> Image.Image:
    """Remove the car from a studio photo and heal the hole into a clean plate."""
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


def studioize(src: Path, plate: Image.Image) -> Image.Image:
    original = Image.open(src).convert("RGB")
    # Downscale large inputs for faster rembg
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


def main() -> None:
    ref_path = ROOT / "escalade.jpg"
    plate_path = ROOT / "_studio-plate.jpg"

    if plate_path.exists():
        print(f"Using cached plate {plate_path.name}")
        plate = Image.open(plate_path)
    else:
        print("Building empty studio plate from Escalade…")
        plate = empty_studio_from_reference(Image.open(ref_path))
        plate.convert("RGB").save(plate_path, quality=92)
        print(f"saved {plate_path.name}")

    for path in sorted(ROOT.glob("*.jpg")):
        if path.name.startswith("_"):
            continue
        if path.name in KEEP_AS_IS:
            print(f"keep studio {path.name}")
            continue
        print(f"studioize {path.name}…", flush=True)
        result = studioize(path, plate)
        result.save(path, quality=92, optimize=True)
        print(f"  wrote {path.name}", flush=True)


if __name__ == "__main__":
    main()
