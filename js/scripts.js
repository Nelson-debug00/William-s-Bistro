/* =================================================================
   WILLIAM'S BISTRO — JavaScript
   ================================================================= */

(function () {
    'use strict';

/* ---------- 1. Navbar Scroll Effect ---------- */
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const MOBILE_BP = 640;
    let cachedInnerWidth = window.innerWidth;

    /* ---------- 1b. Scroll spy + Back to top (consolidado en un solo handler) ---------- */
    const sections = document.querySelectorAll('section[id]');
    const navLinkEls = document.querySelectorAll('.navbar__link:not(.navbar__link--cta)');
    const backToTop = document.createElement('button');
    backToTop.className = 'back-to-top';
    backToTop.type = 'button';
    backToTop.setAttribute('aria-label', 'Volver arriba');
    backToTop.innerHTML = '&uarr;';
    document.body.appendChild(backToTop);

    backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Cache section offsets
    var sectionOffsets = [];
    function cacheSectionOffsets() {
        sectionOffsets = [];
        sections.forEach(function (section) {
            sectionOffsets.push({
                id: section.getAttribute('id'),
                top: section.offsetTop,
                height: section.offsetHeight
            });
        });
    }
    cacheSectionOffsets();

    function onScroll() {
        var scrollY = window.scrollY;

        // Navbar scroll
        if (scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Navbar hide (mobile)
        if (cachedInnerWidth > MOBILE_BP) {
            navbar.classList.remove('navbar--hidden');
            document.body.classList.remove('nav-hidden');
        } else if (scrollY <= 80) {
            navbar.classList.remove('navbar--hidden');
            document.body.classList.remove('nav-hidden');
        } else if (navLinks && !navLinks.classList.contains('active')) {
            navbar.classList.add('navbar--hidden');
            document.body.classList.add('nav-hidden');
        }

        // Scroll spy
        if (sectionOffsets.length) {
            var current = '';
            var scrollPos = scrollY + 120;
            for (var i = 0; i < sectionOffsets.length; i++) {
                var s = sectionOffsets[i];
                if (scrollPos >= s.top && scrollPos < s.top + s.height) {
                    current = s.id;
                    break;
                }
            }
            navLinkEls.forEach(function (link) {
                var href = link.getAttribute('href');
                if (!href || !href.startsWith('#')) return;
                if (current && href.includes(current)) {
                    link.classList.add('active-link');
                } else {
                    link.classList.remove('active-link');
                }
            });
        }

        // Back to top
        if (scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }

    // Throttle scroll with rAF
    var ticking = false;
    window.addEventListener('scroll', function () {
        if (!ticking) {
            requestAnimationFrame(function () {
                onScroll();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    onScroll(); // initial call

    /* ---------- 2. Mobile Nav Toggle ---------- */
    function toggleNav() {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('active');

        const isActive = navLinks.classList.contains('active');
        navToggle.setAttribute('aria-expanded', isActive);

        // Prevent body scroll when menu open
        document.body.style.overflow = isActive ? 'hidden' : '';

        // Ensure navbar is visible when menu opens
        if (isActive) {
            navbar.classList.remove('navbar--hidden');
            document.body.classList.remove('nav-hidden');
        }
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

    // Close mobile menu when tapping outside (on the page)
    document.addEventListener('click', function (e) {
        if (!navToggle || !navToggle.classList.contains('active')) return;
        if (navLinks && navLinks.contains(e.target)) return;
        if (e.target === navToggle || navToggle.contains(e.target)) return;
        toggleNav();
    });

    /* ---------- 3. Smooth Scroll + URL limpia para anclas ---------- */
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

    /* ---------- 5. Native IntersectionObserver (reemplaza AOS) ---------- */
    function initFadeIn() {
        if (!('IntersectionObserver' in window)) {
            document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .fade-in-zoom').forEach(function (el) {
                el.classList.add('visible');
            });
            return;
        }
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .fade-in-zoom').forEach(function (el) {
            observer.observe(el);
        });
    }
    initFadeIn();

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

    /* ---------- 8. Lightbox para fotos de Instagram ---------- */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox ? lightbox.querySelector('.lightbox__img') : null;
    const lightboxClose = lightbox ? lightbox.querySelector('.lightbox__close') : null;

    function openLightbox(src) {
        if (!lightbox || !lightboxImg) return;
        lightboxImg.src = src;
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    document.querySelectorAll('.contact__post').forEach(function (post) {
        post.addEventListener('click', function (e) {
            const src = post.getAttribute('data-full');
            if (!src) return;
            e.preventDefault();
            openLightbox(src);
        });
    });

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    if (lightbox) {
        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) closeLightbox();
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && lightbox && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });

    /* ---------- 9. Carrusel del Mostrador Virtual (móvil) ---------- */
    const carouselGrid = document.querySelector('.specialties__carousel .specialties__grid');
    const carouselPrev = document.querySelector('.carousel__btn--prev');
    const carouselNext = document.querySelector('.carousel__btn--next');

    function slideCarousel(dir) {
        if (!carouselGrid) return;
        const card = carouselGrid.querySelector('.card');
        if (!card) return;
        const step = card.offsetWidth + parseFloat(getComputedStyle(carouselGrid).columnGap || '0');
        carouselGrid.scrollBy({ left: dir * step, behavior: 'smooth' });
    }

    if (carouselPrev) {
        carouselPrev.addEventListener('click', function () {
            slideCarousel(-1);
        });
    }

    if (carouselNext) {
        carouselNext.addEventListener('click', function () {
            slideCarousel(1);
        });
    }

    /* ---------- 10. TikTok Embed Responsive (solo video) ---------- */
    // El embed de TikTok fuerza internamente min-width: 325px y el video
    // tiene una relación 9:16 (height = width * 1.7917). En vez de encoger
    // el iframe (que corta el contenido), se mantiene a su tamaño nativo
    // (325x582 = solo el área de video, sin la descripción) y se escala
    // con transform según el ancho del contenedor para ser responsive.
    const tiktokEmbed = document.querySelector('.contact__tiktok-embed');

    function fitTikTokEmbed() {
        if (!tiktokEmbed) return;
        const iframe = tiktokEmbed.querySelector('iframe');
        if (!iframe) return;

        const BASE_W = 325; // ancho nativo del embed
        const BASE_H = 582; // alto del área de video (325 * 1.7917)
        const targetW = tiktokEmbed.clientWidth;
        if (!targetW) return;

        const scale = targetW / BASE_W;
        iframe.style.width = BASE_W + 'px';
        iframe.style.height = BASE_H + 'px';
        iframe.style.transform = 'scale(' + scale + ')';
        iframe.style.transformOrigin = '0 0';
        tiktokEmbed.style.height = Math.round(BASE_H * scale) + 'px';
    }

    if (tiktokEmbed) {
        fitTikTokEmbed();
        window.addEventListener('load', fitTikTokEmbed);
        window.addEventListener('resize', fitTikTokEmbed);
    }

    /* ---------- 11. Resize: refresh cachés de scroll spy ---------- */
    window.addEventListener('resize', function () {
        cachedInnerWidth = window.innerWidth;
        cacheSectionOffsets();
        if (cachedInnerWidth > MOBILE_BP) {
            navbar.classList.remove('navbar--hidden');
            document.body.classList.remove('nav-hidden');
        }
        onScroll();
    }, { passive: true });

})();
