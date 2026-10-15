# creegs.com

Static personal site for Paul Creegan. Plain HTML, CSS, and vanilla JS — no
build step, no framework, no dependencies. Hosts on GitHub Pages as-is.

## Local development

Open `index.html` in a browser. That's the whole workflow. For a live-reload
server:

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## Structure

```
index.html              the entire site — one scrolling page, seven anchor sections
resume.html             chooser between the two résumés
assets/
  css/main.css          design tokens + all styles
  css/resume.css        the résumé chooser only
  js/main.js            two things: the hero typewriter and active-tab tracking
  img/                  photos (resized), favicon, logo, Monero QR, video poster
  sand-pool.mp4         the Sand Pool clip
  paul-creegan-tech.pdf         software / systems / security résumé
  paul-creegan-rope-access.pdf  ropes course / outdoor instruction résumé
  fp-yew-mod.zip        the Ultima IV mod
CNAME                   binds the custom domain creegs.com
```

## Deploying

GitHub Pages serves from the `main` branch root. Push to `main` and it's live
within a minute or two. The `CNAME` file must stay at the repo root or the
custom domain breaks.

## Notes for future edits

- **Colors come from the logo.** `--lime` is `#48e448`, sampled from the actual
  pixels of `logo.jpg`. The charcoal ground is the logo's background. Don't
  substitute other greens — the palette is derived from the brand mark.
- **All filenames are lowercase.** GitHub Pages runs on case-sensitive Linux
  while Windows does not, so `BOB.jpg` referenced as `bob.jpg` works locally
  and 404s in production. Keep new filenames lowercase.
- **Image EXIF is pre-baked.** Photos from the phone carry orientation tag 6;
  the rotation has been applied to the pixels and the tag stripped. If you add
  a new photo, run it through `ImageOps.exif_transpose()` before saving, or it
  will render sideways.
- **Text colors are WCAG AA checked** against the `--void` ground. If you
  lighten or darken an ink token, re-check contrast — captions sit closest to
  the limit at 5.24:1.
