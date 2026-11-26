"""Shrinks the three variable fonts for the web: pins the axes the site never changes, keeps only the
characters the site can show in Latin, and saves them as WOFF2 in assets/fonts.

Run from the repository root:  python tools/build_fonts.py
Needs:  pip install fonttools brotli
Sources (SIL OFL 1.1) live in tools/font-src (not published).
"""
import io
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "tools" / "font-src"
OUT = ROOT / "assets" / "fonts"

# Basic Latin, Latin-1 (á é ñ ü ¿ ¡ ×), Latin Extended-A, general punctuation, arrows, a few symbols.
UNICODES = (
    "U+0000-00FF,U+0100-017F,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,"
    "U+2000-206F,U+2074,U+20AC,U+20B9,U+2122,U+2190-2199,U+2212,U+2215,U+2713,U+2715"
)

JOBS = [
    # file, pinned / limited axes, output name
    ("GoogleSansFlex.ttf", {"wdth": 100, "ROND": 0, "slnt": 0, "wght": (400, 700), "opsz": (12, 48)}, "google-sans-flex.woff2"),
    ("Fraunces.ttf", {"SOFT": 100, "wght": 400, "opsz": (36, 144)}, "fraunces.woff2"),
    ("Fraunces-Italic.ttf", {"SOFT": 100, "wght": 400, "WONK": 1, "opsz": (36, 144)}, "fraunces-italic.woff2"),
]


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for src, axes, name in JOBS:
        font = TTFont(SRC / src)
        font = instancer.instantiateVariableFont(font, axes)
        buf = io.BytesIO()                      # reload so the subsetter sees fully decoded tables
        font.save(buf)
        buf.seek(0)
        font = TTFont(buf)
        opts = subset.Options()
        opts.flavor = "woff2"
        opts.layout_features = ["*"]
        opts.name_IDs = ["*"]
        opts.notdef_outline = True
        sub = subset.Subsetter(options=opts)
        sub.populate(unicodes=subset.parse_unicodes(UNICODES))
        sub.subset(font)
        font.flavor = "woff2"
        font.save(OUT / name)
        print(f"{name}: {(OUT / name).stat().st_size / 1024:.0f} KB")


if __name__ == "__main__":
    main()
