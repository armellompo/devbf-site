#!/usr/bin/env python3
"""Pack the site into one zip, or into one clean folder, ready to publish.

    python3 tools/make_dist.py            # checks the placeholders first, refuses if some remain
    python3 tools/make_dist.py --force    # builds anyway (handy for a preview copy)
    python3 tools/make_dist.py --folder   # writes the clean folder dist/site/ instead of a zip

The zip is dist/devbf-site.zip. It holds the site only (no tools/, archive/ or README files), with index.html
at the root of the archive: drag it onto Cloudflare Pages or Netlify Drop, or unzip it into the public_html
folder of an ordinary host.

--folder is for hosts that build from your GitHub repository (Cloudflare Pages, Netlify). In the project settings, use
    build command ........ python3 tools/make_dist.py --folder      (or "python" if the host has no "python3")
    output directory ..... dist/site
so that tools/, archive/ and the README files, which are in the repository, are never published.
"""
import argparse
import shutil
import sys
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(HERE))
import configure  # noqa: E402  (same folder)

SKIP_DIRS = {"tools", "archive", "dist", "node_modules", ".git", "__pycache__"}
SKIP_NAMES = {"README.md", ".DS_Store", "Thumbs.db"}
SKIP_SUFFIXES = {".py", ".pyc", ".zip", ".map"}


def deployable():
    for path in sorted(ROOT.rglob("*")):
        if not path.is_file():
            continue
        rel = path.relative_to(ROOT)
        if rel.parts[0] in SKIP_DIRS or any(part.startswith(".git") for part in rel.parts):
            continue
        if path.name in SKIP_NAMES or path.suffix.lower() in SKIP_SUFFIXES:
            continue
        yield path, rel


def main():
    ap = argparse.ArgumentParser(description="Pack the site for publishing.", epilog=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--force", action="store_true", help="build even if placeholders remain (preview copy only)")
    ap.add_argument("--folder", action="store_true", help="write the folder dist/site/ instead of dist/devbf-site.zip")
    args = ap.parse_args()

    ready = configure.check()
    print()
    if not ready and not args.force:
        print("Not building: the site still has placeholders (list above).")
        print("Fill them in (python3 tools/configure.py --help), or run with --force for a preview copy.")
        sys.exit(1)
    if not ready:
        print("WARNING: building with placeholders still in place. Do not publish this copy.\n")

    out_dir = ROOT / "dist"
    out_dir.mkdir(exist_ok=True)
    files = list(deployable())
    if not any(rel.as_posix() == "index.html" for _, rel in files):
        sys.exit("index.html not found: is this the site folder?")

    if args.folder:
        target = out_dir / "site"
        if target.exists():
            shutil.rmtree(target)                     # only ever dist/site, which this script created
        for path, rel in files:
            dest = target / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(path, dest)               # bytes copied as they are: line endings untouched
        print(f"{target.relative_to(ROOT).as_posix()}/: {len(files)} files")
        return

    out = out_dir / "devbf-site.zip"
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for path, rel in files:
            z.write(path, rel.as_posix())
    size = out.stat().st_size
    print(f"{out.relative_to(ROOT).as_posix()}: {len(files)} files, {size / 1024:.0f} KB")


if __name__ == "__main__":
    main()
