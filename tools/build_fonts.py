#!/usr/bin/env python3
"""Host Space Grotesk (or another Google font) on your own site: no request to Google any more.

Why: faster first display, nothing sent to a third party, and the Content-Security-Policy can be tightened.

Steps
  1. Download the font from https://fonts.google.com/specimen/Space+Grotesk ("Get font", "Download all") and unzip it.
  2. pip install fonttools brotli
  3. From the site folder:
         python3 tools/build_fonts.py path/to/SpaceGrotesk-VariableFont_wght.ttf --apply
     (a static family works too: pass the Medium, SemiBold and Bold .ttf files, e.g. static/SpaceGrotesk-*.ttf)

Without --apply the script only writes the .woff2 files into assets/fonts/ and prints the CSS to paste.
With --apply it also: declares the font in css/style.css, removes the Google Fonts <link> tags from the pages that
only use this font, and removes fonts.googleapis.com / fonts.gstatic.com from the Content-Security-Policy in _headers
unless a page still needs them (the realisations/atelier-victoria/ showcase loads Fraunces and Jost from Google Fonts:
the script leaves that page alone and keeps the two domains in the policy, and says so).
Each file keeps its line endings. The fonts you download keep their own licence (Space Grotesk: SIL OFL 1.1):
keep the licence text next to the font files (assets/fonts/).
"""
import argparse
import re
import sys
from pathlib import Path

try:
    from fontTools import subset
    from fontTools.ttLib import TTFont
except ImportError:
    sys.exit("This script needs fontTools and brotli:  pip install fonttools brotli")

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "fonts"
SKIP_DIRS = {"tools", "archive", "dist", "node_modules", ".git", "__pycache__"}

# Same character set as the Inter files of the site: French and Western European text, punctuation, FCFA, arrows.
RANGES = ("U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+0178,U+02C6,U+02DC,"
          "U+2009,U+2010-2015,U+2018-201E,U+2020-2022,U+2026,U+2030,U+2039-203A,"
          "U+20AC,U+2122,U+2190-2193,U+2212,U+2248,U+2264-2265")
FEATURES = ["kern", "liga", "calt", "ccmp", "locl", "mark", "mkmk", "tnum", "case"]
MUST_HAVE = "«°»ÀÉàçèéêôû’•abcXYZ0123456789"


def subset_to(src, dst):
    """Write the latin subset of `src` as WOFF2 (tries with and without subroutines, keeps the smaller one)."""
    best = None
    for desub in (False, True):
        opts = subset.Options()
        opts.flavor = "woff2"
        opts.layout_features = FEATURES
        opts.hinting = False
        opts.desubroutinize = desub
        opts.name_IDs = [0, 1, 2, 3, 4, 5, 6, 13, 14]
        opts.notdef_outline = True
        font = TTFont(src)
        sub = subset.Subsetter(opts)
        sub.populate(unicodes=subset.parse_unicodes(RANGES))
        sub.subset(font)
        font.flavor = "woff2"
        tmp = Path(str(dst) + (".d" if desub else ".n"))
        font.save(tmp)
        if best is None or tmp.stat().st_size < best.stat().st_size:
            if best is not None:
                best.unlink()
            best = tmp
        else:
            tmp.unlink()
    best.replace(dst)
    return dst.stat().st_size


def describe(path):
    """('var', min, max) for a variable font with a weight axis, ('static', weight) otherwise; None for italics."""
    font = TTFont(path)
    italic = bool(font["OS/2"].fsSelection & 1) or font["post"].italicAngle != 0
    name = font["name"].getBestFamilyName() or path.stem
    if italic:
        return None, name
    if "fvar" in font:
        for axis in font["fvar"].axes:
            if axis.axisTag == "wght":
                return ("var", int(axis.minValue), int(axis.maxValue)), name
    return ("static", int(font["OS/2"].usWeightClass)), name


def newline_of(text):
    return "\r\n" if "\r\n" in text else "\n"


def read(path):
    return path.read_bytes().decode("utf-8")


def write(path, text):
    path.write_bytes(text.encode("utf-8"))


def google_families(text):
    """Font families requested by the Google Fonts stylesheet link(s) of a page, e.g. {'Space Grotesk'}."""
    families = set()
    for link in re.finditer(r'<link href="https://fonts\.googleapis\.com/css2\?([^"]*)" rel="stylesheet">', text):
        for name in re.findall(r"family=([^:&;]+)", link.group(1)):
            families.add(name.replace("+", " "))
    return families


def html_files():
    for p in sorted(ROOT.rglob("*.html")):
        if p.relative_to(ROOT).parts[0] not in SKIP_DIRS:
            yield p


def face_css(family, file_name, weight_decl, nl):
    return nl.join([
        "@font-face {",
        f"    font-family: '{family}';",
        "    font-style: normal;",
        f"    font-weight: {weight_decl};",
        "    font-display: swap;",
        f"    src: url('../assets/fonts/{file_name}') format('woff2');",
        "}",
    ]) + nl


def apply_site(family, faces, heading_file):
    log = []

    # 1. css/style.css
    css_path = ROOT / "css" / "style.css"
    css = read(css_path)
    nl = newline_of(css)
    if re.search(r"@font-face\s*\{[^}]*font-family:\s*['\"]" + re.escape(family), css):
        log.append(f"css/style.css already declares {family}: left unchanged")
    else:
        blocks = nl.join(face_css(family, f, w, nl) for f, w in faces)
        first = css.index("@font-face")
        css = css[:first] + blocks + nl + css[first:]
        css = re.sub(r"/\* Space Grotesk \(titres\) vient encore de Google Fonts, voir index\.html\. \*/",
                     "/* Space Grotesk (titres) est hébergée ici aussi (assets/fonts, licence OFL).  */", css)
        write(css_path, css)
        log.append(f"css/style.css: {len(faces)} @font-face block(s) for {family}")

    # 2. HTML pages: no more Google Fonts links
    patterns = [
        re.compile(r'[ \t]*<link rel="preconnect" href="https://fonts\.googleapis\.com">\r?\n'),
        re.compile(r'[ \t]*<link rel="preconnect" href="https://fonts\.gstatic\.com" crossorigin>\r?\n'),
        re.compile(r'[ \t]*<link href="https://fonts\.googleapis\.com/css2\?[^"]*" rel="stylesheet">\r?\n'),
    ]
    texts = [
        ("Space Grotesk (titres) vient encore de Google Fonts : voir le README, section Fonts.",
         "Space Grotesk (titres) est hébergée dans assets/fonts, comme Inter."),
        ("; Space Grotesk vient de Google Fonts.", "; Space Grotesk aussi."),
    ]
    touched = 0
    kept = []                # pages that also use other Google fonts: their links and the CSP domains must stay
    for page in html_files():
        text = read(page)
        families = google_families(text)
        if families - {family}:
            kept.append(page.relative_to(ROOT).as_posix() + " (" + ", ".join(sorted(families - {family})) + ")")
            continue
        new = text
        for pat in patterns:
            new = pat.sub("", new)
        for old, repl in texts:
            new = new.replace(old, repl)
        if page.name == "index.html" and page.parent == ROOT and heading_file not in new:
            anchor = re.search(r'([ \t]*)<link rel="preload" href="assets/fonts/inter-latin-600\.woff2"[^>]*>\r?\n', new)
            if anchor:
                indent = anchor.group(1)
                preload = f'{indent}<link rel="preload" href="assets/fonts/{heading_file}" as="font" type="font/woff2" crossorigin>' + newline_of(new)
                new = new[:anchor.end()] + preload + new[anchor.end():]
        if new != text:
            write(page, new)
            touched += 1
    log.append(f"{touched} page(s) cleaned of Google Fonts links")
    for page in kept:
        log.append(f"left unchanged, still loads other Google fonts: {page}")

    # 3. _headers
    headers = ROOT / "_headers"
    if headers.exists() and kept:
        log.append("_headers: Google Fonts domains kept in the Content-Security-Policy (the page(s) above still need them)")
    elif headers.exists():
        text = read(headers)
        new = text.replace(" https://fonts.googleapis.com", "").replace(" https://fonts.gstatic.com", "")
        new = re.sub(r"#   - Google Fonts est encore autorisé[^\n]*\n(?:#     [^\n]*\n)*",
                     "#   - polices : hébergées sur le site, aucun domaine externe nécessaire ;\n", new)
        if new != text:
            write(headers, new)
            log.append("_headers: Google Fonts domains removed from the Content-Security-Policy")
    return log


def main():
    ap = argparse.ArgumentParser(description="Host a Google font on the site (latin subset, WOFF2).", epilog=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("fonts", nargs="+", type=Path, help=".ttf / .otf files (one variable font, or several static weights)")
    ap.add_argument("--family", default="Space Grotesk", help="font family name used in the CSS (default: Space Grotesk)")
    ap.add_argument("--apply", action="store_true", help="also update css/style.css, the HTML pages and _headers")
    args = ap.parse_args()

    slug = re.sub(r"[^a-z0-9]+", "-", args.family.lower()).strip("-")
    OUT.mkdir(parents=True, exist_ok=True)

    faces = []          # (file name, CSS font-weight value)
    seen_weights = set()
    for src in args.fonts:
        if not src.exists():
            sys.exit(f"File not found: {src}")
        info, name = describe(src)
        if info is None:
            print(f"skipped {src.name}: italic (the site does not use italics)")
            continue
        if info[0] == "var":
            file_name, weight = f"{slug}-latin-var.woff2", f"{info[1]} {info[2]}"
        else:
            if info[1] in seen_weights:
                print(f"skipped {src.name}: weight {info[1]} already done")
                continue
            seen_weights.add(info[1])
            file_name, weight = f"{slug}-latin-{info[1]}.woff2", str(info[1])
        size = subset_to(src, OUT / file_name)
        missing = [c for c in MUST_HAVE if ord(c) not in TTFont(OUT / file_name).getBestCmap()]
        print(f"{name} ({src.name}) -> assets/fonts/{file_name}  {size / 1024:.1f} KB, weight {weight}"
              + (f"  WARNING: missing glyphs {missing}" if missing else ""))
        faces.append((file_name, weight))

    if not faces:
        sys.exit("No usable font file given.")
    faces.sort(key=lambda f: f[1])
    heading_file = next((f for f, w in faces if w.startswith("700") or " 700" in w or w == "700"), faces[-1][0])

    if args.apply:
        print()
        for line in apply_site(args.family, faces, heading_file):
            print(line)
        print("\nDone. Open the site and check that the headings use the new font.")
        print("Do not forget to copy the font licence (OFL.txt from the download) into assets/fonts/.")
    else:
        nl = "\n"
        print("\nAdd this to css/style.css (before the first @font-face), then remove the Google Fonts <link> tags")
        print("from every page and the Google domains from _headers (or re-run with --apply to do it all):\n")
        print(nl.join(face_css(args.family, f, w, nl) for f, w in faces))


if __name__ == "__main__":
    main()
