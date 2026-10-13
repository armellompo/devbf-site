#!/usr/bin/env python3
"""Builds css/icons.css: Font Awesome Free icons as pure CSS (SVG masks).
No CDN and no web font: only the icons listed in ICONS below end up in the stylesheet.

Usage (from the site folder):
    npm install @fortawesome/fontawesome-free
    python3 tools/build_icons.py node_modules/@fortawesome/fontawesome-free/svgs

To add an icon: add a line to ICONS (CSS class -> (family, SVG file name)), run the script again,
then use <i class="fas fa-name" aria-hidden="true"></i> in the page.
The icons come from Font Awesome Free (licence CC BY 4.0): https://fontawesome.com/license/free
Keep the licence comment at the top of the generated file.
"""
import re, sys, pathlib

if len(sys.argv) < 2:
    sys.exit(__doc__)
SRC = pathlib.Path(sys.argv[1])

# classe CSS -> (famille, fichier SVG sans extension)
ICONS = {
    "fa-check": ("solid", "check"), "fa-plus": ("solid", "plus"), "fa-minus": ("solid", "minus"),
    "fa-arrow-right": ("solid", "arrow-right"), "fa-arrow-left": ("solid", "arrow-left"),
    "fa-arrow-up-right-from-square": ("solid", "arrow-up-right-from-square"),
    "fa-utensils": ("solid", "utensils"), "fa-moon": ("solid", "moon"), "fa-sun": ("solid", "sun"),
    "fa-mobile-alt": ("solid", "mobile-screen-button"), "fa-envelope": ("solid", "envelope"),
    "fa-check-circle": ("solid", "circle-check"), "fa-building": ("solid", "building"),
    "fa-bars": ("solid", "bars"), "fa-bag-shopping": ("solid", "bag-shopping"),
    "fa-xmark": ("solid", "xmark"), "fa-times": ("solid", "xmark"),
    "fa-triangle-exclamation": ("solid", "triangle-exclamation"), "fa-tag": ("solid", "tag"),
    "fa-spinner": ("solid", "spinner"), "fa-shopping-cart": ("solid", "cart-shopping"),
    "fa-server": ("solid", "server"), "fa-search": ("solid", "magnifying-glass"),
    "fa-phone": ("solid", "phone"), "fa-paper-plane": ("solid", "paper-plane"),
    "fa-lock": ("solid", "lock"), "fa-location-dot": ("solid", "location-dot"),
    "fa-laptop-code": ("solid", "laptop-code"), "fa-headset": ("solid", "headset"),
    "fa-flag": ("solid", "flag"), "fa-coins": ("solid", "coins"), "fa-cogs": ("solid", "gears"),
    "fa-circle": ("solid", "circle"), "fa-bolt": ("solid", "bolt"), "fa-clock": ("solid", "clock"),
    "fa-language": ("solid", "language"), "fa-id-card": ("solid", "id-card"),
    "fa-shield-halved": ("solid", "shield-halved"), "fa-wallet": ("solid", "wallet"),
    "fa-whatsapp": ("brands", "whatsapp"), "fa-twitter": ("brands", "twitter"),
    "fa-linkedin-in": ("brands", "linkedin-in"), "fa-instagram": ("brands", "instagram"),
    "fa-github": ("brands", "github"), "fa-facebook-f": ("brands", "facebook-f"),
    # restaurant demo, guides and layout fixes
    "fa-wrench": ("solid", "wrench"), "fa-store": ("solid", "store"),
    "fa-motorcycle": ("solid", "motorcycle"), "fa-receipt": ("solid", "receipt"),
    "fa-trash": ("solid", "trash"), "fa-circle-info": ("solid", "circle-info"),
    "fa-pepper-hot": ("solid", "pepper-hot"), "fa-bowl-rice": ("solid", "bowl-rice"),
    "fa-mug-hot": ("solid", "mug-hot"), "fa-drumstick-bite": ("solid", "drumstick-bite"),
    "fa-fish": ("solid", "fish"), "fa-copy": ("solid", "copy"),
    "fa-chevron-right": ("solid", "chevron-right"), "fa-chevron-down": ("solid", "chevron-down"),
    "fa-book-open": ("solid", "book-open"), "fa-map-location-dot": ("solid", "map-location-dot"),
    "fa-list-check": ("solid", "list-check"), "fa-money-bill-wave": ("solid", "money-bill-wave"),
    "fa-basket-shopping": ("solid", "basket-shopping"), "fa-circle-check": ("solid", "circle-check"),
}

def data_uri(svg: str) -> str:
    svg = re.sub(r"<!--.*?-->", "", svg, flags=re.S)
    svg = re.sub(r"\s+", " ", svg).strip().replace('"', "'")
    svg = svg.replace("%", "%25").replace("<", "%3C").replace(">", "%3E").replace("#", "%23")
    return f'url("data:image/svg+xml,{svg}")'

version = "?"
rules, missing = [], []
for cls, (fam, name) in ICONS.items():
    p = SRC / fam / f"{name}.svg"
    if not p.exists():
        missing.append(f"{fam}/{name}")
        continue
    text = p.read_text(encoding="utf-8")
    m = re.search(r"Font Awesome Free ([\d.]+)", text)
    if m:
        version = m.group(1)
    rules.append(f".{cls} {{ --fa: {data_uri(text)}; }}")
if missing:
    sys.exit("SVG files not found: " + ", ".join(missing))

header = f"""/*! Icônes : Font Awesome Free {version} par @fontawesome, https://fontawesome.com
   Licence des icônes : CC BY 4.0, https://fontawesome.com/license/free
   Fichier généré par tools/build_icons.py : ne pas modifier à la main. */
.fas, .fab, .far {{
    display: inline-block;
    flex: none;
    width: 1em;
    height: 1em;
    font-style: normal;
    line-height: 1;
    vertical-align: -0.125em;
}}
@supports ((-webkit-mask-image: none) or (mask-image: none)) {{
    .fas, .fab, .far {{
        background-color: currentColor;
        -webkit-mask: var(--fa) center / contain no-repeat;
        mask: var(--fa) center / contain no-repeat;
    }}
}}
.fa-spin {{ animation: fa-spin 1s linear infinite; }}
@keyframes fa-spin {{ to {{ transform: rotate(360deg); }} }}
@media (prefers-reduced-motion: reduce) {{ .fa-spin {{ animation-duration: 3s; }} }}
"""
out = pathlib.Path(__file__).resolve().parent.parent / "css" / "icons.css"
out.write_text(header + "\n".join(rules) + "\n", encoding="utf-8")
print(f"{out.name}: {len(rules)} icons (Font Awesome Free {version}), {out.stat().st_size // 1024} KB")
