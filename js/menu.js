/* =================================================================
   MENU PAGE — Filter Logic & Interactions
   ================================================================= */

(function () {
    'use strict';

    /* ---------- Category Filter ---------- */
    const filterButtons = document.querySelectorAll('.menu-filters__btn');
    const menuSections = document.querySelectorAll('.menu-section');
    const allDishes = document.querySelectorAll('.dish');

    /* Contar platos por categoría y actualizar los badges de los filtros */
    function countDishesByCategory() {
        const counts = { all: 0, desayunos: 0, sandwiches: 0, jugos: 0, extras: 0 };
        allDishes.forEach(function (dish) {
            const cat = dish.getAttribute('data-category');
            if (cat && counts.hasOwnProperty(cat)) {
                counts[cat] += 1;
                counts.all += 1;
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
        filterButtons.forEach(function (btn) {
            btn.classList.remove('active');
            if (btn.getAttribute('data-filter') === category) {
                btn.classList.add('active');
            }
        });

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
                if (firstVisible && category !== 'all') {
                    const offset = 130;
                    const top = firstVisible.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top: top, behavior: 'smooth' });
                }
            }, 100);
        });
    });

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

    /* ---------- 4. Initialize Filter Counts ---------- */
    updateFilterCounts();

})();
