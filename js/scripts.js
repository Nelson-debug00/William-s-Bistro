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
            const href = link.getAttribute('href');
            // Scroll-spy SOLO para enlaces de anclas de la misma página (#seccion).
            // Los enlaces a otras páginas (index.html, menu.html, index.html#...) no
            // se tocan: conservan su estado estático (ej. "Menú" activo en menu.html).
            if (!href || !href.startsWith('#')) return;
            if (current && href.includes(current)) {
                link.classList.add('active-link');
            } else {
                link.classList.remove('active-link');
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
        // Offset robusto: usa el scroll-margin-top del elemento si está
        // disponible (CSS), si no usa la altura de la navbar + aire.
        // content-visibility:auto puede dejar scrollMarginTop en 0px aunque
        // esté definido en CSS -> por eso se calcula la navbar como respaldo.
        const margin = parseInt(getComputedStyle(target).scrollMarginTop, 10);
        const navbar = document.getElementById('navbar');
        const navbarH = navbar ? navbar.offsetHeight : 0;
        const offset = (Number.isFinite(margin) && margin > 0)
            ? margin
            : Math.max(navbarH + 20, 90);
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
                disable: false
            });
        });
    }

    /* ---------- 6. Image Lazy Loading Fallback ---------- */
    if ('loading' in HTMLImageElement.prototype) {
        document.querySelectorAll('img:not([loading])').forEach(function (img) {
            img.setAttribute('loading', 'lazy');
        });
    }

    /* ---------- 7. Live Open / Closed Indicator ---------- */
    // Horario: Lunes a Domingo 7:00 am – 10:00 pm (hora local del visitante).
    // El indicador se actualiza al cargar y luego cada minuto, de modo que
    // cruza exactamente a abierto/cerrado en el minuto justo.
    var OPEN_HOUR = 7;   // 7:00 am
    var CLOSE_HOUR = 22; // 10:00 pm (22:00)

    function isRestaurantOpen() {
        var now = new Date();
        var h = now.getHours();
        // Abierto desde las 07:00 hasta las 22:00 (la hora 22 = 10pm, cierra)
        return h >= OPEN_HOUR && h < CLOSE_HOUR;
    }

    function setStatusText(el, open) {
        var dot = el.querySelector('.status-dot');
        var text = el.querySelector('.status-text');
        if (!dot || !text) return;
        if (open) {
            el.classList.remove('closed');
            el.classList.add('open');
            dot.style.background = '#25D366';
            text.textContent = 'Abierto';
        } else {
            el.classList.remove('open');
            el.classList.add('closed');
            dot.style.background = '#EF5350';
            text.textContent = 'Cerrado';
        }
    }

    function updateStatusIndicators() {
        var open = isRestaurantOpen();
        document.querySelectorAll('.status-indicator').forEach(function (el) {
            setStatusText(el, open);
        });
    }

    // Check ahora y luego cada minuto (60s) para capturar el cruce exacto.
    updateStatusIndicators();
    setInterval(updateStatusIndicators, 60 * 1000);

})();
