/* Runs before the page is painted: marks the page as "JavaScript on" and applies the saved (or system) theme,
   so the page never flashes the wrong colours. Kept in its own file because the site's security policy forbids inline scripts. */
(function () {
    var root = document.documentElement;
    root.classList.remove('no-js');
    root.classList.add('js');
    var theme = 'light';
    try {
        var saved = localStorage.getItem('victoria-theme');
        if (saved === 'dark' || saved === 'light') {
            theme = saved;
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            theme = 'dark';
        }
    } catch (e) { /* storage blocked: keep the default */ }
    root.dataset.theme = theme;
})();
