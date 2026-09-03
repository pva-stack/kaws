# -*- coding: utf-8 -*-
"""
Asset pipeline — KAWS-inspired digital exhibition.

Turns the raw reference screenshots in /images (which carry burnt-in mock
typography) into a clean, URL-safe library in /assets:

  * figures are knocked out of their white studio backdrop (border flood fill,
    so enclosed whites such as gloves and faces survive);
  * photographic plates are cropped clear of any burnt-in text, then upscaled
    with LANCZOS + unsharp so they hold up on a 1440/1920 canvas;
  * a tiling grain plate is generated for the global film overlay.

Run:  python tools/build_assets.py
"""
import os
import random
from collections import deque
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

SRC, OUT = "images", "assets"
os.makedirs(OUT, exist_ok=True)


def load(name):
    return Image.open(os.path.join(SRC, name)).convert("RGB")


def sharpen(im, scale=1.0):
    if scale != 1.0:
        im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    return im.filter(ImageFilter.UnsharpMask(radius=1.3, percent=85, threshold=3))


def save_jpg(im, name, q=86, scale=1.0):
    im = sharpen(im.convert("RGB"), scale)
    im.save(os.path.join(OUT, name), "JPEG", quality=q, optimize=True, progressive=True)
    print("  ->", name, im.size)


def save_png(im, name):
    im.save(os.path.join(OUT, name), "PNG", optimize=True)
    print("  ->", name, im.size)


def knockout(im, thr=250, feather=0.8, strict=251, pocket=120, rim=234):
    """Drop the white studio backdrop.

    Pass 1 — flood fill seeded from the border, so enclosed whites that belong
    to the figure (faces, gloves) survive.
    Pass 2 — the backdrop also shows through sealed pockets the fill cannot
    reach: the slot between the legs is closed off where the boots meet. Those
    pockets are pure paper (>= `strict`), while the figure's painted whites
    photograph with shading and stay below it, so a strict second sweep clears
    them without eating into the sculpture.
    """
    w, h = im.size
    lum = im.convert("L").load()
    bg = bytearray(w * h)

    def fill(seeds, level):
        q = deque(seeds)
        while q:
            x, y = q.popleft()
            for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if 0 <= nx < w and 0 <= ny < h:
                    i = ny * w + nx
                    if not bg[i] and lum[nx, ny] >= level:
                        bg[i] = 1
                        q.append((nx, ny))

    seeds = []
    for x in range(w):
        for y in (0, h - 1):
            if lum[x, y] >= thr and not bg[y * w + x]:
                bg[y * w + x] = 1
                seeds.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if lum[x, y] >= thr and not bg[y * w + x]:
                bg[y * w + x] = 1
                seeds.append((x, y))
    fill(seeds, thr)

    # pass 2 — sealed pockets of pure paper
    seen = bytearray(bg)
    for y0 in range(h):
        for x0 in range(w):
            i0 = y0 * w + x0
            if seen[i0] or lum[x0, y0] < strict:
                seen[i0] = 1
                continue
            comp, q = [], deque([(x0, y0)])
            seen[i0] = 1
            while q:
                x, y = q.popleft()
                comp.append((x, y))
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    if 0 <= nx < w and 0 <= ny < h:
                        j = ny * w + nx
                        if not seen[j]:
                            if lum[nx, ny] >= strict:
                                seen[j] = 1
                                q.append((nx, ny))
                            else:
                                seen[j] = 1
            if len(comp) >= pocket:
                for x, y in comp:
                    bg[y * w + x] = 1

    # 2px rim sweep at a lower threshold: the outermost anti-aliased pixels sit
    # just under `thr` and would otherwise survive as a bright dotted outline.
    for _ in range(2):
        edge = []
        for y in range(h):
            for x in range(w):
                if bg[y * w + x]:
                    continue
                if lum[x, y] < rim:
                    continue
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    if 0 <= nx < w and 0 <= ny < h and bg[ny * w + nx]:
                        edge.append(y * w + x)
                        break
        if not edge:
            break
        for i in edge:
            bg[i] = 1

    alpha = Image.frombytes("L", (w, h), bytes(255 - b * 255 for b in bg))
    alpha = alpha.filter(ImageFilter.GaussianBlur(feather))
    alpha = alpha.point(lambda v: 0 if v < 20 else (255 if v > 236 else int((v - 20) * 255 / 216)))

    # De-fringe. Every edge pixel was captured over white, so it reads as
    #     C = a*F + (1-a)*255
    # Solving back for F strips the backdrop out of the anti-aliased rim —
    # without this a black figure keeps a white outline on a black stage.
    out = im.convert("RGB")
    src, dst = out.load(), Image.new("RGBA", (w, h))
    put = dst.load()
    ap = alpha.load()
    for y in range(h):
        for x in range(w):
            a = ap[x, y]
            if a == 0:
                put[x, y] = (0, 0, 0, 0)
                continue
            r, g, b = src[x, y]
            if a < 254:
                k = a / 255.0
                r = int(min(255, max(0, (r - 255 * (1 - k)) / k)))
                g = int(min(255, max(0, (g - 255 * (1 - k)) / k)))
                b = int(min(255, max(0, (b - 255 * (1 - k)) / k)))
            put[x, y] = (r, g, b, a)
    return dst.crop(dst.getbbox())


# --------------------------------------------------------------- 01 monochrome
print("monochrome study")
mono = load("kaws-branco.PNG")
save_jpg(mono.crop((30, 18, 876, 485)), "sheet-mono.jpg", q=90, scale=1.6)
# the sheet carries all four views; only the dissected figure is needed as a
# free-standing cut-out, for the anatomy viewer and the archive rail
save_png(knockout(mono.crop((259, 22, 480, 480))), "cut-mono-dissect.png")

# ------------------------------------------------------------ 02 black edition
print("black edition study")
blk = load("kaws-preto.PNG")
save_jpg(blk.crop((28, 14, 872, 496)), "sheet-black.jpg", q=90, scale=1.6)
for key, box in {
    "front":   (30, 18, 250, 492),
    "dissect": (255, 18, 478, 492),
    "side":    (478, 18, 621, 492),
    "back":    (648, 18, 871, 492),
}.items():
    save_png(knockout(blk.crop(box)), "cut-black-%s.png" % key)

# ------------------------------------------------------------------- 03 street
print("street scene")
street = load("kaws-home.PNG")                       # burnt-in headline lives at x<660
save_jpg(street.crop((648, 0, 1160, 665)), "scene-street.jpg", q=84, scale=2.0)
save_jpg(street.crop((0, 0, 1160, 186)), "wall-graffiti.jpg", q=82, scale=1.5)

# ---------------------------------------------------------------------- 04 pop
print("pop composition")
save_jpg(load("kaws-colorido.PNG"), "scene-bff.jpg", q=86, scale=1.6)

# ---------------------------------------------------------- 05 gallery / close-up
print("gallery + close-up")
con = load("kaws-conceito.PNG")
save_jpg(con.crop((372, 18, 1044, 262)), "gallery-room.jpg", q=88, scale=2.0)
save_jpg(con.crop((18, 18, 352, 262)), "figure-burgundy.jpg", q=88, scale=2.0)

# --------------------------------------------------------------------- 06 drops
print("collectible plates")
pr = load("kaws-preco.PNG")
save_jpg(pr.crop((62, 63, 361, 361)), "drop-monochrome.jpg", q=88, scale=2.0)
save_jpg(pr.crop((426, 63, 725, 361)), "drop-anatomy.jpg", q=88, scale=2.0)
save_jpg(pr.crop((790, 63, 1089, 361)), "drop-pink.jpg", q=88, scale=2.0)

# ------------------------------------------------------------------- 07 apparel
print("apparel")
save_jpg(load("kaws-roupa.PNG").crop((62, 215, 501, 411)), "apparel-hoodie.jpg", q=88, scale=2.0)

# ----------------------------------------------------------------- 08 blueprint
print("blueprint specimens")   # cropped clear of the reference's garbled labels
bp = load("kaws-raioX.PNG")
save_jpg(bp.crop((90, 122, 242, 462)), "blueprint-classic.jpg", q=90, scale=2.4)
save_jpg(bp.crop((388, 116, 559, 500)), "blueprint-mech.jpg", q=90, scale=2.4)

# ------------------------------------------------------------- 08b film poster
print("film poster")
# A moody 16:9 stand-in so the film slot reads as cinema before any Higgsfield
# export exists. Once a real frame from the film is in place it must not be
# clobbered by a rebuild — the poster and the video's first frame have to match
# or the player jumps when it starts.
if os.path.exists(os.path.join(OUT, "film-poster.jpg")):
    print("  -- film-poster.jpg exists (frame from the film) - keeping it")
    poster = None
else:
    poster = con.crop((18, 46, 352, 234))      # burgundy close-up, 16:9
if poster is not None:
    poster = sharpen(poster, 2.6)
    pw, ph = poster.size
    vign = Image.new("L", (pw, ph), 0)
    ImageDraw.Draw(vign).ellipse((-pw * 0.35, -ph * 0.55, pw * 1.35, ph * 1.55), fill=210)
    vign = vign.filter(ImageFilter.GaussianBlur(pw * 0.09))
    dark = Image.new("RGB", (pw, ph), (4, 3, 6))
    poster = Image.composite(poster, dark, vign)
    poster = ImageEnhance.Brightness(poster).enhance(0.82)
    poster = ImageEnhance.Color(poster).enhance(0.86)
    poster.save(os.path.join(OUT, "film-poster.jpg"), "JPEG", quality=86, optimize=True, progressive=True)
    print("  -> film-poster.jpg", poster.size)

# ---------------------------------------------------------------------- 09 grain
print("film grain plate")
random.seed(7)
n = 128
grain = Image.new("LA", (n, n))
px = grain.load()
for y in range(n):
    for x in range(n):
        v = random.randint(0, 255)
        px[x, y] = (v, 26 if v > 150 else (18 if v < 60 else 0))
save_png(grain, "grain.png")
print("done.")
