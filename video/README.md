# THE FILM — Higgsfield slot

The film section (`#film` in `index.html`) is the centrepiece of the experience.

**Status: filled.** `higgsfield-film.mp4` is in place — 1280×720, 16:9, 8 s,
looping. The poster (`assets/film-poster.jpg`) is that film's own first frame,
so the still and the video match and the player does not jump when it starts.

---

## 1 · Replacing the film

Overwrite this file:

```
video/higgsfield-film.mp4      ← the film (H.264 / AAC)
```

Then regenerate the poster so it matches the new first frame, otherwise the
player will flash the old still before playing. Any frame grab works — export a
still at 0 s from the editor and save it over `assets/film-poster.jpg` at
1280×720.

To also serve a lighter WebM, list it **before** the MP4 in `index.html`:

```html
<source src="video/higgsfield-film.webm" type="video/webm">
<source src="video/higgsfield-film.mp4" type="video/mp4">
```

`tools/build_assets.py` will not overwrite `film-poster.jpg` once it exists.

## 2 · Export settings

| | |
|---|---|
| Aspect | 16:9 |
| Resolution | 1920×1080 (1280×720 is fine) |
| Frame rate | 24 fps — the cinematic read |
| Codec | H.264, MP4 container |
| Length | 12–25 s, looping cleanly (it loops on the page) |
| Bitrate | 6–10 Mbps, then compress to ≈ 8–15 MB |
| Audio | Optional. It starts muted; sound only plays when the visitor asks |

Keep the first and last frames close to each other — the player loops.

## 3 · Generation brief

Direction the section is written around — slow, gallery-lit, material, premium.
Paste any of these into Higgsfield:

**A — the orbit (recommended for the main slot)**

> Slow cinematic orbit around a matte grey vinyl collectible sculpture of a
> cartoon-like figure with crossed X eyes, standing on a black plinth in a dark
> museum room. Single soft key light from above, deep falloff into black,
> gentle specular highlights travelling across the moulded surface. Shallow
> depth of field, anamorphic feel, 24 fps, no camera shake, no text.

**B — the surface study**

> Extreme close-up macro drift across the surface of a cast vinyl figure: seam
> lines, matte-to-gloss transition, moulding marks, the edge of a painted X.
> Slow push-in, cool grey palette with one warm highlight, dust in the air,
> gallery lighting, cinematic, 24 fps.

**C — the transition essay**

> A dark gallery: a sculptural figure lit from above. Camera pushes forward and
> the environment dissolves from white museum room to a graffiti-covered wall,
> then to a vitrine holding a half-dissected version of the same figure.
> Moody, premium, high contrast, slow motion, no text, no logos.

## 4 · Where it appears in the code

- Section markup: `index.html` → search for `HIGGSFIELD FILM GOES HERE`
- Styling: `css/style.css` → section `10 · FILM`
- Behaviour: `js/main.js` → section `09 · FILM PLAYER`
