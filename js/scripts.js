/* =================================================================
   WILLIAM'S BISTRO — JavaScript
   ================================================================= */

(function () {
    'use strict';

    /* ---------- 1. Navbar Scroll Effect ---------- */
    const navbar = document.getElementById('navbar');

    function handleNavbarScroll() {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleNavbarScroll, { passive: true });
    handleNavbarScroll();

    /* ---------- 2. Mobile Nav Toggle ---------- */
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    function toggleNav() {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('active');

        const isActive = navLinks.classList.contains('active');
        navToggle.setAttribute('aria-expanded', isActive);

        // Prevent body scroll when menu open
        document.body.style.overflow = isActive ? 'hidden' : '';
    }

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', toggleNav);
    }

    // Close mobile menu when clicking a link
    if (navLinks) {
        navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                if (navToggle && navToggle.classList.contains('active')) {
                    toggleNav();
                }
            });
        });
    }

    // Close mobile menu on Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && navToggle && navToggle.classList.contains('active')) {
            toggleNav();
        }
    });

    /* ---------- 3. Active Link Highlight (Scroll Spy) ---------- */
    const sections = document.querySelectorAll('section[id]');
    const navLinkEls = document.querySelectorAll('.navbar__link:not(.navbar__link--cta)');

    function updateActiveLink() {
        let current = '';
        const scrollPos = window.scrollY + 120;

        sections.forEach(function (section) {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            if (scrollPos >= top && scrollPos < top + height) {
                current = section.getAttribute('id');
            }
        });

        navLinkEls.forEach(function (link) {
            link.classList.remove('active-link');
            const href = link.getAttribute('href');
            if (href && href.includes('#') && href.includes(current)) {
                link.classList.add('active-link');
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink, { passive: true });

    /* ---------- 3b. Smooth Scroll + URL limpia para anclas ---------- */
    // Evita que quede "/#seccion" en la URL al navegar a una ancla de la
    // misma página: hace scroll suave y limpia el hash con history.replaceState.
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    function scrollToHash(hash) {
        const target = document.getElementById(hash);
        if (!target) return false;
        const offset = 90; // compensa la navbar fija
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
        return true;
    }

    anchorLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            const hash = link.getAttribute('href').replace('#', '');
            if (!hash) return; // enlace solo "#" -> no hacer nada

            // Si la página actual NO tiene el elemento, es un link a otra
            // página (ej. menu.html) -> dejar el comportamiento nativo.
            if (!document.getElementById(hash)) return;

            e.preventDefault();

            if (scrollToHash(hash)) {
                // Limpia el "#hash" de la URL sin recargar ni dejar historial
                history.replaceState(null, '', window.location.pathname + window.location.search);
            }
        });
    });

    // Si se llegó con "#hash" en la URL (ej. recarga con ancla), al hacer
    // scroll se limpia también. Se dispara una vez, con scroll suave.
    window.addEventListener('load', function () {
        if (window.location.hash) {
            const hash = window.location.hash.replace('#', '');
            setTimeout(function () {
                if (scrollToHash(hash)) {
                    history.replaceState(null, '', window.location.pathname + window.location.search);
                }
            }, 300);
        }
    });

    /* ---------- 4. Current Year in Footer ---------- */
    const yearEl = document.getElementById('currentYear');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    /* ---------- 5. Initialize AOS ---------- */
    if (typeof AOS !== 'undefined') {
        window.addEventListener('load', function () {
            AOS.init({
                duration: 800,
                easing: 'ease-out-cubic',
                once: true,
                offset: 80,
                disable: window.innerWidth < 480 ? false : false
            });
        });
    }

    /* ---------- 6. Image Lazy Loading Fallback ---------- */
    if ('loading' in HTMLImageElement.prototype) {
        document.querySelectorAll('img:not([loading])').forEach(function (img) {
            img.setAttribute('loading', 'lazy');
        });
    }

})();
