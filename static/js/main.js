// Sociedad M&D - animaciones y comportamiento del sitio
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', function () {
    var navbar = document.querySelector('.navbar-myd');
    var toTop = document.querySelector('.to-top');

    function onScroll() {
        var y = window.scrollY;
        if (navbar) navbar.classList.toggle('scrolled', y > 40);
        if (toTop) toTop.classList.toggle('show', y > 600);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (toTop) {
        toTop.addEventListener('click', function () {
            window.scrollTo({ top: 0 });
        });
    }

    // Cerrar el menú móvil al elegir un enlace
    var collapse = document.getElementById('mainNav');
    if (collapse && window.bootstrap) {
        collapse.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                var instance = bootstrap.Collapse.getInstance(collapse);
                if (instance) instance.hide();
            });
        });
    }

    // Animación al hacer scroll
    var items = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
        items.forEach(function (el) { observer.observe(el); });
    } else {
        items.forEach(function (el) { el.classList.add('in'); });
    }

    var year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();

    initI18n();
});

// ---------- Idiomas ----------
// El sitio está escrito en español; las traducciones viven en static/i18n/<idioma>.json
// y se buscan por el texto original en español.

var LANGS = ['es', 'en', 'fr', 'it', 'pt', 'de', 'ko', 'zh', 'ja'];
var I18N_TAGS = 'title,h1,h2,h3,h4,p,li,a,span,small,label,button,strong';
var I18N_ATTRS = ['placeholder', 'aria-label', 'alt'];
var i18nCache = {};

function normText(s) {
    return s.replace(/\s+/g, ' ').trim();
}

function isTranslatable(el) {
    if (!el.matches(I18N_TAGS) || el.closest('[data-no-i18n]')) return false;
    for (var i = 0; i < el.children.length; i++) {
        if (!/^(SPAN|STRONG|EM|BR)$/.test(el.children[i].tagName)) return false;
        if (el.children[i].hasAttribute('data-no-i18n')) return false;
    }
    return /[a-záéíóúñ]/i.test(el.textContent);
}

// Elementos con texto propio, sin repetir los que ya cubre un elemento padre
function collectI18n() {
    var nodes = [];
    document.querySelectorAll(I18N_TAGS).forEach(function (el) {
        if (!isTranslatable(el)) return;
        for (var p = el.parentElement; p; p = p.parentElement) {
            if (isTranslatable(p)) return;
        }
        el.dataset.i18nSrc = normText(el.tagName === 'TITLE' ? el.textContent : el.innerHTML);
        nodes.push(el);
    });
    var attrs = [];
    I18N_ATTRS.forEach(function (attr) {
        document.querySelectorAll('[' + attr + ']').forEach(function (el) {
            if (el.closest('[data-no-i18n]') || !normText(el.getAttribute(attr))) return;
            attrs.push({ el: el, attr: attr, src: normText(el.getAttribute(attr)) });
        });
    });
    return { nodes: nodes, attrs: attrs };
}

function applyI18n(state, lang, dict) {
    dict = dict || {};
    state.nodes.forEach(function (el) {
        var src = el.dataset.i18nSrc;
        if (el.tagName === 'TITLE') el.textContent = dict[src] || src;
        else el.innerHTML = dict[src] || src;
    });
    state.attrs.forEach(function (a) {
        a.el.setAttribute(a.attr, dict[a.src] || a.src);
    });
    document.documentElement.lang = lang;
    document.querySelectorAll('.lang-current').forEach(function (el) {
        el.textContent = lang.toUpperCase();
    });
    document.querySelectorAll('[data-lang]').forEach(function (el) {
        el.classList.toggle('active', el.dataset.lang === lang);
    });
}

function setLanguage(state, lang) {
    if (LANGS.indexOf(lang) === -1) lang = 'es';
    try { localStorage.setItem('myd-lang', lang); } catch (e) {}
    if (lang === 'es') {
        applyI18n(state, 'es', null);
        return;
    }
    if (i18nCache[lang]) {
        applyI18n(state, lang, i18nCache[lang]);
        return;
    }
    fetch('static/i18n/' + lang + '.json')
        .then(function (r) { return r.json(); })
        .then(function (dict) {
            i18nCache[lang] = dict;
            applyI18n(state, lang, dict);
        })
        .catch(function () { applyI18n(state, 'es', null); });
}

function initI18n() {
    var state = collectI18n();
    window.mydI18n = state;

    document.querySelectorAll('[data-lang]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            setLanguage(state, btn.dataset.lang);
        });
    });

    var lang = new URLSearchParams(location.search).get('lang');
    if (!lang) {
        try { lang = localStorage.getItem('myd-lang'); } catch (e) {}
    }
    if (lang && lang !== 'es') setLanguage(state, lang);
}
