#!/usr/bin/env python3
"""Fill in the placeholders of the site in one command.

Run it from anywhere (it finds the site folder by itself):

    python3 tools/configure.py --domain mon-site.bf --host netlify

    python3 tools/configure.py --check        # list what is still to do (changes nothing); add -v for the full list

Options (all optional, give only what you have):
  --domain DOMAIN       replaces devbf.com everywhere (canonical links, sitemap, robots.txt, WhatsApp messages...)
  --host NAME           the company that hosts the site, written in the legal pages: cloudflare (default), netlify,
                        or your own text "Name|Address|website", e.g. "OVH SAS|2 rue Kellermann, 59100 Roubaix, France|ovhcloud.com"
  --formspree ID|URL    your Formspree form ID (or the full https://formspree.io/f/... address): messages then arrive by email
                        instead of opening WhatsApp, and the privacy page is switched to the Formspree wording
  --facebook URL  --instagram URL  --linkedin URL  --github URL  --twitter URL
                        shows the matching icon in the footer (hidden until you give an address)
  --whatsapp NUMBER, --email ADDRESS
                        already filled in for this site (75598412, lompounteni07@gmail.com). They only replace the original
                        placeholders (+226 XX XX XX XX, contact@devbf.com), so to change them now use find-and-replace

The script only edits the placeholder values. Line endings are kept as they are. Run it once per value:
to change a value later, use the find-and-replace of your editor on the whole folder.
It never touches archive/, tools/ or README.md.
"""
import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKIP_DIRS = {"tools", "archive", "dist", "node_modules", ".git", "__pycache__"}
SKIP_FILES = {"README.md"}
TEXT_SUFFIXES = {".html", ".js", ".css", ".xml", ".txt"}

PH_WA_DIGITS = "226XXXXXXXX"            # in wa.me links and JSON-LD (+226XXXXXXXX)
PH_WA_DISPLAY = "+226 XX XX XX XX"      # printed on the page
PH_FORM = "YOUR_FORM_ID"                # in the form action of index.html (main.js keeps its own copy on purpose)
DEFAULT_EMAIL = "contact@devbf.com"
DEFAULT_DOMAIN = "devbf.com"
SOCIALS = ("facebook", "instagram", "linkedin", "github", "twitter")
VERBOSE = False

# Hosts named in the legal pages (mentions-legales.html, politique-confidentialite.html): name, postal address, website.
# Addresses taken from each company's own terms of service (Cloudflare Website and Online Services Terms,
# Netlify Terms of Use); check them again before you rely on them.
HOSTS = {
    "cloudflare": ("Cloudflare, Inc.", "101 Townsend St., San Francisco, CA 94107, États-Unis", "cloudflare.com"),
    "netlify": ("Netlify, Inc.", "101 2nd Street, San Francisco, CA 94105, États-Unis", "netlify.com"),
}
LEGAL_PAGES = ("mentions-legales.html", "politique-confidentialite.html")

# What the privacy page says about the contact form. The default text (WhatsApp mode) lives in the page itself, between
# <!-- form-mode:NAME --> and <!-- /form-mode:NAME -->; --formspree swaps it for these lines.
FORMSPREE_WORDING = {
    "data": [
        "<p>Le formulaire transmet votre message au service Formspree, qui nous le fait parvenir par email. Ce site ne conserve pas lui-même ces informations.</p>",
    ],
    "recipients": [
        "<li>Formspree, service qui reçoit les messages envoyés via le formulaire et nous les transmet par email.</li>",
        "<li>WhatsApp (Meta), si vous choisissez de nous écrire par ce canal.</li>",
    ],
}


def site_files(suffixes=TEXT_SUFFIXES):
    for path in sorted(ROOT.rglob("*")):
        if not path.is_file() or path.name in SKIP_FILES:
            continue
        rel = path.relative_to(ROOT)
        if rel.parts[0] in SKIP_DIRS:
            continue
        if path.suffix.lower() in suffixes or path.name == "_headers":
            yield path


def read(path):
    return path.read_bytes().decode("utf-8")


def write(path, text):
    path.write_bytes(text.encode("utf-8"))          # bytes in, bytes out: CRLF / LF kept untouched


def digits_of(number):
    """'+226 70 12 34 56' -> '22670123456' ; an 8-digit local number gets the 226 prefix."""
    d = re.sub(r"\D", "", number)
    if d.startswith("00"):
        d = d[2:]
    if len(d) == 8:
        d = "226" + d
    if not 8 <= len(d) <= 15:
        sys.exit(f"Phone number not understood: {number!r} (expected something like +226 70 12 34 56).")
    if d.startswith("226") and len(d) != 11:
        sys.exit(f"A Burkina Faso number has 8 digits after 226; got {number!r}.")
    return d


def display_of(digits):
    if digits.startswith("226") and len(digits) == 11:
        local = digits[3:]
        return "+226 " + " ".join(local[i:i + 2] for i in range(0, 8, 2))
    return "+" + digits


def formspree_id(value):
    m = re.search(r"formspree\.io/f/([A-Za-z0-9]+)", value) or re.fullmatch(r"([A-Za-z0-9]{5,})", value.strip())
    if not m:
        sys.exit(f"Formspree form not understood: {value!r} (expected an ID such as abcdwxyz or https://formspree.io/f/abcdwxyz).")
    return m.group(1)


def clean_domain(value):
    d = re.sub(r"^https?://", "", value.strip()).strip("/")
    if not re.fullmatch(r"[A-Za-z0-9.-]+\.[A-Za-z]{2,}", d):
        sys.exit(f"Domain not understood: {value!r} (expected something like mon-site.bf).")
    return d.lower()


def clean_email(value):
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", value.strip()):
        sys.exit(f"Email address not understood: {value!r}.")
    return value.strip()


def clean_url(value):
    if not re.match(r"https://[^\s\"'<>]+$", value.strip()):
        sys.exit(f"Address not understood: {value!r} (it must start with https://).")
    return value.strip()


def replace_in(path, old, new, counts):
    text = read(path)
    n = text.count(old)
    if n:
        write(path, text.replace(old, new))
        counts[old] = counts.get(old, 0) + n
    return n


def escape_html(text):
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def host_of(value):
    """'netlify' -> its three fields ; 'Name|Address|site.com' -> the same, as typed."""
    key = value.strip().lower()
    if key in HOSTS:
        return HOSTS[key]
    parts = [part.strip() for part in value.split("|")]
    if len(parts) != 3 or not all(parts):
        sys.exit(f"Host not understood: {value!r}. Use cloudflare, netlify, or \"Name|Address|website\".")
    return tuple(escape_html(part) for part in parts)


def set_host(host):
    """Rewrite the <span data-host="..."> pieces of the legal pages. Returns how many pieces were changed."""
    name, address, site = host
    values = {"name": name, "address": address, "site": site}
    changed = 0
    for page in LEGAL_PAGES:
        path = ROOT / page
        if not path.exists():
            continue
        text = read(path)
        for key, value in values.items():
            text, n = re.subn(rf'(<span data-host="{key}">)[^<]*(</span>)', lambda m: m.group(1) + value + m.group(2), text)
            changed += n
        write(path, text)
    return changed


def set_form_wording(mode_lines):
    """Replace the text between the form-mode markers of the privacy page. Returns the names of the blocks that were found."""
    path = ROOT / "politique-confidentialite.html"
    if not path.exists():
        return []
    text = read(path)
    nl = "\r\n" if "\r\n" in text else "\n"
    found = []
    for name, lines in mode_lines.items():
        pattern = re.compile(rf'([ \t]*)<!-- form-mode:{name} -->.*?<!-- /form-mode:{name} -->', re.S)
        m = pattern.search(text)
        if not m:
            continue
        pad = m.group(1)
        block = nl.join([f"{pad}<!-- form-mode:{name} -->", *[f"{pad}{line}" for line in lines], f"{pad}<!-- /form-mode:{name} -->"])
        text = text[:m.start()] + block + text[m.end():]
        found.append(name)
    write(path, text)
    return found


def apply(args):
    done = []

    if args.whatsapp:
        digits = args.whatsapp
        display = display_of(digits)
        counts = {}
        for path in site_files({".html", ".js"}):
            replace_in(path, PH_WA_DISPLAY, display, counts)
            replace_in(path, PH_WA_DIGITS, digits, counts)
        n_links = counts.get(PH_WA_DIGITS, 0)
        if n_links:
            done.append(f"WhatsApp: {n_links} link(s)/field(s) now use {display}")
        else:
            done.append("WhatsApp: nothing to replace (already configured?)")

    if args.formspree:
        fid = args.formspree
        counts = {}
        for path in site_files({".html"}):                       # not main.js: it only tests for the placeholder
            replace_in(path, PH_FORM, fid, counts)
        done.append("Formspree: form action set" if counts else "Formspree: nothing to replace (already configured?)")
        if counts:
            switched = set_form_wording(FORMSPREE_WORDING)
            if len(switched) == len(FORMSPREE_WORDING):
                done.append("Privacy page: the contact form is now described as going through Formspree")
            else:
                done.append("Privacy page: could not find the form-mode markers, so its text about the contact form was NOT updated: "
                            "describe Formspree by hand in politique-confidentialite.html (see README)")

    if args.email:
        email = args.email
        counts = {}
        for path in site_files({".html", ".xml", ".txt"}):
            replace_in(path, DEFAULT_EMAIL, email, counts)
        done.append(f"Email: {counts.get(DEFAULT_EMAIL, 0)} occurrence(s) now {email}")

    if args.domain:
        domain = args.domain
        total = 0
        for path in site_files({".html", ".js", ".xml", ".txt"}):
            text = read(path)
            n = text.count(DEFAULT_DOMAIN)
            if n:
                write(path, text.replace(DEFAULT_DOMAIN, domain))
                total += n
        done.append(f"Domain: {total} occurrence(s) now {domain}")

    if args.host:
        n = set_host(args.host)
        done.append(f"Host: {n} place(s) in the legal pages now name {args.host[0]}" if n else
                    "Host: no <span data-host> found in the legal pages; edit them by hand")

    social_set = 0
    index = ROOT / "index.html"
    for name in SOCIALS:
        url = getattr(args, name)
        if not url:
            continue
        text = read(index)
        old = f'<a href="#" hidden data-social="{name}"'
        if old not in text:
            done.append(f"{name}: link not found in its placeholder state (already configured?); edit index.html by hand")
            continue
        write(index, text.replace(old, f'<a href="{url}" data-social="{name}"'))
        social_set += 1
        done.append(f"{name}: icon shown in the footer")
    if social_set:
        text = read(index)
        write(index, text.replace('<div class="social-links" hidden>', '<div class="social-links">'))

    return done


def check():
    """Print what is still to do. Returns True when nothing blocking remains."""
    blocking = []

    def count_in(token, suffixes):
        found = {}
        for path in site_files(suffixes):
            n = read(path).count(token)
            if n:
                found[str(path.relative_to(ROOT))] = n
        return found

    for label, token, suffixes in (
        ("WhatsApp number (digits)", PH_WA_DIGITS, {".html", ".js"}),
        ("WhatsApp number (printed)", PH_WA_DISPLAY, {".html"}),
    ):
        found = count_in(token, suffixes)
        if found:
            blocking.append((label, f"{token}  in " + ", ".join(f"{f} ({n})" for f, n in found.items())))

    todo = re.compile(r'<span class="todo">(.*?)</span>', re.S)
    for path in site_files({".html"}):
        items = [re.sub(r"\s+", " ", m.group(1)).strip() for m in todo.finditer(read(path))]
        if not items:
            continue
        rel = path.relative_to(ROOT)
        if VERBOSE:
            for item in items:
                blocking.append(("To fill in by hand", f"{rel}: {item[:90]}"))
        else:
            blocking.append(("To fill in by hand (highlighted [brackets], search for class=\"todo\")", f"{rel}: {len(items)} place(s), e.g. {items[0][:50]}"))

    for needed in ("og-devbf.jpg",):
        if not (ROOT / needed).exists():
            blocking.append(("Missing file", needed))

    if blocking:
        print("Still to do before going live:\n")
        last = None
        for label, detail in blocking:
            if label != last:
                print(f"  {label}")
                last = label
            print(f"    - {detail}")
    else:
        print("Nothing blocking left: placeholders are filled and required files are present.")

    # Not blocking, just worth knowing.
    notes = []
    hidden_socials = read(ROOT / "index.html").count('href="#" hidden data-social=')
    if hidden_socials:
        notes.append(f"{hidden_socials} social icon(s) in the footer are hidden: pass --facebook / --instagram / --linkedin / --github / --twitter to show them.")
    if "fonts.googleapis.com" in read(ROOT / "index.html"):
        notes.append("Space Grotesk still loads from Google Fonts (see README, section Fonts).")
    if PH_FORM in read(ROOT / "index.html"):
        notes.append("Contact form: WhatsApp mode. The button opens WhatsApp with the message ready, nothing is stored. "
                     "To receive messages by email instead, create a free form on formspree.io and pass --formspree ID.")
    hosts = set()
    for page in LEGAL_PAGES:
        if (ROOT / page).exists():
            hosts.update(re.findall(r'<span data-host="name">([^<]*)</span>', read(ROOT / page)))
    if hosts:
        notes.append("The legal pages name " + " / ".join(sorted(hosts)) + " as host. Publishing somewhere else? "
                     "Run --host cloudflare, --host netlify or --host \"Name|Address|website\" so that they stay true.")
    if notes:
        print("\nGood to know:")
        for n in notes:
            print(f"  - {n}")
    return not blocking


def main():
    ap = argparse.ArgumentParser(description="Fill in the placeholders of the DevBF site.", formatter_class=argparse.RawDescriptionHelpFormatter, epilog=__doc__)
    ap.add_argument("--check", action="store_true", help="list what is left to do and change nothing")
    ap.add_argument("-v", "--verbose", action="store_true", help="with --check: list every place to fill in by hand")
    ap.add_argument("--whatsapp")
    ap.add_argument("--formspree")
    ap.add_argument("--email")
    ap.add_argument("--domain")
    ap.add_argument("--host")
    for name in SOCIALS:
        ap.add_argument(f"--{name}")
    args = ap.parse_args()
    global VERBOSE
    VERBOSE = args.verbose

    given = [a for a in ("whatsapp", "formspree", "email", "domain", "host", *SOCIALS) if getattr(args, a)]
    if args.check or not given:
        ok = check()
        if not args.check and not given:
            print("\n(No option given: nothing was changed. Use --help to see the options.)")
        sys.exit(0 if ok else 1)

    # Validate everything first, so that a typo in one option never leaves the site half configured.
    if args.whatsapp:
        args.whatsapp = digits_of(args.whatsapp)
    if args.formspree:
        args.formspree = formspree_id(args.formspree)
    if args.email:
        args.email = clean_email(args.email)
    if args.domain:
        args.domain = clean_domain(args.domain)
    if args.host:
        args.host = host_of(args.host)
    for name in SOCIALS:
        if getattr(args, name):
            setattr(args, name, clean_url(getattr(args, name)))

    for line in apply(args):
        print(line)
    print()
    check()


if __name__ == "__main__":
    main()
