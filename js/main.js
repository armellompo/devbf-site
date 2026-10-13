const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Le stockage du navigateur peut être indisponible (navigation privée, réglages stricts). */
function readStorage(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
}

function writeStorage(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* stockage indisponible */ }
}

/* Numéro WhatsApp : lu dans le bouton flottant, donc défini à un seul endroit (index.html). */
const waFloatLink = document.querySelector('.whatsapp-float');
const WA_BASE = waFloatLink ? waFloatLink.href.split('?')[0] : 'https://wa.me/';

/* Statistiques optionnelles : ne fait rien tant qu'aucun script Plausible ou Umami n'est activé dans index.html. */
function track(name, props) {
    try {
        if (typeof window.plausible === 'function') {
            window.plausible(name, props ? { props } : undefined);
        }
        if (window.umami && typeof window.umami.track === 'function') {
            window.umami.track(name, props);
        }
    } catch (e) { /* une statistique ne doit jamais bloquer le site */ }
}

/* Phase de capture : fonctionne même si un autre élément arrête la propagation du clic. */
document.addEventListener('click', (e) => {
    const waLink = e.target.closest('a[data-source]');
    if (waLink) track('whatsapp_click', { source: waLink.dataset.source });

    const demoLink = e.target.closest('a[data-demo]');
    if (demoLink) track('demo_open', { from: demoLink.dataset.demo });
}, true);

/* ========================================= */
/* 1. THEME TOGGLE                           */
/* ========================================= */
const body = document.body;
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('i');
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

function applyTheme(isLight, persist = true) {
    body.classList.toggle('light-mode', isLight);
    themeIcon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
    themeToggle.setAttribute(
        'aria-label',
        isLight ? 'Activer le thème sombre' : 'Activer le thème clair'
    );

    if (themeColorMeta) {
        themeColorMeta.setAttribute('content', isLight ? '#f6f7f9' : '#05050a');
    }

    if (persist) {
        writeStorage('theme', isLight ? 'light' : 'dark');
    }
}

const storedTheme = readStorage('theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

/* Clair par défaut ; sombre si le visiteur l'a choisi ou si son appareil est en mode sombre. */
applyTheme(!(storedTheme ? storedTheme === 'dark' : systemPrefersDark), false);

themeToggle.addEventListener('click', () => {
    applyTheme(!body.classList.contains('light-mode'), true);
});

/* ========================================= */
/* 2. MOBILE MENU                            */
/* ========================================= */
const menuToggle = document.querySelector('.menu-toggle');
const menuIcon = menuToggle.querySelector('i');
const navLinks = document.getElementById('navLinks');

function setMenu(open) {
    navLinks.classList.toggle('active', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    menuIcon.className = open ? 'fas fa-times' : 'fas fa-bars';
}

menuToggle.addEventListener('click', () => {
    setMenu(!navLinks.classList.contains('active'));
});

navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setMenu(false));
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        setMenu(false);
    }
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('#navbar') && navLinks.classList.contains('active')) {
        setMenu(false);
    }
});

/* ========================================= */
/* 3. HERO WORD ROTATOR + MOCK SCENES        */
/* ========================================= */
const words = Array.from(document.querySelectorAll('.rotator-word'));
const scenes = Array.from(document.querySelectorAll('.mock-scene'));
const phoneTitle = document.getElementById('phoneTitle');
const phonePay = document.getElementById('phonePay');

const sceneCopy = [
    { title: 'Commande en ligne', pay: 'Payer' },
    { title: 'Paiement boutique', pay: 'Commander' },
    { title: 'Carte du jour', pay: 'Commander' },
    { title: 'Contact rapide', pay: 'WhatsApp' }
];

function setActiveScene(index) {
    scenes.forEach(scene => {
        scene.classList.toggle('active', Number(scene.dataset.scene) === index);
    });

    if (phoneTitle && sceneCopy[index]) {
        phoneTitle.textContent = sceneCopy[index].title;
    }

    if (phonePay && sceneCopy[index]) {
        phonePay.textContent = sceneCopy[index].pay;
    }
}

if (!prefersReducedMotion && words.length > 1) {
    let currentWord = 0;

    setInterval(() => {
        const nextWord = (currentWord + 1) % words.length;

        words[currentWord].classList.remove('active');
        words[currentWord].classList.add('exit');

        setTimeout(() => {
            words[currentWord].classList.remove('exit');
            words[nextWord].classList.add('active');
            currentWord = nextWord;
            setActiveScene(nextWord);
        }, 450);
    }, 2800);
} else {
    setActiveScene(0);
}

/* ========================================= */
/* 4. PAYBACK CALCULATOR                     */
/* ========================================= */
const calcPanier = document.getElementById('calc-panier');
const calcMarge = document.getElementById('calc-marge');
const valPanier = document.getElementById('val-panier');
const valMarge = document.getElementById('val-marge');
const calcTotal = document.getElementById('calc-total');
const calcSub = document.getElementById('calc-sub');

/* Séparateur de milliers fait main : ne dépend pas des données de langue du navigateur. */
function formatNumber(value) {
    return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
}

function updateCalculator() {
    const planInput = document.querySelector('input[name="calc_plan"]:checked');
    const price = Number(planInput ? planInput.value : 150000);
    const panier = Number(calcPanier.value);
    const marge = Number(calcMarge.value);

    valPanier.textContent = formatNumber(panier);
    valMarge.textContent = `${marge}%`;

    const profitPerOrder = panier * (marge / 100);
    const orders = Math.max(1, Math.ceil(price / profitPerOrder));
    const perMonth = Math.ceil(orders / 12);

    calcTotal.textContent = `${formatNumber(orders)} commande${orders > 1 ? 's' : ''}`;
    calcSub.textContent = orders > 600
        ? 'C’est beaucoup : avec ces chiffres, mieux vaut en parler ensemble pour trouver ce qui est réaliste.'
        : `soit environ ${formatNumber(perMonth)} par mois pour être remboursé en 12 mois`;
}

[calcPanier, calcMarge].forEach(el => {
    el.addEventListener('input', updateCalculator);
});

document.querySelectorAll('input[name="calc_plan"]').forEach(radio => {
    radio.addEventListener('change', updateCalculator);
});

updateCalculator();

/* ========================================= */
/* 5. SPOTLIGHT HOVER EFFECT                 */
/* ========================================= */
const bentoGrid = document.getElementById('bentoGrid');
const bentoCards = Array.from(document.querySelectorAll('.bento-card'));
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

let spotlightRAF = null;
let lastPointerEvent = null;

function updateSpotlight() {
    if (!lastPointerEvent) return;

    const { clientX, clientY } = lastPointerEvent;

    bentoCards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });

    spotlightRAF = null;
}

if (bentoGrid && canHover) {
    bentoGrid.addEventListener('pointermove', (e) => {
        lastPointerEvent = e;

        if (!spotlightRAF) {
            spotlightRAF = requestAnimationFrame(updateSpotlight);
        }
    }, { passive: true });

    bentoGrid.addEventListener('pointerleave', () => {
        bentoCards.forEach(card => {
            card.style.setProperty('--mouse-x', '50%');
            card.style.setProperty('--mouse-y', '50%');
        });
    });
}

/* ========================================= */
/* 6. ACTIVE NAV LINK ON SCROLL              */
/* ========================================= */
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]:not(.nav-cta)');
const navSectionIds = Array.from(navAnchors)
    .map(anchor => anchor.getAttribute('href').slice(1));

const sections = navSectionIds
    .map(id => document.getElementById(id))
    .filter(Boolean);

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');

            navAnchors.forEach(anchor => {
                anchor.classList.toggle(
                    'active',
                    anchor.getAttribute('href') === `#${id}`
                );
            });
        }
    });
}, {
    rootMargin: '-45% 0px -50% 0px',
    threshold: 0
});

sections.forEach(section => sectionObserver.observe(section));

/* ========================================= */
/* 7. REVEAL ON SCROLL                       */
/* ========================================= */
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.12
});

revealElements.forEach(el => revealObserver.observe(el));

/* ========================================= */
/* 7b. SECTIONS QUI S'OUVRENT AU CLIC        */
/* ========================================= */
/* Les blocs <details class="fold"> s'ouvrent seuls au clic (sans JavaScript non plus). Ce code ajoute :
   l'ouverture automatique quand un lien ou une adresse (#...) vise un élément caché dans un bloc,
   le bouton « Réduire » du bas d'un long bloc, et une statistique d'ouverture. */
const folds = Array.from(document.querySelectorAll('details.fold'));

function foldOf(el) {
    if (!el) return null;
    return el.matches('details.fold') ? el : el.closest('details.fold');
}

function targetFromHash(hash) {
    if (!hash || hash.length < 2) return null;
    try {
        return document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch (e) {
        return null;
    }
}

/* Ouvre le bloc qui contient la cible, puis la montre : le navigateur n'a pas pu défiler vers un élément caché. */
function revealHashTarget(hash) {
    const target = targetFromHash(hash);
    const fold = foldOf(target);
    if (!fold || fold.open) return;
    fold.open = true;
    target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
}

document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const fold = foldOf(targetFromHash(link.getAttribute('href')));
    if (fold) fold.open = true;
});

window.addEventListener('hashchange', () => revealHashTarget(location.hash));
revealHashTarget(location.hash);

document.querySelectorAll('.fold-close').forEach(button => {
    button.addEventListener('click', () => {
        const fold = foldOf(button);
        if (!fold) return;
        fold.open = false;

        /* Le bloc se referme sous le doigt : on ramène sa barre à l'écran pour ne pas perdre le visiteur. */
        const bar = fold.querySelector('summary');
        const top = bar.getBoundingClientRect().top;
        if (top < 70 || top > window.innerHeight - 70) {
            bar.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
        }
        bar.focus({ preventScroll: true });
    });
});

folds.forEach(fold => {
    fold.addEventListener('toggle', () => {
        if (fold.open) track('fold_open', { fold: fold.id });
    });
});

/* ========================================= */
/* 8. TOAST NOTIFICATION                     */
/* ========================================= */
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const toastIcon = document.getElementById('toastIcon');
let toastTimer = null;

function showToast(message, type = 'success') {
    clearTimeout(toastTimer);

    toastMessage.textContent = message;
    toastIcon.className = type === 'success'
        ? 'fas fa-check-circle'
        : 'fas fa-triangle-exclamation';

    toast.classList.toggle('success', type === 'success');
    toast.classList.toggle('error', type !== 'success');
    toast.classList.add('show');

    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 4500);
}

/* ========================================= */
/* 9. SHARED FORM HELPERS                    */
/* ========================================= */
const projectSelect = document.getElementById('project_type');
const budgetSelect = document.getElementById('budget');
const messageField = document.getElementById('message');
const contactSection = document.getElementById('contact');
const nameField = document.getElementById('name');

function scrollToContact() {
    showFormAgain();
    contactSection.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start'
    });

    setTimeout(() => {
        nameField.focus({ preventScroll: true });
    }, 700);
}

function setMessageIfEmpty(text) {
    if (!messageField.value.trim()) {
        messageField.value = text;
    }
}

/* ========================================= */
/* 10. PRICING PLAN SELECTOR                 */
/* ========================================= */
const planConfig = {
    mini: {
        label: 'Mini',
        project: 'Site vitrine',
        budget: 'Moins de 75 000 FCFA'
    },
    starter: {
        label: 'Starter',
        project: 'Site vitrine',
        budget: '150 000 - 350 000 FCFA'
    },
    business: {
        label: 'Business',
        project: 'E-commerce / Mobile Money',
        budget: '350 000 - 800 000 FCFA'
    },
    enterprise: {
        label: 'Enterprise',
        project: 'Application sur mesure',
        budget: 'Plus de 800 000 FCFA'
    }
};

function selectPlan(planKey) {
    const config = planConfig[planKey];
    if (!config) return;

    projectSelect.value = config.project;
    budgetSelect.value = config.budget;
    setMessageIfEmpty(`Bonjour, je suis intéressé par la formule ${config.label}.`);
    scrollToContact();
    showToast(`Formule ${config.label} sélectionnée.`, 'success');
    track('plan_select', { plan: planKey });
}

document.querySelectorAll('[data-plan]').forEach(button => {
    button.addEventListener('click', () => {
        selectPlan(button.dataset.plan);
    });
});

/* ========================================= */
/* 11. PORTFOLIO CONCEPT MODAL + PHOTOS      */
/* ========================================= */
const caseModal = document.getElementById('caseModal');
const modalIcon = document.getElementById('modalIcon');
const modalEyebrow = document.getElementById('modalEyebrow');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalTags = document.getElementById('modalTags');
const modalCta = document.getElementById('modalCta');
const modalPhoto = document.getElementById('modalPhoto');
const modalPreview = document.querySelector('.case-modal-preview');

const caseData = {
    restaurant: {
        icon: 'fas fa-utensils',
        eyebrow: 'Restaurant / Maquis',
        title: 'Un menu qui devient un canal de commande',
        desc: 'Une expérience mobile simple pour découvrir les plats, contacter le restaurant et lancer une commande sans chercher l’information sur plusieurs plateformes.',
        tags: ['Menu mobile', 'Commande WhatsApp', 'Galerie', 'Mobile Money selon accès'],
        // Mobile Money est inclus à partir de la formule Business (350k) : même budget que planConfig.business
        project: planConfig.business.project,
        budget: planConfig.business.budget,
        demo: { href: 'demo/restaurant/index.html', label: 'Essayer la démo en ligne', from: 'modal' }
    },
    immobilier: {
        icon: 'fas fa-building',
        eyebrow: 'Agence immobilière',
        title: 'Des annonces plus lisibles et des contacts mieux qualifiés',
        desc: 'Le visiteur peut parcourir les biens, comprendre les détails importants et contacter rapidement l’agence depuis une fiche claire.',
        tags: ['Catalogue de biens', 'Filtres', 'Fiches détaillées', 'SEO local'],
        project: 'Site vitrine',
        budget: '150 000 - 350 000 FCFA'
    },
    boutique: {
        icon: 'fas fa-bag-shopping',
        eyebrow: 'Boutique / E-commerce',
        title: 'Vendre même après la fermeture',
        desc: 'Une boutique en ligne avec catalogue produits, commande WhatsApp ou paiement Mobile Money selon vos besoins et vos accès.',
        tags: ['Catalogue produits', 'Commande', 'Livraison', 'Mobile Money selon accès'],
        project: planConfig.business.project,
        budget: planConfig.business.budget,
        demo: { href: 'realisations/atelier-victoria/index.html', label: 'Voir une vraie boutique réalisée', from: 'modal-atelier' }
    }
};

const caseImages = {
    restaurant: {
        src: 'assets/images/concept-restaurant.webp',
        alt: 'Illustration : plat de restaurant, concept de site de commande en ligne'
    },
    immobilier: {
        src: 'assets/images/concept-immobilier.webp',
        alt: 'Illustration : maison moderne, concept de site immobilier'
    },
    boutique: {
        src: 'assets/images/concept-boutique.webp',
        alt: 'Illustration : tapis et textiles colorés suspendus dans une boutique, concept de site e-commerce'
    }
};

function markPhotoLoaded(img) {
    img.classList.add('loaded');

    const panel = img.closest('.case-screen, .case-modal-preview');
    if (panel) {
        panel.classList.add('has-photo');
    }
}

function handlePhotoError(img) {
    img.classList.remove('loaded');
    img.style.display = 'none';

    const panel = img.closest('.case-screen, .case-modal-preview');
    if (panel) {
        panel.classList.remove('has-photo');
    }
}

function initConceptPhotos(root = document) {
    root.querySelectorAll('.case-photo').forEach(img => {
        if (img.dataset.photoInit === 'true') return;

        img.dataset.photoInit = 'true';

        img.addEventListener('load', () => markPhotoLoaded(img));
        img.addEventListener('error', () => handlePhotoError(img));

        if (img.complete && img.naturalWidth > 0) {
            markPhotoLoaded(img);
        }
    });
}

initConceptPhotos();

let lastFocusedElement = null;

function openCase(caseKey) {
    const data = caseData[caseKey];
    if (!data) return;

    modalIcon.className = data.icon;
    modalEyebrow.textContent = data.eyebrow;
    modalTitle.textContent = data.title;
    modalDesc.textContent = data.desc;
    modalTags.innerHTML = data.tags.map(tag => `<span>${tag}</span>`).join('');

    modalCta.dataset.project = data.project;
    modalCta.dataset.budget = data.budget;
    modalCta.dataset.label = data.eyebrow;

    /* Lien vers un exemple à essayer : la démo pour le restaurant, la vraie boutique pour le concept boutique. */
    const modalDemo = document.getElementById('modalDemo');
    if (modalDemo) {
        const demo = data.demo;
        modalDemo.hidden = !demo;
        if (demo) {
            modalDemo.href = demo.href;
            modalDemo.dataset.demo = demo.from;
            const demoLabel = document.getElementById('modalDemoLabel');
            if (demoLabel) demoLabel.textContent = demo.label;
        }
    }

    if (modalPhoto) {
        modalPhoto.style.display = '';
        modalPhoto.classList.remove('loaded');
        modalPreview?.classList.remove('has-photo');

        const imgInfo = caseImages[caseKey];

        if (imgInfo) {
            modalPhoto.src = imgInfo.src;
            modalPhoto.alt = imgInfo.alt;

            if (modalPhoto.complete && modalPhoto.naturalWidth > 0) {
                markPhotoLoaded(modalPhoto);
            }
        }
    }

    lastFocusedElement = document.activeElement;
    caseModal.hidden = false;
    body.classList.add('modal-open');

    const closeBtn = caseModal.querySelector('.case-modal-close');
    if (closeBtn) closeBtn.focus();
}

function closeCaseModal() {
    caseModal.hidden = true;
    body.classList.remove('modal-open');

    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
    }
}

document.querySelectorAll('.case-card').forEach(card => {
    card.addEventListener('click', () => openCase(card.dataset.case));
});

document.querySelectorAll('.case-link').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openCase(btn.dataset.case);
    });
});

caseModal.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) {
        closeCaseModal();
    }
});

/* Échap ferme la fenêtre ; Tab reste à l'intérieur tant qu'elle est ouverte. */
document.addEventListener('keydown', (e) => {
    if (caseModal.hidden) return;

    if (e.key === 'Escape') {
        closeCaseModal();
        return;
    }

    if (e.key !== 'Tab') return;

    const focusable = Array.from(caseModal.querySelectorAll('a[href], button:not([disabled])'))
        .filter(el => !el.hidden && el.offsetParent !== null);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (!caseModal.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
    } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
    }
});

/* Le lien « démo » d'une carte ne doit pas ouvrir aussi la fenêtre du concept. */
document.querySelectorAll('.case-demo').forEach(link => {
    link.addEventListener('click', (e) => e.stopPropagation());
});

modalCta.addEventListener('click', () => {
    const project = modalCta.dataset.project;
    const budget = modalCta.dataset.budget;
    const label = modalCta.dataset.label;

    if (project) projectSelect.value = project;
    if (budget) budgetSelect.value = budget;
    setMessageIfEmpty(`Bonjour, je souhaite un projet similaire à : ${label}.`);

    closeCaseModal();
    scrollToContact();
    showToast(`Concept ${label} sélectionné.`, 'success');
});

/* ========================================= */
/* 12. CONTACT FORM                          */
/* ========================================= */
const form = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const emailField = document.getElementById('email');
const phoneField = document.getElementById('phone');

/* Le champ obligatoire dépend de la préférence de contact :
   WhatsApp / Appel -> téléphone requis ; Email -> email requis. */
function setRequired(field, isRequired) {
    field.required = isRequired;
    field.closest('.form-group').classList.toggle('is-required', isRequired);
}

function validatePhone() {
    const value = phoneField.value.trim();
    const digits = value.replace(/\D/g, '');

    if (value && (digits.length < 8 || digits.length > 15)) {
        phoneField.setCustomValidity('Entrez un numéro valide, par exemple +226 70 00 00 00.');
    } else {
        phoneField.setCustomValidity('');
    }
}

function syncContactRequirements() {
    const checked = form.querySelector('input[name="contact_preference"]:checked');
    const needsEmail = checked && checked.value === 'Email';

    setRequired(emailField, needsEmail);
    setRequired(phoneField, !needsEmail);
    validatePhone();
}

form.querySelectorAll('input[name="contact_preference"]').forEach(radio => {
    radio.addEventListener('change', syncContactRequirements);
});
phoneField.addEventListener('input', validatePhone);
syncContactRequirements();

const formSuccess = document.getElementById('formSuccess');
const formSuccessTitle = formSuccess.querySelector('h3');
const formSuccessText = formSuccess.querySelector('p');
const formSuccessWa = formSuccess.querySelector('a[data-source="form-success"]');
const formReset = document.getElementById('formReset');
const formFallback = document.getElementById('formFallback');
const formFallbackWa = document.getElementById('formFallbackWa');
const formModeNote = document.getElementById('formModeNote');

/* Tant qu'aucun identifiant Formspree n'est renseigné (YOUR_FORM_ID dans l'action du formulaire, index.html),
   le formulaire fonctionne sans service tiers : il prépare le message et ouvre WhatsApp,
   où le visiteur appuie sur « Envoyer ». Avec un identifiant, les messages arrivent par email. */
const WHATSAPP_MODE = form.action.includes('YOUR_FORM_ID');

/* Le message tel qu'il arrive dans WhatsApp : tout ce que le visiteur a saisi, une information par ligne.
   Sert aussi de secours quand l'envoi par Formspree échoue (réseau mobile instable). */
function buildWhatsappLink() {
    const value = (el) => (el ? el.value.trim() : '');
    const preference = form.querySelector('input[name="contact_preference"]:checked');
    const rows = [
        ['Nom', value(nameField)],
        ['Téléphone', value(phoneField)],
        ['Email', value(emailField)],
        ['Entreprise / boutique', value(document.getElementById('company'))],
        ['Ville', value(document.getElementById('city'))],
        ['Projet', projectSelect.value],
        ['Budget', budgetSelect.value],
        ['Préférence de contact', preference ? preference.value : '']
    ];
    const lines = ['Bonjour, je vous écris depuis devbf.com.'];
    rows.forEach(([label, text]) => {
        if (text) lines.push(`${label} : ${text}`);
    });

    const message = value(messageField);
    if (message) lines.push('', message);

    return `${WA_BASE}?text=${encodeURIComponent(lines.join('\n'))}`;
}

if (WHATSAPP_MODE) {
    submitBtn.innerHTML = '<i class="fab fa-whatsapp" aria-hidden="true"></i> Continuer sur WhatsApp';
    if (formModeNote) formModeNote.hidden = false;
    formSuccessTitle.textContent = 'Votre message est prêt';
    formSuccessText.textContent = 'WhatsApp s’est ouvert avec votre message déjà écrit. Appuyez sur «\u00a0Envoyer\u00a0» pour me le transmettre\u00a0: rien n’est envoyé avant. Si rien ne s’est ouvert, utilisez le bouton ci-dessous.';
    formSuccessWa.innerHTML = '<i class="fab fa-whatsapp" aria-hidden="true"></i> Ouvrir WhatsApp';
    formReset.textContent = 'Modifier mon message';
}

function showFormSuccess() {
    form.hidden = true;
    formSuccess.hidden = false;
    formSuccess.focus();
    formSuccess.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'center'
    });
}

function showFormAgain() {
    if (formSuccess && !formSuccess.hidden) {
        formSuccess.hidden = true;
        form.hidden = false;
    }
}

formReset.addEventListener('click', () => {
    showFormAgain();
    nameField.focus();
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formFallback.hidden = true;

    const honeypot = form.querySelector('input[name="company_website"]');

    if (honeypot && honeypot.value.trim() !== '') {
        /* Robot probable : on fait comme si tout allait bien, sans rien envoyer. */
        form.reset();
        syncContactRequirements();
        showFormSuccess();
        return;
    }

    if (WHATSAPP_MODE) {
        /* Le formulaire ne garde rien : le message part de WhatsApp, quand le visiteur l'envoie lui-même. */
        const link = buildWhatsappLink();
        formSuccessWa.href = link;
        track('form_sent', { project: projectSelect.value || 'non précisé', via: 'whatsapp' });
        window.open(link, '_blank', 'noopener');
        showFormSuccess();
        return;
    }

    const originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Envoi...';

    try {
        const response = await fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: {
                Accept: 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Form submission failed');
        }

        track('form_sent', { project: projectSelect.value || 'non précisé', via: 'formspree' });
        form.reset();
        syncContactRequirements();
        showFormSuccess();
    } catch (error) {
        console.warn(error);
        formFallbackWa.href = buildWhatsappLink();
        formFallback.hidden = false;
        formFallback.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'nearest' });
        showToast('Envoi impossible. Écrivez-moi directement sur WhatsApp.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
    }
});

/* Bouton « Demander mon audit » : pré-remplit le formulaire. */
const auditBtn = document.getElementById('auditBtn');

if (auditBtn) {
    auditBtn.addEventListener('click', () => {
        projectSelect.value = 'Audit gratuit';
        setMessageIfEmpty(
            'Bonjour, je voudrais un audit gratuit de ma présence en ligne.\n' +
            'Nom de mon restaurant ou de ma boutique : \n' +
            'Lien Google Maps, Facebook ou Instagram (si j’en ai un) : '
        );
        track('audit_request');
        scrollToContact();
        showToast('Audit gratuit sélectionné.', 'success');
    });
}

/* ========================================= */
/* 13. DYNAMIC YEAR                          */
/* ========================================= */
document.getElementById('current-year').textContent = new Date().getFullYear();