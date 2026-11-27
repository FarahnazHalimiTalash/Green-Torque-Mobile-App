"""Light professional polish for bundled vehicle photos (no heavy vignette)."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageEnhance

ROOT = Path(__file__).resolve().parents[1] / "assets" / "vehicles"
OUT_W, OUT_H = 1400, 820


def polish(src: Path) -> Image.Image:
    img = Image.open(src).convert("RGB")
    img = ImageEnhance.Contrast(img).enhance(1.06)
    img = ImageEnhance.Color(img).enhance(1.04)
    img = ImageEnhance.Sharpness(img).enhance(1.1)
    img = ImageEnhance.Brightness(img).enhance(1.02)

    scale = max(OUT_W / img.width, OUT_H / img.height)
    resized = img.resize((int(img.width * scale), int(img.height * scale)), Image.Resampling.LANCZOS)
    left = (resized.width - OUT_W) // 2
    top = max(0, (resized.height - OUT_H) // 2 - int(OUT_H * 0.04))
    return resized.crop((left, top, left + OUT_W, top + OUT_H))


def main() -> None:
    for path in sorted(ROOT.glob("*.jpg")):
        polished = polish(path)
        polished.save(path, quality=92, optimize=True)
        print(f"polished {path.name}")


if __name__ == "__main__":
    main()
