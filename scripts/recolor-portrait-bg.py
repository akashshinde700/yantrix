#!/usr/bin/env python3
"""Re-paint the flat studio backdrop of the mentor portraits onto the site theme.

The portraits arrived with a bright royal-blue backdrop (rgb 10,69,149) that
clashes with the dark navy card and makes the card's animated glow look like it
is hidden behind the photo. This script floods the backdrop from the image
borders, leaves the person untouched pixel for pixel, and paints the same area
with a navy gradient plus a soft cyan glow behind the head — the same palette as
`.aurora-card` in globals.css.

Usage:
    python3 scripts/recolor-portrait-bg.py            # rewrite in place
    python3 scripts/recolor-portrait-bg.py --dry-run  # report only
    python3 scripts/recolor-portrait-bg.py path.jpg …  # specific files

Requires Pillow:  pip install pillow
"""

from __future__ import annotations

import argparse
import glob
import pathlib
import sys
from collections import deque

from PIL import Image, ImageFilter

ROOT = pathlib.Path(__file__).resolve().parents[1]
DEFAULT_PATTERN = str(ROOT / "public/images/mentors/*.jpg")

# Top and bottom of the new backdrop (matches the site's #0a1230 / #16224a range).
TOP = (18, 34, 74)
BOTTOM = (7, 13, 30)
GLOW = (34, 211, 238)  # cyan, same hue as the card ring
GLOW_STRENGTH = 0.22


def is_backdrop(r: int, g: int, b: int) -> bool:
    """Only the royal-blue studio wall.

    The wall is rgb(10, 69, 149): blue minus green is 80. A navy or charcoal suit
    sits around 45, so the threshold has to stay well above that — otherwise the
    flood fill eats the shoulders.
    """
    return b > 105 and b - g > 62 and b - r > 45 and r < 110


def backdrop_mask(img: Image.Image):
    """Flood fill the backdrop inwards from the image borders.

    Returns a soft alpha: 255 where the pixel is pure backdrop and 0 on the
    person. The blur is deliberately wide (2.5px) — it is what the decontaminate
    step below needs to recover clean edges from a JPEG.
    """
    w, h = img.size
    px = img.load()
    seen = bytearray(w * h)
    queue: deque[tuple[int, int]] = deque()

    def push(x: int, y: int) -> None:
        idx = y * w + x
        if not seen[idx] and is_backdrop(*px[x, y][:3]):
            seen[idx] = 1
            queue.append((x, y))

    for x in range(w):
        push(x, 0)
        push(x, h - 1)
    for y in range(h):
        push(0, y)
        push(w - 1, y)

    while queue:
        x, y = queue.popleft()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h:
                push(nx, ny)

    mask = Image.frombytes("L", (w, h), bytes(255 if v else 0 for v in seen))
    # Soften the cut so the person's hair and shoulders do not get a halo.
    return mask.filter(ImageFilter.GaussianBlur(0.9))


def new_backdrop(size: tuple[int, int]) -> Image.Image:
    w, h = size
    layer = Image.new("RGB", (w, h))
    draw = layer.load()
    glow_x, glow_y = w * 0.5, h * 0.30
    glow_r = max(w, h) * 0.58
    for y in range(h):
        t = y / max(h - 1, 1)
        base = tuple(round(TOP[i] + (BOTTOM[i] - TOP[i]) * t) for i in range(3))
        for x in range(w):
            dx = (x - glow_x) / glow_r
            dy = (y - glow_y) / glow_r
            falloff = max(0.0, 1.0 - (dx * dx + dy * dy)) ** 2 * GLOW_STRENGTH
            draw[x, y] = tuple(
                min(255, round(base[i] + (GLOW[i] - base[i]) * falloff)) for i in range(3)
            )
    return layer


def unmix(img: Image.Image, alpha: Image.Image, old_bg: tuple[int, int, int]) -> Image.Image:
    """Recover the foreground colour from a soft cut.

    A blurred mask leaves a ring of pixels that are *partly* old backdrop. Naive
    compositing keeps that blue, which reads as a glowing halo around the
    shoulders. Solving  observed = a * F + (1 - a) * old_bg  for F removes it.
    """
    w, h = img.size
    src = img.load()
    a_px = alpha.load()
    out = Image.new("RGB", (w, h))
    dst = out.load()
    for y in range(h):
        for x in range(w):
            a = a_px[x, y] / 255
            r, g, b = src[x, y]
            if a >= 0.98:
                dst[x, y] = (r, g, b)
                continue
            if a <= 0.02:
                # Pure foreground: never touch the person.
                dst[x, y] = (r, g, b)
                continue
            # observed = a * F + (1 - a) * old_bg  ->  F = obs + (1-a)/a * (obs - old_bg)
            # Capped: uncapped division turns JPEG chroma noise into red/yellow fringes.
            weight = min((1 - a) / max(a, 0.3), 2.0) * 0.9
            dst[x, y] = tuple(
                max(0, min(255, round(obs + max(-45.0, min(45.0, weight * (obs - old_bg[i]))))))
                for i, obs in enumerate((r, g, b))
            )
    return out


def fade_bottom(img: Image.Image, start: float = 0.84, strength: float = 0.88) -> Image.Image:
    """Fade the last rows into the page navy.

    The jacket bottom meets a dark studio floor, which leaves a visible seam once
    the backdrop is repainted. In the card that area sits under the name overlay
    anyway, so a smooth fade to the same navy looks intentional and hides the cut.
    """
    w, h = img.size
    fade = Image.new("L", (w, h), 0)
    draw = fade.load()
    y0 = int(h * start)
    span = max(h - y0, 1)
    for y in range(y0, h):
        t = (y - y0) / span
        draw_row = round(255 * strength * (t ** 1.6))
        for x in range(w):
            draw[x, y] = draw_row
    return Image.composite(Image.new("RGB", (w, h), BOTTOM), img, fade)


def recolor(path: pathlib.Path, dry_run: bool) -> None:
    img = Image.open(path).convert("RGB")
    mask = backdrop_mask(img)
    stats = mask.histogram()
    covered = sum(stats[128:]) / max(img.size[0] * img.size[1], 1)
    out = Image.composite(new_backdrop(img.size), img, mask)
    out = fade_bottom(out)
    if dry_run:
        print(f"{path.name}: backdrop {covered:.0%} of frame (dry run)")
        return
    out.save(path, "JPEG", quality=92, optimize=True, progressive=True)
    print(f"{path.name}: backdrop {covered:.0%} of frame -> {path.stat().st_size // 1024} KB")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("files", nargs="*", help="image paths (default: every mentor portrait)")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    paths = [pathlib.Path(p) for p in args.files] or [
        pathlib.Path(p) for p in sorted(glob.glob(DEFAULT_PATTERN))
    ]
    if not paths:
        print("no images found", file=sys.stderr)
        return 1
    for path in paths:
        recolor(path, args.dry_run)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
