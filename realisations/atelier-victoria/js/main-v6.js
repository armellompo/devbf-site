/* L'Atelier de Victoria : catalogue, panier et commande par WhatsApp.
   Pas de framework, aucune requête vers un autre site. Pour ajouter une création : ajoutez un bloc dans `products`
   (ref, name, category, categoryLabel, price, priceMin, leadTime, description, image, imageAlt).
   `srcset` est facultatif : il propose des versions plus légères de la photo aux téléphones. */
'use strict';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const WHATSAPP_NUMBER = '22607355584';
const GENERIC_MESSAGE = 'Bonjour l’Atelier de Victoria, je viens de votre site et je souhaite des informations sur vos créations.';
const CUSTOM_MESSAGE = 'Bonjour, je souhaite une création sur mesure. Voici mon idée : couleur, taille, usage et photo si possible.';

function buildWaLink(message) { return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`; }
document.querySelectorAll('[data-wa-generic]').forEach(link => { link.href = buildWaLink(GENERIC_MESSAGE); link.target = '_blank'; link.rel = 'noopener noreferrer'; });
document.querySelectorAll('[data-wa-custom]').forEach(link => { link.href = buildWaLink(CUSTOM_MESSAGE); link.target = '_blank'; link.rel = 'noopener noreferrer'; });

const products = [
    {
        "ref": "VIC-ACC-001",
        "name": "Étui AirPods tressé",
        "category": "accessoires",
        "categoryLabel": "Accessoires",
        "price": "À partir de 1 500 FCFA",
        "priceMin": 1500,
        "leadTime": "1 à 3 jours",
        "description": "Étui crochet avec dragonne assortie pour protéger et transporter vos écouteurs.",
        "image": "assets/images/products/accessoire-etui-airpods.webp",
        "srcset": "assets/images/products/accessoire-etui-airpods-480.webp 480w, assets/images/products/accessoire-etui-airpods-720.webp 720w, assets/images/products/accessoire-etui-airpods.webp 900w",
        "imageAlt": "Étui AirPods en crochet beige et blanc avec dragonne"
    },
    {
        "ref": "VIC-ACC-002",
        "name": "Mini pochette téléphone",
        "category": "accessoires",
        "categoryLabel": "Accessoires",
        "price": "À partir de 1 500 FCFA",
        "priceMin": 1500,
        "leadTime": "2 à 4 jours",
        "description": "Petite pochette bandoulière en crochet, légère et pratique au quotidien.",
        "image": "assets/images/products/accessoire-pochette-telephone.webp",
        "srcset": "assets/images/products/accessoire-pochette-telephone-480.webp 480w, assets/images/products/accessoire-pochette-telephone-720.webp 720w, assets/images/products/accessoire-pochette-telephone.webp 900w",
        "imageAlt": "Mini pochette téléphone en crochet bleu clair"
    },
    {
        "ref": "VIC-ACC-003",
        "name": "Bandeaux crochet",
        "category": "accessoires",
        "categoryLabel": "Accessoires",
        "price": "À partir de 1 500 FCFA",
        "priceMin": 1500,
        "leadTime": "1 à 3 jours",
        "description": "Bandeaux faits main proposés dans plusieurs couleurs pour compléter une tenue.",
        "image": "assets/images/products/accessoire-bandeaux.webp",
        "srcset": "assets/images/products/accessoire-bandeaux-480.webp 480w, assets/images/products/accessoire-bandeaux-720.webp 720w, assets/images/products/accessoire-bandeaux.webp 904w",
        "imageAlt": "Bandeaux crochet bordeaux rose beige et blanc"
    },
    {
        "ref": "VIC-ACC-004",
        "name": "Chouchous volantés",
        "category": "accessoires",
        "categoryLabel": "Accessoires",
        "price": "À partir de 1 500 FCFA",
        "priceMin": 1500,
        "leadTime": "1 à 3 jours",
        "description": "Chouchous crochet à volants, disponibles dans plusieurs associations de couleurs.",
        "image": "assets/images/products/accessoire-chouchous.webp",
        "srcset": "assets/images/products/accessoire-chouchous-480.webp 480w, assets/images/products/accessoire-chouchous.webp 736w",
        "imageAlt": "Collection de chouchous en crochet multicolores"
    },
    {
        "ref": "VIC-ACC-005",
        "name": "Bandana fleurs",
        "category": "accessoires",
        "categoryLabel": "Accessoires",
        "price": "À partir de 1 500 FCFA",
        "priceMin": 1500,
        "leadTime": "2 à 4 jours",
        "description": "Bandana crochet à motifs floraux, doux et personnalisable selon vos couleurs.",
        "image": "assets/images/products/accessoire-bandana-fleurs.webp",
        "srcset": "assets/images/products/accessoire-bandana-fleurs-480.webp 480w, assets/images/products/accessoire-bandana-fleurs-720.webp 720w, assets/images/products/accessoire-bandana-fleurs.webp 900w",
        "imageAlt": "Bandana en crochet blanc rose et orange à fleurs"
    },
    {
        "ref": "VIC-ACC-006",
        "name": "Bonnets à volants",
        "category": "accessoires",
        "categoryLabel": "Accessoires",
        "price": "À partir de 1 500 FCFA",
        "priceMin": 1500,
        "leadTime": "2 à 4 jours",
        "description": "Bonnets crochet décorés de volants, proposés en plusieurs couleurs.",
        "image": "assets/images/products/accessoire-bonnets-volantes.webp",
        "srcset": "assets/images/products/accessoire-bonnets-volantes-480.webp 480w, assets/images/products/accessoire-bonnets-volantes.webp 736w",
        "imageAlt": "Trois bonnets crochet à volants rose bleu et violet"
    },
    {
        "ref": "VIC-SAC-001",
        "name": "Cabas Granny Soleil",
        "category": "sacs",
        "categoryLabel": "Sacs",
        "price": "À partir de 12 000 FCFA",
        "priceMin": 12000,
        "leadTime": "6 à 10 jours",
        "description": "Cabas crochet à carrés granny dans des tons blanc, bleu, vert et jaune.",
        "image": "assets/images/products/sac-granny-soleil.webp",
        "srcset": "assets/images/products/sac-granny-soleil-480.webp 480w, assets/images/products/sac-granny-soleil-720.webp 720w, assets/images/products/sac-granny-soleil.webp 1080w",
        "imageAlt": "Sac cabas crochet granny blanc bleu vert et jaune"
    },
    {
        "ref": "VIC-SAC-002",
        "name": "Cabas Granny Rosé",
        "category": "sacs",
        "categoryLabel": "Sacs",
        "price": "À partir de 12 000 FCFA",
        "priceMin": 12000,
        "leadTime": "6 à 10 jours",
        "description": "Cabas crochet noir à motifs granny roses pour un style plus affirmé.",
        "image": "assets/images/products/sac-granny-rose.webp",
        "srcset": "assets/images/products/sac-granny-rose-480.webp 480w, assets/images/products/sac-granny-rose-720.webp 720w, assets/images/products/sac-granny-rose.webp 864w",
        "imageAlt": "Sac cabas crochet noir et rose à motifs granny"
    },
    {
        "ref": "VIC-SAC-003",
        "name": "Cabas Brun Épuré",
        "category": "sacs",
        "categoryLabel": "Sacs",
        "price": "À partir de 12 000 FCFA",
        "priceMin": 12000,
        "leadTime": "5 à 8 jours",
        "description": "Grand cabas brun en crochet au style minimaliste et facile à porter.",
        "image": "assets/images/products/sac-cabas-brun.webp",
        "srcset": "assets/images/products/sac-cabas-brun-480.webp 480w, assets/images/products/sac-cabas-brun-720.webp 720w, assets/images/products/sac-cabas-brun.webp 900w",
        "imageAlt": "Grand sac cabas brun en crochet"
    },
    {
        "ref": "VIC-SAC-004",
        "name": "Cabas Hibiscus",
        "category": "sacs",
        "categoryLabel": "Sacs",
        "price": "À partir de 12 000 FCFA",
        "priceMin": 12000,
        "leadTime": "6 à 10 jours",
        "description": "Cabas à grand motif floral, personnalisable dans différentes combinaisons de couleurs.",
        "image": "assets/images/products/sac-hibiscus.webp",
        "srcset": "assets/images/products/sac-hibiscus-480.webp 480w, assets/images/products/sac-hibiscus.webp 580w",
        "imageAlt": "Deux sacs cabas crochet à grand motif hibiscus"
    },
    {
        "ref": "VIC-SAC-005",
        "name": "Sac rayé Bordeaux",
        "category": "sacs",
        "categoryLabel": "Sacs",
        "price": "À partir de 12 000 FCFA",
        "priceMin": 12000,
        "leadTime": "5 à 8 jours",
        "description": "Sac souple rayé crème et bordeaux, pensé pour un look chaleureux et artisanal.",
        "image": "assets/images/products/sac-raye-bordeaux.webp",
        "srcset": "assets/images/products/sac-raye-bordeaux-480.webp 480w, assets/images/products/sac-raye-bordeaux.webp 736w",
        "imageAlt": "Sac crochet rayé crème et bordeaux suspendu"
    }
];

const productGrid = document.getElementById('productGrid');
const catalogEmpty = document.getElementById('catalogEmpty');
const state = { category: 'all' };
const CARD_SIZES = '(max-width: 680px) 86vw, (max-width: 1040px) 44vw, 360px';

function formatFcfa(value) { return new Intl.NumberFormat('fr-FR').format(value) + ' FCFA'; }
function productByRef(ref) { return products.find(p => p.ref === ref); }
function thumbOf(product) { return product.srcset ? product.srcset.split(',')[0].trim().split(' ')[0] : product.image; }

function createProductCard(product) {
    const set = product.srcset ? ` srcset="${product.srcset}" sizes="${CARD_SIZES}"` : '';
    return `
        <article class="product-card reveal" data-category="${product.category}" data-product-ref="${product.ref}">
            <div class="product-media" data-category="${product.category}">
                <img class="product-image" src="${product.image}"${set} alt="${product.imageAlt}" loading="lazy" decoding="async">
                <button type="button" class="product-view-hit" data-view-product="${product.ref}" aria-label="Voir ${product.name} en détail"><span>Voir en détail</span></button>
                <span class="product-ref">${product.ref}</span>
                <span class="product-status sur-commande">Sur commande</span>
            </div>
            <div class="product-body">
                <p class="product-category">${product.categoryLabel}</p>
                <h3><button type="button" class="product-title-button" data-view-product="${product.ref}">${product.name}</button></h3>
                <p class="product-desc">${product.description}</p>
                <ul class="product-meta"><li>Fait main</li><li>Délai indicatif : ${product.leadTime}</li></ul>
                <div class="product-footer">
                    <span class="product-price">${product.price}</span>
                    <button class="btn btn-primary product-btn" type="button" data-add-to-cart="${product.ref}">Ajouter</button>
                </div>
            </div>
        </article>`;
}

function renderProducts() {
    const filtered = products.filter(p => state.category === 'all' || p.category === state.category);
    productGrid.innerHTML = filtered.map(createProductCard).join('');
    if (catalogEmpty) catalogEmpty.hidden = filtered.length > 0;
    registerReveals();
}

function setActiveCategory(value) {
    document.querySelectorAll('[data-filter-category]').forEach(btn => {
        const on = btn.dataset.filterCategory === value;
        btn.classList.toggle('is-active', on);
        btn.setAttribute('aria-pressed', String(on));
    });
}
document.querySelectorAll('[data-filter-category]').forEach(btn => btn.addEventListener('click', () => {
    state.category = btn.dataset.filterCategory;
    setActiveCategory(state.category);
    renderProducts();
}));

/* Mobile menu */
const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.getElementById('primaryNav');
function setMenu(open) {
    primaryNav.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
}
menuToggle?.addEventListener('click', () => setMenu(!primaryNav.classList.contains('open')));
primaryNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('click', e => { if (primaryNav && !e.target.closest('.site-header') && primaryNav.classList.contains('open')) setMenu(false); });

/* Active nav link: follows the section in the middle of the screen, and clears at the top of the page */
const navAnchors = document.querySelectorAll('.primary-nav a[href^="#"]');
const navSections = Array.from(navAnchors).map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
if ('IntersectionObserver' in window) {
    const setActiveLink = id => navAnchors.forEach(a => {
        const on = a.getAttribute('href') === `#${id}`;
        a.classList.toggle('active', on);
        if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) setActiveLink(entry.target.id);
    }), { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    [document.getElementById('accueil'), ...navSections].filter(Boolean).forEach(section => sectionObserver.observe(section));
}

/* Reveal on scroll */
const revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries, observer) => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
}), { threshold: 0.12 }) : null;
function registerReveals() {
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
        if (prefersReducedMotion || !revealObserver) el.classList.add('visible'); else revealObserver.observe(el);
    });
}

/* Theme (the saved choice is applied before first paint by js/theme-init.js) */
const THEME_KEY = 'victoria-theme';
const themeToggles = document.querySelectorAll('[data-theme-toggle]');
const themeMeta = document.getElementById('themeColorMeta');
function currentTheme() { return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'; }
function applyTheme(theme, persist = true) {
    document.documentElement.dataset.theme = theme;
    if (persist) { try { localStorage.setItem(THEME_KEY, theme); } catch { /* storage blocked */ } }
    if (themeMeta) themeMeta.content = theme === 'dark' ? '#17130F' : '#FAF6EF';
    const dark = theme === 'dark';
    themeToggles.forEach(themeToggle => {
        themeToggle.setAttribute('aria-label', dark ? 'Activer le mode clair' : 'Activer le mode sombre');
        const icon = themeToggle.querySelector('.theme-toggle-icon');
        const text = themeToggle.querySelector('.theme-toggle-text');
        if (icon) icon.textContent = dark ? '☀' : '☾';
        if (text) text.textContent = dark ? 'Clair' : 'Sombre';
    });
}
applyTheme(currentTheme(), false);
themeToggles.forEach(themeToggle => themeToggle.addEventListener('click', () => applyTheme(currentTheme() === 'dark' ? 'light' : 'dark')));

/* Dialogs (product sheet and cart): the page behind is made inert, Tab stays inside, Escape closes, focus goes back */
const pageRegions = ['.skip-link', '.devbf-bar', '.site-header', 'main', '.site-footer', '.mobile-cta-bar', '.float-whatsapp']
    .flatMap(selector => Array.from(document.querySelectorAll(selector)));
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary';
let activeDialog = null;
let dialogOpener = null;

function openDialog(dialog, firstFocus) {
    activeDialog = dialog;
    dialogOpener = document.activeElement;
    pageRegions.forEach(el => el.setAttribute('inert', ''));
    dialog.classList.add('open');
    dialog.setAttribute('aria-hidden', 'false');
    setTimeout(() => (dialog.querySelector(firstFocus) || dialog).focus({ preventScroll: true }), 30);
}
function closeDialog(dialog) {
    if (!dialog.classList.contains('open')) return false;
    dialog.classList.remove('open');
    dialog.setAttribute('aria-hidden', 'true');
    pageRegions.forEach(el => el.removeAttribute('inert'));
    if (activeDialog === dialog) activeDialog = null;
    const back = dialogOpener;
    dialogOpener = null;
    if (back && back.isConnected && typeof back.focus === 'function') back.focus({ preventScroll: true });
    return true;
}
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        if (activeDialog === productModal) closeProductModal();
        else if (activeDialog === cartDrawer) closeCart();
        else if (primaryNav?.classList.contains('open')) { setMenu(false); menuToggle?.focus(); }
        return;
    }
    if (e.key === 'Tab' && activeDialog) {
        const items = Array.from(activeDialog.querySelectorAll(FOCUSABLE)).filter(el => el.offsetParent !== null);
        if (!items.length) { e.preventDefault(); return; }
        const first = items[0];
        const last = items[items.length - 1];
        if (!activeDialog.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
        else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
});

/* Product detail modal */
const productModal = document.getElementById('productModal');
const productModalBackdrop = document.querySelector('[data-product-modal-backdrop]');
const productModalImage = document.getElementById('productModalImage');
const productModalCategory = document.getElementById('productModalCategory');
const productModalTitle = document.getElementById('productModalTitle');
const productModalPrice = document.getElementById('productModalPrice');
const productModalDescription = document.getElementById('productModalDescription');
const productModalDelay = document.getElementById('productModalDelay');
const productModalRef = document.getElementById('productModalRef');
const productModalWhatsApp = document.querySelector('[data-modal-whatsapp]');
let activeProductRef = null;

function openProductModal(ref) {
    const p = productByRef(ref);
    if (!p || !productModal) return;
    activeProductRef = ref;
    productModalImage.src = p.image;
    productModalImage.alt = p.imageAlt;
    productModalCategory.textContent = p.categoryLabel;
    productModalTitle.textContent = p.name;
    productModalPrice.textContent = p.price;
    productModalDescription.textContent = p.description;
    productModalDelay.textContent = p.leadTime;
    productModalRef.textContent = p.ref;
    if (productModalWhatsApp) productModalWhatsApp.href = buildWaLink(`Bonjour, je souhaite des informations sur ${p.name} (${p.ref}) vu sur votre site.`);
    productModalBackdrop.hidden = false;
    document.body.classList.add('product-modal-open');
    openDialog(productModal, '[data-product-modal-close]');
}
function closeProductModal() {
    if (!productModal || !closeDialog(productModal)) return;
    productModalBackdrop.hidden = true;
    document.body.classList.remove('product-modal-open');
    activeProductRef = null;
}

/* Cart (kept in this browser only) */
const CART_KEY = 'victoria-cart-v1';
let cart = [];
try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    if (Array.isArray(saved)) {
        cart = saved
            .filter(item => item && typeof item.ref === 'string' && productByRef(item.ref) && Number.isInteger(item.qty) && item.qty > 0)
            .map(item => ({ ref: item.ref, qty: Math.min(item.qty, 99) }));
    }
} catch { cart = []; }
const cartDrawer = document.getElementById('cartDrawer');
const cartBackdrop = document.querySelector('[data-cart-backdrop]');
const cartItems = document.getElementById('cartItems');
const cartEmpty = document.getElementById('cartEmpty');
const cartTotal = document.getElementById('cartTotal');
const orderForm = document.getElementById('orderForm');
const orderStatus = document.getElementById('orderStatus');

function saveCart() { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch { /* storage blocked: the cart lives until the page is closed */ } hideOrderStatus(); updateCartUI(); }
function cartQty() { return cart.reduce((n, item) => n + item.qty, 0); }
function cartMinimum() { return cart.reduce((sum, item) => { const p = productByRef(item.ref); return sum + (p ? p.priceMin * item.qty : 0); }, 0); }
function updateCounts() { document.querySelectorAll('[data-cart-count]').forEach(el => { el.textContent = cartQty(); }); }
function addToCart(ref) { const found = cart.find(i => i.ref === ref); if (found) found.qty = Math.min(found.qty + 1, 99); else cart.push({ ref, qty: 1 }); saveCart(); openCart(); }
function changeQty(ref, delta) { const item = cart.find(i => i.ref === ref); if (!item) return; item.qty = Math.min(item.qty + delta, 99); if (item.qty <= 0) cart = cart.filter(i => i.ref !== ref); saveCart(); }
function removeFromCart(ref) { cart = cart.filter(i => i.ref !== ref); saveCart(); }
function updateCartUI() {
    updateCounts();
    if (!cartItems) return;
    cartEmpty.hidden = cart.length > 0;
    cartItems.innerHTML = cart.map(item => {
        const p = productByRef(item.ref);
        if (!p) return '';
        return `
    <div class="cart-item">
      <img src="${thumbOf(p)}" alt="${p.imageAlt}" width="82" height="82" decoding="async">
      <div class="cart-item-info"><strong>${p.name}</strong><span>${p.price}</span>
        <div class="qty-control"><button type="button" data-qty-minus="${p.ref}" aria-label="Retirer une unité de ${p.name}">−</button><span aria-live="polite">${item.qty}</span><button type="button" data-qty-plus="${p.ref}" aria-label="Ajouter une unité de ${p.name}">+</button><button type="button" class="cart-remove" data-remove-item="${p.ref}">Retirer</button></div>
      </div>
    </div>`;
    }).join('');
    cartTotal.textContent = formatFcfa(cartMinimum());
}
function openCart() {
    if (!cartDrawer) return;
    setMenu(false);
    cartBackdrop.hidden = false;
    document.body.classList.add('cart-open');
    openDialog(cartDrawer, '[data-cart-close]');
}
function closeCart() {
    if (!cartDrawer || !closeDialog(cartDrawer)) return;
    cartBackdrop.hidden = true;
    document.body.classList.remove('cart-open');
    hideOrderStatus();
}

/* Message under the order button (replaces browser pop-ups) */
function hideOrderStatus() { if (orderStatus) { orderStatus.hidden = true; orderStatus.replaceChildren(); } }
function showOrderStatus(text, kind, link) {
    if (!orderStatus) return;
    orderStatus.replaceChildren();
    orderStatus.dataset.kind = kind;
    const p = document.createElement('p');
    p.textContent = text;
    orderStatus.append(p);
    if (link) {
        const a = document.createElement('a');
        a.className = 'btn btn-outline order-status-link';
        a.href = link;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = 'Ouvrir WhatsApp';
        orderStatus.append(a);
    }
    orderStatus.hidden = false;
}

document.addEventListener('click', e => {
    const view = e.target.closest('[data-view-product]'); if (view) { openProductModal(view.dataset.viewProduct); return; }
    const productCard = e.target.closest('.product-card[data-product-ref]');
    if (productCard && !e.target.closest('button,a,input,select,textarea')) { openProductModal(productCard.dataset.productRef); return; }
    if (e.target.closest('[data-product-modal-close]') || e.target === productModal || e.target.matches('[data-product-modal-backdrop]')) { closeProductModal(); return; }
    const modalAdd = e.target.closest('[data-modal-add]'); if (modalAdd && activeProductRef) { const ref = activeProductRef; closeProductModal(); addToCart(ref); return; }
    const add = e.target.closest('[data-add-to-cart]'); if (add) { addToCart(add.dataset.addToCart); return; }
    if (e.target.closest('[data-cart-open]')) { openCart(); return; }
    if (e.target.closest('[data-cart-close]') || e.target.matches('[data-cart-backdrop]')) { closeCart(); return; }
    const plus = e.target.closest('[data-qty-plus]'); if (plus) { changeQty(plus.dataset.qtyPlus, 1); return; }
    const minus = e.target.closest('[data-qty-minus]'); if (minus) { changeQty(minus.dataset.qtyMinus, -1); return; }
    const remove = e.target.closest('[data-remove-item]'); if (remove) { removeFromCart(remove.dataset.removeItem); }
});

orderForm?.addEventListener('submit', e => {
    e.preventDefault();
    if (cart.length === 0) { showOrderStatus('Votre panier est vide : ajoutez d’abord une création, puis envoyez la commande.', 'error'); return; }
    const fd = new FormData(orderForm);
    const clean = name => String(fd.get(name) || '').trim();
    const lines = cart.map(item => { const p = productByRef(item.ref); return `• ${item.qty} × ${p.name} (${p.ref}) — ${p.price}`; });
    const message = [
        'Bonjour L’Atelier de Victoria, je souhaite confirmer cette commande préparée sur votre site :', '', ...lines, '',
        `Total minimum estimé : ${formatFcfa(cartMinimum())}`,
        'Le prix final reste à confirmer par l’atelier.', '',
        `Nom : ${clean('customerName')}`, `Téléphone : ${clean('customerPhone')}`, `Ville : ${clean('customerCity')}`,
        `Réception : ${clean('deliveryMethod')}`, `Paiement souhaité : ${clean('paymentMethod')}`,
        `Précisions : ${clean('orderNote') || 'Aucune'}`
    ].join('\n');
    const link = buildWaLink(message);
    window.open(link, '_blank', 'noopener,noreferrer');
    showOrderStatus('Votre commande est prête dans WhatsApp : envoyez le message pour la transmettre à l’atelier. Si WhatsApp ne s’est pas ouvert, touchez le bouton ci-dessous.', 'ok', link);
});

renderProducts(); registerReveals(); updateCartUI();
const year = document.getElementById('current-year'); if (year) year.textContent = new Date().getFullYear();
