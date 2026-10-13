/* Exécuté avant l'affichage de la page, pour éviter un flash de mauvais thème.
   Thème clair par défaut (plus lisible au soleil sur un téléphone).
   Sombre seulement si le visiteur l'a choisi avec le bouton lune/soleil,
   ou si son appareil est réglé en mode sombre. */
(function () {
    var stored = null;
    var prefersDark = false;

    try { stored = localStorage.getItem('theme'); } catch (e) { /* stockage indisponible */ }
    try { prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) { /* ancien navigateur */ }

    var dark = stored ? stored === 'dark' : prefersDark;
    if (!dark) document.body.classList.add('light-mode');
})();
