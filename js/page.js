/* Script commun aux pages secondaires (mentions légales, guides…) : thème clair/sombre et année du pied de page.
   La page d'accueil a le sien (main.js). Le thème est choisi avant l'affichage par theme-init.js. */
(function () {
    var body = document.body;
    var toggle = document.getElementById('themeToggle');
    var themeColorMeta = document.querySelector('meta[name="theme-color"]');

    function readStorage(key) {
        try { return localStorage.getItem(key); } catch (e) { return null; }
    }

    function writeStorage(key, value) {
        try { localStorage.setItem(key, value); } catch (e) { /* stockage indisponible */ }
    }

    function applyTheme(isLight, persist) {
        body.classList.toggle('light-mode', isLight);

        if (toggle) {
            var icon = toggle.querySelector('i');
            if (icon) icon.className = isLight ? 'fas fa-sun' : 'fas fa-moon';
            toggle.setAttribute('aria-label', isLight ? 'Activer le thème sombre' : 'Activer le thème clair');
        }

        if (themeColorMeta) {
            themeColorMeta.setAttribute('content', isLight ? '#f6f7f9' : '#05050a');
        }

        if (persist) writeStorage('theme', isLight ? 'light' : 'dark');
    }

    var stored = readStorage('theme');
    var prefersDark = false;
    try { prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) { /* ancien navigateur */ }

    /* Clair par défaut ; sombre si le visiteur l'a choisi ou si son appareil est en mode sombre. */
    applyTheme(!(stored ? stored === 'dark' : prefersDark), false);

    if (toggle) {
        toggle.addEventListener('click', function () {
            applyTheme(!body.classList.contains('light-mode'), true);
        });
    }

    /* Statistiques optionnelles (Plausible ou Umami) : ne font rien tant qu'aucun script n'est ajouté à la page. */
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

    var year = document.getElementById('current-year');
    if (year) year.textContent = new Date().getFullYear();
})();
