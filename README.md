# ARCHIVE ✕✕ — Companion Reimagined

A conceptual **digital exhibition** built around the visual language of
contemporary collectible sculpture and street culture: a dark gallery stage,
two museum-white inversions, an editorial grid with technical labels, and a
cinematic Higgsfield film at the centre of the journey.

No frameworks, no build step, no dependencies. Open `index.html` and it runs.

---

## Run it

Any static server works:

```bash
python -m http.server 5178
```

Then open <http://localhost:5178>. (Opening the file directly with `file://`
works too, but a server is better — it lets the `<video>` element stream.)

## The film

The film section is the centrepiece, and it is filled:
`video/higgsfield-film.mp4` — 1280×720, 16:9, 8 s, looping. It plays muted when
it scrolls into view, takes sound on click, and expands to cinema mode (Esc to
leave). The poster is the film's own first frame, so the still and the video
match and nothing jumps when playback starts.

To swap the film, overwrite that file and save a fresh first frame over
`assets/film-poster.jpg`. **`video/README.md` has the export settings and the
Higgsfield prompts** written to match the section's art direction.

If the file is ever missing or unreadable, the player says so in place and tells
you where to put it — the page never shows a broken frame.

## Structure

```
index.html                 one page, 13 sections, semantic + labelled
css/style.css              design system → components → motion → responsive
js/main.js                 vanilla, ~15 self-contained modules
assets/                    the production image library (built, do not hand-edit)
images/                    the original reference screenshots (source of truth)
tools/build_assets.py      regenerates assets/ from images/
video/                     the Higgsfield slot + its brief
```

### The journey

| | Section | Ground | Accent |
|---|---|---|---|
| 01 | Hero — installation view | black | acid |
| 02 | Manifesto | **paper** | pink |
| 03 | Featured figures — rotation study + black edition | black | acid |
| 04 | Anatomy — sticky specimen with hotspots | black | cyan |
| 05 | **The film — Higgsfield** | near-black | acid |
| 06 | Exhibition — gallery room | **paper** | pink |
| 07 | Evolution of form — blueprint | deep navy | cyan |
| 08 | Street — from wall to object | black | pink |
| 09 | Limited drops | black | acid / pink |
| 10 | Apparel | black | acid |
| 11 | Archive — horizontal index | black | — |
| 12 | Access | black | acid |

One accent per section, never all at once. The two paper sections are the
rhythm: they stop the dark from becoming wallpaper.

## Assets

The reference screenshots in `images/` carry burnt-in mock typography, so they
are not used directly. `tools/build_assets.py` turns them into a clean library:

- **figures are knocked out** of their white studio backdrop — a border flood
  fill, a strict second sweep for sealed pockets (the slot between the legs is
  closed off where the boots meet), a rim sweep, and a matte un-multiply so a
  black figure keeps no white outline on a black stage;
- **photographic plates are cropped clear** of any burnt-in text, then upscaled
  with LANCZOS + unsharp so they hold at 1440/1920;
- a **film poster** and a tiling **grain** plate are generated.

```bash
python tools/build_assets.py      # needs Pillow
```

Everything in `assets/` is generated. Edit the script, not the output.

## Notes on the build

- **Type** — Archivo (display, variable width), Inter (UI), JetBrains Mono
  (technical labels), from Google Fonts with real fallback stacks.
- **Motion** — one easing curve (`cubic-bezier(.16,1,.3,1)`), transform and
  opacity only, IntersectionObserver for every reveal, one rAF-throttled
  scroll bus rather than competing listeners.
- **`prefers-reduced-motion`** — parallax, the marquee, the custom cursor, the
  grain drift and every reveal transition drop out; the page stays complete.
- **Accessibility** — skip link, focus-visible rings, aria labels on the nav,
  menu and player, alt text on every image, keyboard-reachable archive rail.
- **Performance** — no libraries, lazy loading below the fold, `width`/`height`
  on images to hold layout, the marquee pauses off-screen and the cursor loop
  parks itself when idle.

## Legal

Independent, non-commercial concept piece inspired by the visual language of
KAWS. Not an official site, and not affiliated with or endorsed by the artist
or any rights holder. Reference imagery is used for study purposes only.
