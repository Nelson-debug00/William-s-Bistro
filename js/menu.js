/* =================================================================
   MENU PAGE — Filter Logic & Interactions
   ================================================================= */

(function () {
    'use strict';

    /* ---------- Category Filter ---------- */
    const filterButtons = document.querySelectorAll('.menu-filters__btn');
    const menuSections = document.querySelectorAll('.menu-section');
    const allDishes = document.querySelectorAll('.dish');
    const dropdown = document.querySelector('.menu-filters__dropdown');
    const dropdownMenu = document.querySelector('.menu-filters__menu');
    const dropdownItems = document.querySelectorAll('.menu-filters__item');

    /* Subcategorías del desplegable "Platos Fuertes" */
    const SUBCATS = ['pastas', 'aves_res', 'parrillas', 'platos_tradicionales', 'pescados_mariscos', 'pollo_broaster', 'platos_habibi'];

    /* Contar platos por categoría y actualizar los badges de los filtros */
    function countDishesByCategory() {
        const counts = { all: 0, desayunos: 0, entradas: 0, almuerzos: 0, comida_china: 0, comida_rapida: 0, jugos: 0 };
        SUBCATS.forEach(function (sub) { counts[sub] = 0; });
        allDishes.forEach(function (dish) {
            const cat = dish.getAttribute('data-category');
            const sub = dish.getAttribute('data-subcategory');
            if (cat && counts.hasOwnProperty(cat)) {
                counts[cat] += 1;
                counts.all += 1;
            }
            if (sub && counts.hasOwnProperty(sub)) {
                counts[sub] += 1;
            }
        });
        return counts;
    }

    function updateFilterCounts() {
        const counts = countDishesByCategory();
        filterButtons.forEach(function (btn) {
            const filter = btn.getAttribute('data-filter');
            const countSpan = btn.querySelector('.menu-filters__count');
            if (countSpan && counts.hasOwnProperty(filter)) {
                countSpan.textContent = counts[filter];
            }
        });
        dropdownItems.forEach(function (item) {
            const filter = item.getAttribute('data-filter');
            const countSpan = item.querySelector('.menu-filters__count');
            if (countSpan && counts.hasOwnProperty(filter)) {
                countSpan.textContent = counts[filter];
            }
        });
    }

    function setActiveButton(category) {
        filterButtons.forEach(function (btn) {
            btn.classList.remove('active');
            if (btn.getAttribute('data-filter') === category) {
                btn.classList.add('active');
            }
        });
        dropdownItems.forEach(function (item) {
            item.classList.remove('active');
            if (item.getAttribute('data-filter') === category) {
                item.classList.add('active');
            }
        });
        // Si se elige una subcategoría, el botón principal muestra estado activo
        if (dropdown && SUBCATS.indexOf(category) !== -1) {
            const mainBtn = dropdown.querySelector('.menu-filters__btn');
            if (mainBtn) mainBtn.classList.add('active');
        }
    }

    function applyFilter(category) {
        if (category === 'all') {
            // Show all sections and dishes
            menuSections.forEach(function (section) {
                section.classList.remove('hidden');
            });
            allDishes.forEach(function (dish) {
                dish.style.display = '';
            });
        } else if (SUBCATS.indexOf(category) !== -1) {
            // Subcategoría: solo muestra la sección almuerzos con los platos que coincidan
            menuSections.forEach(function (section) {
                section.classList.toggle('hidden', section.getAttribute('data-category') !== 'almuerzos');
            });
            allDishes.forEach(function (dish) {
                const sub = dish.getAttribute('data-subcategory');
                if (dish.getAttribute('data-category') === 'almuerzos' && sub === category) {
                    dish.style.display = '';
                } else {
                    dish.style.display = 'none';
                }
            });
        } else {
            // Hide sections that don't match; show matching ones
            menuSections.forEach(function (section) {
                if (section.getAttribute('data-category') === category) {
                    section.classList.remove('hidden');
                } else {
                    section.classList.add('hidden');
                }
            });

            // Show/hide individual dishes (redundant safety filter)
            allDishes.forEach(function (dish) {
                if (dish.getAttribute('data-category') === category) {
                    dish.style.display = '';
                } else {
                    dish.style.display = 'none';
                }
            });
        }

        // Update active button
        setActiveButton(category);

        // Cerrar desplegable tras elegir subcategoría
        if (dropdown && SUBCATS.indexOf(category) !== -1) {
            dropdown.classList.remove('is-open');
        }

        // Refresh los contadores visuales de los badges
        updateFilterCounts();
    }

    filterButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            const category = btn.getAttribute('data-filter');
            applyFilter(category);

            // Smooth scroll to first visible section
            setTimeout(function () {
                const firstVisible = document.querySelector('.menu-section:not(.hidden)');
                if (firstVisible && category !== 'all' && SUBCATS.indexOf(category) === -1) {
                    const offset = 130;
                    const top = firstVisible.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top: top, behavior: 'smooth' });
                }
            }, 100);
        });
    });

    /* ---------- 1.5 Dropdown "Platos Fuertes" ---------- */
    if (dropdown && dropdownMenu) {
        dropdown.querySelector('.menu-filters__btn').addEventListener('click', function (e) {
            e.stopPropagation();
            dropdown.classList.toggle('is-open');
        });

        dropdownItems.forEach(function (item) {
            item.addEventListener('click', function (e) {
                e.stopPropagation();
                const category = item.getAttribute('data-filter');
                applyFilter(category);
            });
        });

        document.addEventListener('click', function (e) {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('is-open');
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                dropdown.classList.remove('is-open');
            }
        });
    }

    /* ---------- 2. URL Hash Navigation ---------- */
    // If URL has a hash matching a category id, scroll to it
    document.addEventListener('DOMContentLoaded', function () {
        const hash = window.location.hash.replace('#', '');
        if (hash) {
            const targetSection = document.getElementById(hash);
            if (targetSection) {
                // Also activate the matching filter
                const matchingBtn = document.querySelector('[data-filter="' + hash + '"]');
                if (matchingBtn) {
                    applyFilter(hash);
                }
                setTimeout(function () {
                    const offset = 130;
                    const top = targetSection.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top: top, behavior: 'smooth' });
                }, 300);
            }
        }
    });

    /* ---------- 3. Staggered Dish Entrance Animation ---------- */
    function animateDishes() {
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry, index) {
                if (entry.isIntersecting) {
                    const dish = entry.target;
                    dish.style.opacity = '0';
                    dish.style.transform = 'translateY(30px)';
                    dish.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

                    setTimeout(function () {
                        dish.style.opacity = '1';
                        dish.style.transform = 'translateY(0)';
                    }, index * 80);

                    observer.unobserve(dish);
                }
            });
        }, { threshold: 0.15 });

        allDishes.forEach(function (dish) {
            observer.observe(dish);
        });
    }

    if ('IntersectionObserver' in window) {
        animateDishes();
    }

    /* ---------- 5. Initialization ---------- */
    updateFilterCounts();

    /* ---------- 6. Image Modal (vista grande) ---------- */
    const imgModal = document.getElementById('imgModal');
    const imgModalImg = document.getElementById('imgModalImg');
    const imgModalCaption = document.getElementById('imgModalCaption');
    const imgModalClose = document.getElementById('imgModalClose');

    function openImgModal(imgEl) {
        if (!imgModal || !imgModalImg) return;
        imgModalImg.src = imgEl.src;
        imgModalImg.alt = imgEl.alt;
        if (imgModalCaption) {
            imgModalCaption.textContent = imgEl.alt;
        }
        imgModal.classList.add('active');
        imgModal.setAttribute('aria-hidden', 'false');
        document.documentElement.classList.add('modal-open');
    }

    function closeImgModal() {
        if (!imgModal) return;
        imgModal.classList.remove('active');
        imgModal.setAttribute('aria-hidden', 'true');
        document.documentElement.classList.remove('modal-open');
    }

    document.querySelectorAll('.dish__image').forEach(function (wrapper) {
        wrapper.addEventListener('click', function (e) {
            const img = wrapper.querySelector('img');
            if (img) openImgModal(img);
        });
    });

    if (imgModalClose) {
        imgModalClose.addEventListener('click', closeImgModal);
    }
    if (imgModal) {
        imgModal.addEventListener('click', function (e) {
            if (e.target === imgModal) closeImgModal();
        });
    }

    /* ---------- 7. Menú PDF Modal ---------- */
    const pdfModal = document.getElementById('pdfModal');
    const pdfMenuBtn = document.getElementById('pdfMenuBtn');

    function openPdfModal() {
        if (!pdfModal) return;
        pdfModal.classList.add('active');
        pdfModal.setAttribute('aria-hidden', 'false');
        document.documentElement.classList.add('modal-open');
    }

    function closePdfModal() {
        if (!pdfModal) return;
        pdfModal.classList.remove('active');
        pdfModal.setAttribute('aria-hidden', 'true');
        document.documentElement.classList.remove('modal-open');
    }

    if (pdfMenuBtn) {
        pdfMenuBtn.addEventListener('click', openPdfModal);
    }
    if (pdfModal) {
        pdfModal.addEventListener('click', function (e) {
            if (e.target === pdfModal) closePdfModal();
        });
    }
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            if (imgModal && imgModal.classList.contains('active')) {
                closeImgModal();
            } else if (pdfModal && pdfModal.classList.contains('active')) {
                closePdfModal();
            }
        }
    });

})();
