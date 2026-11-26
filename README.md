# booboard.com

The website for [BooBoard](https://github.com/knandu18/booboard), the private, offline Android keyboard.
BooBoard works offline and sends nothing anywhere.

Plain HTML, CSS and JavaScript, served by GitHub Pages. No build step, no frameworks, no third-party
scripts, fonts or CDNs, no cookies and no analytics. A Content Security Policy in every page blocks
anything not served from this site.

## Files

- `index.html`, `privacy.html`, `faq.html`, `404.html`: the pages
- `assets/site.css`, `assets/site.js`: styles and animations (Boo is drawn with the same shape and
  motion as in the app)
- `assets/fonts/`: Fraunces and Google Sans Flex, trimmed to WOFF2 (SIL Open Font License 1.1, see the
  `OFL-*.txt` files)
- `tools/build_fonts.py`: rebuilds the trimmed fonts from the full font files
- `CNAME`: the custom domain, booboard.com

## Preview locally

```
python -m http.server 8790
```

Then open http://localhost:8790.
