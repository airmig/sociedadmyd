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
});
