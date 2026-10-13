/* Démo « Saveurs du Faso » : menu, commande, message WhatsApp et paiement Mobile Money SIMULÉ.
   Rien n'est enregistré et aucun paiement réel n'a lieu. Voir la section « Démo » du README. */
(function () {
    'use strict';

    /* Numéro WhatsApp qui reçoit le message de test : remplacé par tools/configure.py (même numéro que le site). */
    var WA_NUMBER = '22675598412';
    var RESTAURANT = 'Saveurs du Faso';
    var DELIVERY_FEE = 500;
    var MAX_PER_ITEM = 20;

    /* ---------- petits outils ---------- */
    function $(sel, root) { return (root || document).querySelector(sel); }
    function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

    function esc(value) {
        return String(value).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    /* 2500 -> « 2 500 FCFA » (espaces insécables, sans dépendre des données de langue du navigateur). */
    function fmt(n) {
        return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
    }

    /* Statistiques optionnelles (Plausible ou Umami) : ne fait rien tant qu'aucun script n'est ajouté à la page. */
    function track(name, props) {
        try {
            if (typeof window.plausible === 'function') window.plausible(name, props ? { props: props } : undefined);
            if (window.umami && typeof window.umami.track === 'function') window.umami.track(name, props);
        } catch (e) { /* une statistique ne doit jamais bloquer la page */ }
    }

    document.addEventListener('click', function (e) {
        var link = e.target.closest('a[data-source]');
        if (link) track('whatsapp_click', { source: link.getAttribute('data-source') });
    }, true);

    /* Numéro à 8 chiffres, avec ou sans l'indicatif 226 : renvoie les 8 chiffres, ou null si le numéro n'est pas valide. */
    function cleanPhone(value) {
        var d = String(value).replace(/[\s.\-()]/g, '').replace(/^(\+|00)/, '');
        if (d.indexOf('226') === 0 && d.length === 11) d = d.slice(3);
        return /^\d{8}$/.test(d) ? d : null;
    }

    function spacedPhone(d) { return d.replace(/(\d{2})(?=\d)/g, '$1 '); }

    /* ---------- éléments de la page ---------- */
    var bar = $('#cartBar');
    var barCount = $('#barCount');
    var barTotal = $('#barTotal');
    var live = $('#live');
    var backdrop = $('#sheetBackdrop');
    var sheet = $('#sheet');
    var sheetTitle = $('#sheetTitle');
    var sheetBody = $('#sheetBody');
    var sheetClose = $('#sheetClose');

    var stepOrder = $('#stepOrder');
    var stepPay = $('#stepPay');
    var stepDone = $('#stepDone');
    var lines = $('#cartLines');
    var cartEmpty = $('#cartEmpty');
    var fName = $('#fName');
    var fPhone = $('#fPhone');
    var fAddress = $('#fAddress');
    var fNote = $('#fNote');
    var addressField = $('#addressField');
    var orderError = $('#orderError');
    var orderSubmit = $('#orderSubmit');
    var tSub = $('#tSub');
    var tFeeRow = $('#tFeeRow');
    var tFee = $('#tFee');
    var tTotal = $('#tTotal');

    var payAmount = $('#payAmount');
    var fMomo = $('#fMomo');
    var payError = $('#payError');
    var payConfirm = $('#payConfirm');
    var payBack = $('#payBack');
    var payWait = $('#payWait');

    var doneLead = $('#doneLead');
    var waPreview = $('#waPreview');
    var waSend = $('#waSend');
    var newOrder = $('#newOrder');

    /* ---------- le menu : lu directement dans la page (data-id, data-name, data-price) ---------- */
    var items = {};
    var order = [];
    var cart = {};

    $$('.item').forEach(function (el) {
        var id = el.getAttribute('data-id');
        items[id] = { id: id, name: el.getAttribute('data-name'), price: Number(el.getAttribute('data-price')), el: el };
        order.push(id);
    });

    function stepperHtml(it) {
        return '<div class="stepper" role="group" aria-label="' + esc(it.name) + ', quantité">' +
            '<button type="button" data-act="dec" aria-label="Moins : ' + esc(it.name) + '"><i class="fas fa-minus" aria-hidden="true"></i></button>' +
            '<output>0</output>' +
            '<button type="button" data-act="inc" aria-label="Plus : ' + esc(it.name) + '"><i class="fas fa-plus" aria-hidden="true"></i></button>' +
            '</div>';
    }

    order.forEach(function (id) {
        var it = items[id];
        $('.controls', it.el).innerHTML =
            '<button type="button" class="add" data-act="inc" aria-label="Ajouter ' + esc(it.name) + ' à ma commande">' +
            '<i class="fas fa-plus" aria-hidden="true"></i> Ajouter</button>' +
            stepperHtml(it).replace('class="stepper"', 'class="stepper" hidden');
    });

    function count() {
        return order.reduce(function (n, id) { return n + (cart[id] || 0); }, 0);
    }

    function subtotal() {
        return order.reduce(function (s, id) { return s + (cart[id] || 0) * items[id].price; }, 0);
    }

    function currentMode() {
        var checked = $('input[name="mode"]:checked');
        return checked ? checked.value : 'Sur place';
    }

    function deliveryFee() {
        return currentMode() === 'Livraison' && count() > 0 ? DELIVERY_FEE : 0;
    }

    function total() { return subtotal() + deliveryFee(); }

    function announce(text) {
        /* Zone « live » invisible : les lecteurs d'écran annoncent la quantité sans que le focus bouge. */
        live.textContent = '';
        window.setTimeout(function () { live.textContent = text; }, 30);
    }

    function updateItem(id) {
        var it = items[id];
        var q = cart[id] || 0;
        var add = $('.add', it.el);
        var step = $('.stepper', it.el);
        add.hidden = q > 0;
        step.hidden = q === 0;
        $('output', step).textContent = q;
        it.el.classList.toggle('in-cart', q > 0);
    }

    function updateBar() {
        var n = count();
        bar.hidden = n === 0;
        document.body.classList.toggle('has-cart', n > 0);
        barCount.textContent = n;
        barTotal.textContent = fmt(subtotal());
        bar.setAttribute('aria-label', 'Voir ma commande : ' + n + (n > 1 ? ' articles, ' : ' article, ') + fmt(subtotal()));
    }

    function updateTotals() {
        var fee = deliveryFee();
        tSub.textContent = fmt(subtotal());
        tFeeRow.hidden = fee === 0;
        tFee.textContent = fmt(fee);
        tTotal.textContent = fmt(total());
    }

    function updateLine(li) {
        var id = li.getAttribute('data-id');
        var q = cart[id] || 0;
        $('output', li).textContent = q;
        $('.sum', li).textContent = fmt(q * items[id].price);
    }

    function buildCartLines() {
        lines.innerHTML = '';
        order.forEach(function (id) {
            if (!cart[id]) return;
            var it = items[id];
            var li = document.createElement('li');
            li.className = 'cart-line';
            li.setAttribute('data-id', id);
            li.innerHTML = '<span class="name">' + esc(it.name) + '</span>' +
                '<span class="sum"></span>' +
                '<span class="unit">' + fmt(it.price) + ' l’unité</span>' +
                stepperHtml(it);
            lines.appendChild(li);
            updateLine(li);
        });
        cartEmpty.hidden = count() > 0;
        updateTotals();
    }

    function change(id, delta) {
        var q = Math.max(0, Math.min(MAX_PER_ITEM, (cart[id] || 0) + delta));
        if (q) cart[id] = q; else delete cart[id];
        updateItem(id);
        updateBar();
        updateTotals();
        announce(items[id].name + ' : ' + q + ' dans la commande. Total ' + fmt(subtotal()) + '.');
    }

    /* ---------- clics sur « Ajouter », « + » et « − » (carte du menu ou récapitulatif) ---------- */
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-act]');
        var holder = btn && btn.closest('[data-id]');
        if (!btn || !holder) return;

        var id = holder.getAttribute('data-id');
        var act = btn.getAttribute('data-act');
        var inSheet = !!btn.closest('#sheet');
        var neighbour = holder.nextElementSibling || holder.previousElementSibling;

        change(id, act === 'inc' ? 1 : -1);
        var q = cart[id] || 0;

        /* Le clavier garde le focus sur un bouton qui existe encore. */
        if (inSheet) {
            if (q) {
                updateLine(holder);
                $('[data-act="' + act + '"]', holder).focus();
            } else {
                holder.parentNode.removeChild(holder);
                cartEmpty.hidden = count() > 0;
                var next = neighbour && neighbour.classList.contains('cart-line') ? $('[data-act="dec"]', neighbour) : sheetClose;
                (next || sheetClose).focus();
            }
        } else if (q) {
            $('[data-act="' + (act === 'dec' ? 'dec' : 'inc') + '"]', $('.stepper', holder)).focus();
        } else {
            $('.add', holder).focus();
        }
    });

    /* ---------- onglets de catégories ---------- */
    var tabs = $$('.tab');
    var tabsInner = $('.tabs-inner');

    function setActiveTab(id) {
        tabs.forEach(function (t) {
            var on = t.getAttribute('href') === '#' + id;
            if (on) {
                t.setAttribute('aria-current', 'true');
                if (tabsInner) tabsInner.scrollLeft = Math.max(0, t.offsetLeft - 16);
            } else {
                t.removeAttribute('aria-current');
            }
        });
    }

    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) { if (en.isIntersecting) setActiveTab(en.target.id); });
        }, { rootMargin: '-30% 0px -60% 0px' });
        $$('.cat').forEach(function (c) { io.observe(c); });
    }

    /* ---------- fenêtre « Ma commande » ---------- */
    var lastFocus = null;
    var payToken = 0;

    function showStep(name) {
        stepOrder.hidden = name !== 'order';
        stepPay.hidden = name !== 'pay';
        stepDone.hidden = name !== 'done';
        sheetTitle.textContent = name === 'order' ? 'Ma commande' : (name === 'pay' ? 'Paiement' : 'Commande prête');
        sheetBody.scrollTop = 0;
    }

    function openSheet() {
        lastFocus = document.activeElement;
        buildCartLines();
        updateSubmitLabel();
        orderError.hidden = true;
        showStep('order');
        backdrop.hidden = false;
        sheet.hidden = false;
        document.body.classList.add('sheet-open');
        sheetClose.focus();
        track('demo_cart_open');
    }

    function closeSheet() {
        payToken++;              /* annule un paiement simulé en cours */
        setPaying(false);
        sheet.hidden = true;
        backdrop.hidden = true;
        document.body.classList.remove('sheet-open');
        if (lastFocus && lastFocus.focus && document.contains(lastFocus) && !lastFocus.hidden) {
            lastFocus.focus();
        } else {
            var fallback = $('.item .add:not([hidden])');
            if (fallback) fallback.focus();
        }
    }

    bar.addEventListener('click', openSheet);
    sheetClose.addEventListener('click', closeSheet);
    backdrop.addEventListener('click', closeSheet);

    /* Échap ferme la fenêtre ; Tab reste à l'intérieur tant qu'elle est ouverte. */
    document.addEventListener('keydown', function (e) {
        if (sheet.hidden) return;

        if (e.key === 'Escape' || e.key === 'Esc') {
            closeSheet();
            return;
        }
        if (e.key !== 'Tab') return;

        var focusable = $$('a[href], button, input, [tabindex="0"]', sheet).filter(function (el) {
            return !el.disabled && !el.hidden && el.offsetParent !== null;
        });
        if (!focusable.length) return;

        var first = focusable[0];
        var last = focusable[focusable.length - 1];

        if (!sheet.contains(document.activeElement) || document.activeElement === sheet) {
            e.preventDefault();
            first.focus();
        } else if (e.shiftKey && (document.activeElement === first || document.activeElement === stepDone)) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    });

    /* ---------- formulaire de commande ---------- */
    function showError(box, message, field) {
        box.textContent = message;
        box.hidden = false;
        if (field) {
            if (field.tagName === 'INPUT') field.setAttribute('aria-invalid', 'true');
            field.focus();
        }
    }

    [fName, fPhone, fAddress, fMomo].forEach(function (input) {
        input.addEventListener('input', function () { input.removeAttribute('aria-invalid'); });
    });

    function updateSubmitLabel() {
        var momo = $('input[name="pay"]:checked').value === 'momo';
        orderSubmit.innerHTML = momo
            ? 'Continuer vers le paiement <i class="fas fa-arrow-right" aria-hidden="true"></i>'
            : 'Préparer mon message WhatsApp <i class="fab fa-whatsapp" aria-hidden="true"></i>';
    }

    $$('input[name="mode"]').forEach(function (radio) {
        radio.addEventListener('change', function () {
            addressField.hidden = currentMode() !== 'Livraison';
            updateTotals();
        });
    });

    $$('input[name="pay"]').forEach(function (radio) {
        radio.addEventListener('change', updateSubmitLabel);
    });

    function readOrder() {
        return {
            mode: currentMode(),
            pay: $('input[name="pay"]:checked').value,
            name: fName.value.trim(),
            phone: cleanPhone(fPhone.value),
            address: fAddress.value.trim(),
            note: fNote.value.trim()
        };
    }

    function validateOrder() {
        var d = readOrder();
        if (!count()) return { msg: 'Votre commande est vide : ajoutez au moins un plat.', field: sheetClose };
        if (d.name.length < 2) return { msg: 'Indiquez votre nom.', field: fName };
        if (!d.phone) return { msg: 'Entrez un numéro de téléphone valide : 8 chiffres, par exemple 70 12 34 56.', field: fPhone };
        if (d.mode === 'Livraison' && d.address.length < 3) return { msg: 'Indiquez votre quartier pour la livraison.', field: fAddress };
        return null;
    }

    function buildMessage(d, paid) {
        var out = ['*[DÉMO] Nouvelle commande : ' + RESTAURANT + '*', ''];

        order.forEach(function (id) {
            if (cart[id]) out.push(cart[id] + ' × ' + items[id].name + ' : ' + fmt(cart[id] * items[id].price));
        });

        out.push('');
        if (deliveryFee()) out.push('Livraison : ' + fmt(deliveryFee()));
        out.push('*Total : ' + fmt(total()) + '*', '');
        out.push('Mode : ' + d.mode + (d.mode === 'Livraison' ? ' (' + d.address + ')' : ''));
        out.push('Nom : ' + d.name);
        out.push('Téléphone : ' + spacedPhone(d.phone));
        out.push('Paiement : ' + (paid ? paid.operator + ', paiement simulé (réf. ' + paid.ref + ')' : 'à la remise'));
        if (d.note) out.push('Remarque : ' + d.note);

        return out.join('\n');
    }

    function finish(paid) {
        var d = readOrder();
        var message = buildMessage(d, paid);

        /* Même rendu que WhatsApp : le texte entre *étoiles* s'affiche en gras. */
        waPreview.innerHTML = esc(message).replace(/\*([^*\n]+)\*/g, '<strong>$1</strong>');
        waSend.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(message);
        doneLead.textContent = paid
            ? 'Paiement simulé reçu. Voici le message que le restaurant recevrait sur WhatsApp, déjà rédigé.'
            : 'Voici le message que le restaurant recevrait sur WhatsApp, déjà rédigé : plus besoin de recopier la commande.';

        showStep('done');
        stepDone.focus();
        track('demo_order_ready', { payment: d.pay });
    }

    stepOrder.addEventListener('submit', function (e) {
        e.preventDefault();

        var problem = validateOrder();
        if (problem) {
            showError(orderError, problem.msg, problem.field);
            return;
        }

        orderError.hidden = true;

        if (readOrder().pay === 'momo') {
            payAmount.textContent = fmt(total());
            fMomo.value = fPhone.value;
            payError.hidden = true;
            setPaying(false);
            showStep('pay');
            $('input[name="operator"]:checked').focus();
        } else {
            finish(null);
        }
    });

    /* ---------- paiement Mobile Money SIMULÉ ---------- */
    function setPaying(on) {
        payWait.hidden = !on;
        payConfirm.disabled = on;
        fMomo.disabled = on;
        $$('input[name="operator"]').forEach(function (r) { r.disabled = on; });
    }

    payBack.addEventListener('click', function () {
        payToken++;
        setPaying(false);
        showStep('order');
        orderSubmit.focus();
    });

    payConfirm.addEventListener('click', function () {
        if (!cleanPhone(fMomo.value)) {
            showError(payError, 'Entrez un numéro Mobile Money valide : 8 chiffres.', fMomo);
            return;
        }

        payError.hidden = true;
        var token = ++payToken;
        setPaying(true);

        /* Une vraie intégration attendrait ici la confirmation du prestataire de paiement. */
        window.setTimeout(function () {
            if (token !== payToken) return;
            setPaying(false);
            var operator = $('input[name="operator"]:checked').value;
            var ref = 'DEMO-' + String(Math.floor(100000 + Math.random() * 900000));
            track('demo_payment_simulated', { operator: operator });
            finish({ operator: operator, ref: ref });
        }, 1800);
    });

    /* ---------- fin ---------- */
    newOrder.addEventListener('click', function () {
        cart = {};
        order.forEach(updateItem);
        updateBar();
        stepOrder.reset();
        addressField.hidden = true;
        closeSheet();
    });

    updateBar();
})();
