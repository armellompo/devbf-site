# L'Atelier de Victoria: online shop for handmade crochet bags

A one-page French shop: 11 products, filters, a product sheet, a cart, dark mode, and an order that is sent
to the workshop's WhatsApp as a ready-made message. Plain HTML, CSS and JavaScript, no build step, no cookies.
Payment is not taken on the site: the workshop confirms price, delay and delivery on WhatsApp first.

This folder is **self-contained** (every link is relative), so it works both here, as a showcase on the DevBF
site (`/realisations/atelier-victoria/`), and on its own, on any static host.

## Files

```
index.html          the page (metadata, JSON-LD, sections, product sheet, cart)
css/style-v6.css    all styles; sections 28 and 29 are the DevBF finishing pass and the DevBF bar
js/main-v6.js       catalogue (the `products` array at the top), cart, order message, dark mode, dialogs
js/theme-init.js    applies the saved theme before first paint
assets/images/      product photos (WebP, 3 sizes each), social preview og-victoria.jpg, apple-touch-icon.png
favicon.svg
```

## Changing products and prices

Edit the `products` array at the top of `js/main-v6.js` (name, category, price, image, delay, colours...).
The price in the page text ("Accessoires dès 1 500 FCFA", "Sacs dès 12 000 FCFA"), the meta description and the
JSON-LD `priceRange` are written by hand: change them too if the lowest prices change.
For a new photo, add the WebP (800 px wide is plenty) and its `-480` copy for phones, and point the product to it.

## Publishing it as Victoria's own site

1. Upload this folder on its own (Netlify Drop, Cloudflare Pages, or the `public_html` of a host).
2. Remove the DevBF showcase bar: the block between `DEVBF-BAR:START` and `DEVBF-BAR:END` in `index.html`, and
   section 29 of `css/style-v6.css`. (The footer line "Site réalisé par DevBF" is a credit; keep it if you like.)
3. Replace `https://devbf.com/realisations/atelier-victoria/` with her real address in `index.html`
   (canonical, `og:url`, `og:image`, JSON-LD): one find-and-replace on the folder does it.
4. On the DevBF site this page is **not indexed** (`_headers` sends `noindex`), so that the showcase never competes
   with her own site in search results. Her own copy has no such header, so it will be indexed.
5. Share the link in WhatsApp to check the preview image and title.

## Reusing it for another small shop (the DevBF "Mini" plan)

1. Copy the folder, then remove the DevBF bar (step 2 above) and the footer credit if the client does not want it.
2. Her WhatsApp number `22607355584` appears 7 times in `index.html` and once in `js/main-v6.js`: replace it everywhere.
3. Replace the shop name and texts (search `Victoria` and `Atelier`), the `products` array, the photos in
   `assets/images/products/`, `og-victoria.jpg`, `apple-touch-icon.png` and `favicon.svg`.
4. Colours: the variables at the top of `css/style-v6.css`, and the `html[data-theme="dark"]` block near the end
   for the dark theme. Check text contrast again after changing them.
5. Rewrite the `Store` JSON-LD in the `<head>` of `index.html` (name, telephone, founder, founding year, prices,
   payment methods) and rename the cart key `victoria-cart-v1` in `js/main-v6.js`.

## Content still needed from Victoria

- Her **logo**, if she has one: the comment in the header of `index.html` says where to add it.
- A **portrait** or workshop photo for the *À propos* section (the page works without it).
- Her **Instagram / Facebook / TikTok** addresses, to add to the footer.
- A **confirmation of everything written on the page**: prices, hours (8 h to 20 h), payment methods, delivery
  zones and conditions, and the "since 2023" line. These come from the original text and were not changed.
- Two or three **real customer comments**, with their permission, for a testimonial block.
- If an **international delivery** or a delivery price list is offered, say so on the page: it is currently "case by case".

## Technical notes

- Fraunces and Jost load from Google Fonts (the only external requests). The DevBF content-security policy allows
  exactly that, and `tools/build_fonts.py` leaves this page alone for that reason. To host the fonts locally
  instead: download the WOFF2 files, add `@font-face` rules to `css/style-v6.css`, remove the two Google Fonts
  `<link>` tags in `index.html`, and (on DevBF) drop the two Google domains from the policy in `_headers`.
- The order form never leaves the browser: it builds the message and opens `wa.me/22607355584`.
  The cart is saved in the visitor's browser only (`localStorage`, key `victoria-cart-v1`).
- Keyboard use, screen readers, dark mode, reduced motion and phone widths from 320 px were tested.
