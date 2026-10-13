# DevBF website

Static French website for DevBF (freelance web development, Burkina Faso): home page, three guides,
a real shop built as a showcase (L'Atelier de Victoria), a restaurant demo with WhatsApp ordering, and three legal pages.
Plain HTML, CSS and JavaScript: no build step, no framework, no cookies. The only third-party requests are Google Fonts
(for the headings, until you host that font, see [Fonts](#fonts), and on the Atelier showcase page) and, only if you turn it
on, the Formspree form service.

## Going live

The site is ready as it is. Your phone number (+226 75 59 84 12) and your email are filled in everywhere, the legal pages are
written for a student who has no registered business yet, and the contact form needs no account: it opens WhatsApp with the
visitor's message ready (see [Contact form](#contact-form)).

### Before you publish: four decisions that are yours

1. **Victoria's agreement.** Her shop is shown as your first real project, with her name, her photos and her WhatsApp number.
   Ask her by WhatsApp whether she is happy for it to appear on your site, and keep her answer. Then ask her for two sentences
   to show as a testimonial (the markup is in the comment under the featured block in `index.html`). Nothing fake is shown:
   there is no testimonial until you have a real one.
2. **The host named in the legal pages.** They name Cloudflare, Inc. If you publish on Netlify instead, run
   `python3 tools/configure.py --host netlify` (or `--host "Name|Address|website"` for any other host), so the pages stay true.
3. **My default terms.** `conditions-services.html` says: 50 % deposit at the order, balance on delivery before the site goes live,
   payment by Orange Money, Moov Money, bank transfer or cash with a written confirmation each time, domain registered in the
   client's name, 15 days to correct a serious breach, courts of Ouagadougou. They are suggestions: change what does not suit you
   (and the "Dernière mise à jour" date at the top of the page). See [The legal pages](#the-legal-pages).
4. **The three concept photos** (`assets/images/concept-*.webp`) came with your original files. If they come from a stock-photo
   site that asks for a credit, add it in `mentions-legales.html`, section "Crédits des images".

### Build and publish

1. **Build the upload file:** `python3 tools/make_dist.py` writes `dist/devbf-site.zip` (site only, `index.html` at the root).
   It refuses to build while a placeholder remains (`configure.py --check` lists them); `--force` makes a preview copy.
   `--folder` writes the clean folder `dist/site/` instead, for hosts that build from GitHub.
2. **Publish it** on Netlify or Cloudflare Pages, by upload or straight from GitHub: see [Publishing](#publishing).
   Both read the `_headers` file; GitHub Pages does not. An ordinary host works too (unzip into `public_html`).
   Then do the [after launch checklist](#after-launch-checklist).

Optional, at any time (`python3 tools/configure.py --help`): `--domain yourdomain.bf` replaces `devbf.com` everywhere
(canonical links, sitemap, robots.txt, WhatsApp messages), `--formspree ID` sends the messages to your email instead of
WhatsApp, `--facebook` / `--instagram` / `--linkedin` / `--github` / `--twitter` show the footer icons.
Run `python3 tools/configure.py --check` to see what is left; add `-v` for the details.

Preview locally before publishing: `python3 -m http.server 8000` in this folder, then open <http://localhost:8000>.

## What is in the folder

```
index.html                 home page (hero, services, Atelier showcase, About, process, pricing, free audit, payback calculator, FAQ, contact; prices, About, concepts and calculator open on click)
mentions-legales.html      legal notice            ┐
politique-confidentialite.html  privacy policy      ├ written for a student without a registered business (templates, not legal advice)
conditions-services.html   terms of service        ┘
ressources/                three guides (SEO): Mobile Money, restaurant website, website price in Ouagadougou
realisations/atelier-victoria/  the real shop of a crochet maker in Ouagadougou: catalogue, cart, WhatsApp order (self-contained, not indexed here)
demo/restaurant/           fictional restaurant "Saveurs du Faso" with a cart and WhatsApp order (not indexed)
css/style.css              all styles (dark theme, light theme default); css/icons.css is generated, do not edit
js/main.js                 home page behaviour; js/page.js is shared by the legal pages and guides
js/theme-init.js           applies the saved theme before first paint
assets/fonts, assets/images  hosted fonts (Inter), the three concept images and the two screenshots of the Atelier site (WebP)
favicon.svg, og-devbf.jpg  icon and 1200x630 preview image shown when the site is shared
_headers                   security headers and caching (Netlify / Cloudflare Pages format)
robots.txt, sitemap.xml    search engine files (update the sitemap when you add a page)
.gitignore                 for GitHub: dist/ (made by make_dist.py) and Python caches are not committed
tools/                     configure.py, make_dist.py, build_fonts.py, build_icons.py
archive/                   the original single-file version, for reference (never published)
```

## Settings

| What | Where | Status, and how to change it |
|---|---|---|
| WhatsApp / phone number | every `wa.me` link, JSON-LD, contact block, legal notice, demo | **Done** (75 59 84 12). To change it, find-and-replace `22675598412` and `75 59 84 12` on the whole folder (`configure.py --whatsapp` only replaces the original `226XXXXXXXX` placeholders). The Atelier showcase keeps Victoria's own number. |
| Email | contact block, JSON-LD, legal pages | **Done** (lompounteni07@gmail.com). To change it, find-and-replace on the whole folder. |
| Contact form | `<form action>` in `index.html` | Works without setup (WhatsApp mode). `configure.py --formspree ID` switches to email delivery, see [Contact form](#contact-form). |
| Domain | canonical, Open Graph, sitemap, robots.txt, WhatsApp messages | `configure.py --domain` |
| Host named in the legal pages | `mentions-legales.html`, `politique-confidentialite.html` | `configure.py --host cloudflare` (default) or `netlify`, or `"Name|Address|website"` |
| Social links | footer (hidden until set) | `configure.py --facebook --instagram --linkedin --github --twitter` |
| Your name | **not on the site**: you did not give one | see [The legal pages](#the-legal-pages) |
| Portrait | *Qui est derrière DevBF* card of `index.html` | replace the `<span>DB</span>` initials with the `<img>` shown in the comment and add `assets/images/portrait.webp` (square, at least 320 x 320; it is shown as a circle) |
| Testimonial from Victoria | comment under the featured block in `index.html` | by hand, with her permission |
| Agreement from Victoria | WhatsApp message to her | ask her before you publish, keep her answer |

## Contact form

The form works in two modes. The switch is the end of the form address in `index.html` (`https://formspree.io/f/YOUR_FORM_ID`).

- **WhatsApp mode (default, nothing to set up).** While the address still ends with `YOUR_FORM_ID`, the button reads "Continuer sur
  WhatsApp". It builds one message from everything the visitor typed (name, phone, email, shop, city, project, budget, preferred
  contact, message), opens `wa.me` with it, and shows a panel with a "Ouvrir WhatsApp" button in case the pop-up was blocked.
  The visitor presses "Envoyer" in WhatsApp: nothing is sent before that, nothing is stored on the site, and the form keeps their
  text if they want to change it. You receive the message on WhatsApp like any other.
- **Email mode.** Create a free form at formspree.io, then run `python3 tools/configure.py --formspree abcdwxyz` (the ID is the end of
  the form's address). Messages then arrive in your inbox. If sending fails (unstable mobile network), the visitor is offered the same
  message on WhatsApp instead of an error, so no enquiry is lost. The command also switches the privacy policy to the Formspree wording
  (the text between the `form-mode` comments).

Both modes send the `form_sent` event if you use [analytics](#analytics-optional), with `via` set to `whatsapp` or `formspree`.

## How the home page is organised

To keep the page short, four blocks stay closed until the visitor clicks their bar (native `<details class="fold">`, so they also
open without JavaScript and by keyboard):

| Block | Always visible | Opens to show |
|---|---|---|
| Prices (`#tarifs-fold`) | the four price tiles | the four detailed cards, the notes, a "Réduire" button |
| Who is behind DevBF (`#about-fold`) | portrait, title, one sentence | the full text, three facts, a WhatsApp button |
| Concept sites (`#concepts-fold`) | a bar naming the three concepts | the three concept cards (with the restaurant demo link) |
| Calculator (`#simulation-fold`) | the section title | the payback calculator |

A link or an address that points inside a closed block (for example `index.html#concepts-title`) opens it and scrolls there.
To make a block open by default, add the `open` attribute to its `<details>`. To fold another section, copy one of these blocks:
the `<summary class="fold-toggle">` (with its two labels, one shown when closed and one when open) followed by `<div class="fold-body">`.
Do not put `class="reveal"` on things inside a block (they would stay invisible until scrolled into view).
The `fold_open` event (property `fold`: the block's id) is sent if you use [analytics](#analytics-optional).

## The legal pages

`mentions-legales.html`, `politique-confidentialite.html` and `conditions-services.html` are written to be **true today**:
DevBF is an activity run by a student in Ouagadougou, with no registered business, no IFU and no RCCM, and the pages say so
and promise to add those numbers once they exist. They are **templates, not legal advice**: when the activity grows (regular
clients, invoices), have them reviewed by a lawyer, and check with the CIL (Commission de l'informatique et des libertés)
whether a formality applies to your data processing.

When something changes, update the pages **and** the "Dernière mise à jour" date at their top:

- **You register the activity (IFU, RCCM, status).** `mentions-legales.html` ("Éditeur du site": status, IFU and RCCM lines),
  the third fact of the *Qui est derrière DevBF* card in `index.html`, `conditions-services.html` (section 1 and the sentence
  about taxes in section 2: once you charge VAT, say so), the first sentence of `politique-confidentialite.html`.
- **You want your name on the site.** No name appears today. Add it in `mentions-legales.html` ("Éditeur du site" and
  "Directeur de la publication"), in the privacy policy ("Qui est responsable de vos données") and, if you like, in the About card.
- **You change host or turn on Formspree.** Use `configure.py --host` and `--formspree`, they edit the right lines.
- **You turn on analytics.** Replace "n'utilise ni outil de statistiques" in the privacy policy with what the tool really collects.
- **You change your prices, deposit or payment methods.** `conditions-services.html` sections 2 and 4.

## Changing your prices

There are four plans: **Mini 50 000 FCFA** (a one-page shop on the Atelier model: up to 10 items, cart, WhatsApp order,
3 to 5 days, 1 round of revisions, hosting for a year), Starter 150 000, Business 350 000 and Enterprise on quote.
**The Mini price and what it includes are my suggestion, not a market study**: change them to what is profitable for you.
The same figures appear in several places. Search the folder for `50 000`, `50&nbsp;000`, `50k`, `150` and `350`:
the four price tiles, the detailed pricing cards and their notes, the calculator and the sentence under the Atelier showcase in `index.html`
(also the FAQ answer about small budgets, and the same question in the JSON-LD), the budget choices of the form
(`index.html`) and `planConfig` in `js/main.js`, `priceRange` in the JSON-LD, `conditions-services.html`, and two of
the guides (`ressources/`). `planConfig.mini.budget` must be one of the form's budget options, word for word.

## Fonts

Inter is hosted in `assets/fonts` (latin subset, WOFF2, SIL Open Font License). **Space Grotesk** (headings) still loads from
Google Fonts. To host it too (faster, no request to Google, stricter security policy):

1. Download it from <https://fonts.google.com/specimen/Space+Grotesk> (*Get font*, then *Download all*) and unzip.
2. `pip install fonttools brotli`
3. `python3 tools/build_fonts.py path/to/SpaceGrotesk-VariableFont_wght.ttf --apply`

`--apply` writes the font files, declares them in `css/style.css` and removes the Google Fonts `<link>` tags from the pages
that only use that font. The Atelier showcase loads Fraunces and Jost from Google Fonts, so the tool leaves that page alone,
says so, and **keeps the Google domains in the Content-Security-Policy** (the showcase needs them). They go away only when no page
needs them any more: either host the Atelier fonts too (add `@font-face` rules to its `css/style-v6.css`, remove the links in its
`index.html`, then take the two domains out of `_headers` by hand), or remove the `realisations/atelier-victoria` folder.
If you host Space Grotesk, also delete the first "Google Fonts" line of the privacy policy (a comment shows which); the second one,
about the Atelier, stays as long as the showcase uses Google Fonts. Copy the font's `OFL.txt` next to the font files.
You can use the same tool for another Google font with `--family "Name"`.

## Icons

Icons are Font Awesome Free (CC BY 4.0) turned into CSS masks, so no font file and no CDN. To add one, add a line to `ICONS`
in `tools/build_icons.py`, then run
`npm install @fortawesome/fontawesome-free && python3 tools/build_icons.py node_modules/@fortawesome/fontawesome-free/svgs`.
Keep the licence comment at the top of `css/icons.css`.

## Atelier Victoria showcase

`realisations/atelier-victoria/` is the finished shop of L'Atelier de Victoria (handmade crochet bags and accessories, Ouagadougou):
a catalogue of 11 pieces, product sheets, a cart, dark mode, and an order sent to the workshop's WhatsApp as a ready-made message.
It is a **real** shop, so its WhatsApp number (22607355584) is Victoria's: it is not a placeholder, and `configure.py` leaves it alone.
A visitor who tests the cart only reaches her if they press "Envoyer" in WhatsApp; the page says so, and the bar at the top of the
showcase ("Réalisation DevBF") says that orders placed there are real.

- **Here** it is a showcase, **not indexed**: `_headers` sends `X-Robots-Tag: noindex` for that folder, so that her own site, once
  published, is the one that appears in Google. Do not block it in `robots.txt` (same reason as the demo), and keep it out of `sitemap.xml`.
- **At her own address** (domain or free subdomain): publish the folder on its own, delete the DevBF bar, and replace the showcase
  address with hers. The steps, and the content still needed from her (logo, portrait, social links, confirmation of the prices and
  delivery terms written on the page, customer comments), are in `realisations/atelier-victoria/README.md`.
- **Screenshots** on the home page (`assets/images/atelier-desktop.webp` and `atelier-mobile.webp`) were taken with stand-in fonts,
  because the real ones come from Google Fonts. Retake them from the live page when you can (1280 x 800 on a computer, 390 x 844 on a
  phone, saved as WebP) and keep the file names.
- **Fonts and privacy:** the page loads Fraunces and Jost from Google Fonts. The Content-Security-Policy allows exactly that, and the
  privacy policy mentions it (see [Fonts](#fonts)).
- **As a template for the Mini plan:** copy the folder for a new customer, then change the colours (`:root` of `css/style-v6.css`), the
  logo, the `products` array in `js/main-v6.js`, the texts, the photos and the WhatsApp number (search the folder for `22607355584`).
  Search for `Victoria` and `Atelier` to find every name.

## Restaurant demo

`demo/restaurant/` is a fictional restaurant site: the menu, a cart, delivery or pick-up, and an order summary sent to WhatsApp.
The "pay with Mobile Money" step is **simulated** (it says so on screen and in the message): no payment is taken.
The WhatsApp message goes to *your* number, with a "je veux la même chose" angle, so prospects can reach you from the demo.
The page is `noindex` on purpose (and `_headers` adds `X-Robots-Tag`): do not block `/demo/` in `robots.txt`,
or search engines will not see the `noindex`. To change the menu, edit the `.item` blocks of `index.html`
(`data-id`, `data-name`, `data-price`); the cart reads them from the page.

To take real payments on a client site you need a provider with a Burkina Faso offer (see the Mobile Money guide in `ressources/`
for the options and what to check with each one).

## Guides

The three pages in `ressources/` target searches such as "création site web Ouagadougou" and "accepter Mobile Money
site web Burkina Faso". To add one, duplicate a file and change: `<title>`, description, canonical and Open Graph URLs,
the `Article` JSON-LD, the content, the "À lire aussi" links; then add it to `sitemap.xml` and to the "Guides" link lists in the footers.
French typography: a no-break space before `: ; ? ! %` and inside « ». Statements about payment providers carry their
sources at the bottom of each guide; re-check them from time to time, offers change.

## Analytics (optional)

Off by default. The site is ready for a privacy-friendly counter such as Plausible or Umami:

1. In `index.html`, uncomment **one** `<script>` line near the bottom (and put the same line before `</body>` of the
   guides and demo if you want them counted).
2. In `_headers`, add the tool's domain to `script-src` and `connect-src` of the Content-Security-Policy.
3. Update the privacy policy: replace "n'utilise ni outil de statistiques" and say what the tool collects, where, and whether it sets cookies.
4. Events sent: `whatsapp_click` (property `source`: which button), `demo_open` (property `from`: which link, restaurant demo or Atelier showcase), `plan_select`,
   `form_sent` (property `via`: `whatsapp` or `formspree`), `fold_open` (property `fold`: which block), `audit_request`, `demo_cart_open`, `demo_order_ready`, `demo_payment_simulated`.
   In Plausible, declare each event as a goal to see it in the dashboard.

These tools are designed to work without cookies; check your obligations (CIL, Loi n° 001-2021/AN) before relying on that.

## Publishing

Use **Cloudflare Pages or Netlify**. Both read `_headers`. **GitHub Pages does not** (it cannot set custom headers), so it
would drop the security policy and the `noindex` on the restaurant demo and the Atelier showcase.

**A. Upload (simplest, no GitHub needed)**

1. `python3 tools/make_dist.py` gives `dist/devbf-site.zip`.
2. Cloudflare Pages: *Workers & Pages*, *Create application*, *Get started*, *Drag and drop your files*; name the project,
   drop the zip (or the unzipped folder) and deploy. Netlify: open <https://app.netlify.com/drop> and drop the zip or the
   folder. Without a Netlify account the temporary link is password-protected until you claim it by signing up.
   (Menu names change from time to time; the host's own guide is the reference.)
3. To update the site, build a new zip and upload it again (Netlify: drop it on *Production deploys* of the project).

Cloudflare's drag and drop accepts up to 1 000 files and 25 MiB per file; this site is about 70 files and 4 MB.

**B. Automatic, from GitHub**

1. Push this folder to a **private** GitHub repository (the `.gitignore` keeps `dist/` out).
2. In Cloudflare Pages or Netlify, create the project from that repository, with no framework, and set:
   build command `python3 tools/make_dist.py --folder` (use `python` if the host has no `python3`), output
   (publish) directory `dist/site`.
3. Every push to the main branch then rebuilds and publishes the site. The build **fails on purpose** if a placeholder
   comes back (`configure.py --check` lists it): that is a safety net, not a normal state, because this version has none left.

Only the content of `dist/site` is published: `tools/`, `archive/` and the README files stay in GitHub.

**Domain.** Add it in the host's settings (Cloudflare Pages: *Custom domains* of the project; Netlify: *Domain management*);
HTTPS is automatic. Run `configure.py --domain yourdomain` before the build so the canonical links, the sitemap and
`robots.txt` use it.

**Victoria's own site** is a separate project with its own address: see `realisations/atelier-victoria/README.md`
(remove the DevBF bar, replace the address; her copy is not `noindex`).

## Security headers and hosting

`_headers` sets a strict Content-Security-Policy (no inline scripts or styles, only the site itself and Formspree),
`nosniff`, frame blocking, a referrer policy, a permissions policy, HSTS, one-year caching for `/assets/*`, and
`noindex` for `/demo/*` and for the Atelier showcase. (HSTS tells browsers to use HTTPS only: keep it only if your domain is always served over HTTPS, which Netlify and Cloudflare Pages do by default.) Netlify and Cloudflare Pages read it as is (GitHub Pages cannot set custom headers, so it would drop all of them). On Apache, Nginx or another host, copy the same values
into that server's configuration. Because of the policy, **do not add inline `<script>` or `style=""`**: put code in a `.js`
file and styles in `css/style.css`. If you load something from another domain, add it to the policy.

## After launch checklist

- **Google Business Profile:** create or claim your profile (name, category, area served, phone, hours, link to the site) and
  complete Google's verification. For a restaurant client, do the same for them: menu, photos, hours, and replies to reviews.
- **Google Search Console:** verify the domain and submit `sitemap.xml`.
- **WhatsApp Business:** use the free WhatsApp Business app on the number you published (profile, catalogue, greeting and
  away messages, quick replies).
- **.bf domain:** if you use one, check its expiry date: expired names are deactivated by the registry (ABDI), and renewal goes
  through your registrar.
- **Share test:** paste the address in WhatsApp to check the preview image and title.
- **Real-device test:** open the site on a modest Android phone on mobile data; send yourself a form message and a WhatsApp message.

## Licences and credits

- Inter, The Inter Project Authors, SIL Open Font License 1.1 (`assets/fonts/Inter-OFL.txt`).
- Big Shoulders, The Big Shoulders Project Authors, SIL Open Font License 1.1 (`demo/restaurant/fonts/BigShoulders-OFL.txt`).
- Icons: Font Awesome Free 7, Fonticons, Inc., CC BY 4.0 (<https://fontawesome.com/license/free>), generated into `css/icons.css`.
- Atelier Victoria showcase: photos, texts and name belong to L'Atelier de Victoria (show them only with her agreement); the code is yours.
- The three concept photos (`assets/images/concept-*.webp`) came with your original files: note where they come from, and credit them in the legal notice if their source asks for it.
- Fraunces and Jost (Atelier showcase), SIL Open Font License 1.1, loaded from Google Fonts.
- Site code, copy and images: yours.
