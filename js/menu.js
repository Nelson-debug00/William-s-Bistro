(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {

        var allDishes = document.querySelectorAll('.dish');
        var allFilterBtns = document.querySelectorAll('.menu-filters__btn');
        var dropdown = document.querySelector('.menu-filters__dropdown');
        var dropdownMenu = document.querySelector('.menu-filters__menu');
        var dropdownItems = document.querySelectorAll('.menu-filters__item');
        var mainFilterBtns = [];
        var subcategories = ['pastas', 'aves_res', 'parrillas', 'platos_tradicionales', 'pescados_mariscos', 'pollo_broaster', 'platos_habibi'];

        // Filtrar botones principales (excluir los que están dentro del dropdown y el botón "Ver más")
        for (var i = 0; i < allFilterBtns.length; i++) {
            var btn = allFilterBtns[i];
            if (!btn.closest('.menu-filters__dropdown') && btn.id !== 'pdfMenuBtn') {
                mainFilterBtns.push(btn);
            }
        }

        // Función para contar platos
        function countDishes() {
            var counts = {
                all: 0,
                desayunos: 0,
                entradas: 0,
                almuerzos: 0,
                comida_china: 0,
                comida_rapida: 0,
                jugos: 0
            };
            for (var j = 0; j < subcategories.length; j++) {
                counts[subcategories[j]] = 0;
            }

            for (var k = 0; k < allDishes.length; k++) {
                var dish = allDishes[k];
                var cat = dish.getAttribute('data-category');
                var sub = dish.getAttribute('data-subcategory');

                if (cat && counts.hasOwnProperty(cat)) {
                    counts[cat]++;
                    counts.all++;
                }

                if (sub && subcategories.indexOf(sub) !== -1) {
                    counts[sub]++;
                }
            }

            return counts;
        }

        // Actualizar todos los contadores en la interfaz
        function updateCounters() {
            var counts = countDishes();

            // Actualizar botones principales
            for (var a = 0; a < mainFilterBtns.length; a++) {
                var btn = mainFilterBtns[a];
                var filter = btn.getAttribute('data-filter');
                var span = btn.querySelector('.menu-filters__count');
                if (span && counts.hasOwnProperty(filter)) {
                    span.textContent = counts[filter];
                }
            }

            // Actualizar items del dropdown
            for (var b = 0; b < dropdownItems.length; b++) {
                var item = dropdownItems[b];
                var filter = item.getAttribute('data-filter');
                var span = item.querySelector('.menu-filters__count');
                if (span && counts.hasOwnProperty(filter)) {
                    span.textContent = counts[filter];
                }
            }

            // Actualizar el contador del botón del dropdown (Platos Fuertes)
            if (dropdown) {
                var dropdownBtn = dropdown.querySelector('.menu-filters__btn');
                var span = dropdownBtn ? dropdownBtn.querySelector('.menu-filters__count') : null;
                if (span && counts.hasOwnProperty('almuerzos')) {
                    span.textContent = counts['almuerzos'];
                }
            }
        }

        // Aplicar filtro
        function applyFilter(category) {
            var menuSections = document.querySelectorAll('.menu-section');

            if (category === 'all') {
                for (var c = 0; c < menuSections.length; c++) {
                    menuSections[c].classList.remove('hidden');
                }
                for (var d = 0; d < allDishes.length; d++) {
                    allDishes[d].style.display = '';
                }
            } else if (subcategories.indexOf(category) !== -1) {
                // Subcategoría: solo mostrar sección de almuerzos y platos que coincidan
                for (var e = 0; e < menuSections.length; e++) {
                    var section = menuSections[e];
                    if (section.getAttribute('data-category') === 'almuerzos') {
                        section.classList.remove('hidden');
                    } else {
                        section.classList.add('hidden');
                    }
                }
                for (var f = 0; f < allDishes.length; f++) {
                    var dish = allDishes[f];
                    if (dish.getAttribute('data-category') === 'almuerzos' && dish.getAttribute('data-subcategory') === category) {
                        dish.style.display = '';
                    } else {
                        dish.style.display = 'none';
                    }
                }
            } else {
                for (var g = 0; g < menuSections.length; g++) {
                    var section = menuSections[g];
                    if (section.getAttribute('data-category') === category) {
                        section.classList.remove('hidden');
                    } else {
                        section.classList.add('hidden');
                    }
                }
                for (var h = 0; h < allDishes.length; h++) {
                    var dish = allDishes[h];
                    if (dish.getAttribute('data-category') === category) {
                        dish.style.display = '';
                    } else {
                        dish.style.display = 'none';
                    }
                }
            }

            // Activar botón correspondiente
            for (var i2 = 0; i2 < mainFilterBtns.length; i2++) {
                var btn = mainFilterBtns[i2];
                btn.classList.remove('active');
                if (btn.getAttribute('data-filter') === category) {
                    btn.classList.add('active');
                }
            }
            for (var j2 = 0; j2 < dropdownItems.length; j2++) {
                var item = dropdownItems[j2];
                item.classList.remove('active');
                if (item.getAttribute('data-filter') === category) {
                    item.classList.add('active');
                }
            }
            // Activar/desactivar botón del dropdown
            if (dropdown) {
                var dBtn = dropdown.querySelector('.menu-filters__btn');
                if (dBtn) {
                    if (category === 'almuerzos' || subcategories.indexOf(category) !== -1) {
                        dBtn.classList.add('active');
                    } else {
                        dBtn.classList.remove('active');
                    }
                }
            }

            // Cerrar dropdown si se eligió subcategoría
            if (dropdown && subcategories.indexOf(category) !== -1) {
                dropdown.classList.remove('is-open');
            }

            // Actualizar contadores
            updateCounters();

            // Scroll suave
            setTimeout(function() {
                var firstVisible = document.querySelector('.menu-section:not(.hidden)');
                if (firstVisible && category !== 'all' && subcategories.indexOf(category) === -1) {
                    var offset = 130;
                    var top = firstVisible.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
                }
            }, 100);
        }

        // Eventos para botones principales
        for (var l = 0; l < mainFilterBtns.length; l++) {
            var btn = mainFilterBtns[l];
            btn.addEventListener('click', function(e) {
                var category = this.getAttribute('data-filter');
                applyFilter(category);
            });
        }

        // Eventos para dropdown
        if (dropdown && dropdownMenu) {
            var dropdownBtn = dropdown.querySelector('.menu-filters__btn');
            dropdownBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                applyFilter('almuerzos');
                dropdown.classList.toggle('is-open');
            });

            for (var m = 0; m < dropdownItems.length; m++) {
                var item = dropdownItems[m];
                item.addEventListener('click', function(e) {
                    e.stopPropagation();
                    var category = this.getAttribute('data-filter');
                    applyFilter(category);
                });
            }

            document.addEventListener('click', function(e) {
                if (!dropdown.contains(e.target)) {
                    dropdown.classList.remove('is-open');
                }
            });

            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    dropdown.classList.remove('is-open');
                }
            });
        }

        // Inicializar
        updateCounters();

        // Si hay hash en la URL, aplicar filtro y scroll
        var hash = window.location.hash.replace('#', '');
        if (hash) {
            var target = document.getElementById(hash);
            if (target) {
                var matchingBtn = document.querySelector('[data-filter="' + hash + '"]');
                if (matchingBtn) {
                    applyFilter(hash);
                }
                setTimeout(function() {
                    var offset = 130;
                    var top = target.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
                }, 300);
            }
        }

        // Animación de entrada de platos (staggered)
        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry, index) {
                    if (entry.isIntersecting) {
                        var dish = entry.target;
                        dish.style.opacity = '0';
                        dish.style.transform = 'translateY(30px)';
                        dish.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                        setTimeout(function() {
                            dish.style.opacity = '1';
                            dish.style.transform = 'translateY(0)';
                        }, index * 80);
                        observer.unobserve(dish);
                    }
                });
            }, { threshold: 0.15 });
            for (var n = 0; n < allDishes.length; n++) {
                observer.observe(allDishes[n]);
            }
        }

        // Modal de imágenes
        var imgModal = document.getElementById('imgModal');
        var imgModalImg = document.getElementById('imgModalImg');
        var imgModalCaption = document.getElementById('imgModalCaption');
        var imgModalClose = document.getElementById('imgModalClose');

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

        var dishImages = document.querySelectorAll('.dish__image');
        for (var o = 0; o < dishImages.length; o++) {
            var wrapper = dishImages[o];
            wrapper.addEventListener('click', function(e) {
                var img = this.querySelector('img');
                if (img) openImgModal(img);
            });
        }

        if (imgModalClose) {
            imgModalClose.addEventListener('click', closeImgModal);
        }
        if (imgModal) {
            imgModal.addEventListener('click', function(e) {
                if (e.target === imgModal) closeImgModal();
            });
        }

        // PDF Modal
        var pdfModal = document.getElementById('pdfModal');
        var pdfMenuBtn = document.getElementById('pdfMenuBtn');

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
            pdfModal.addEventListener('click', function(e) {
                if (e.target === pdfModal) closePdfModal();
            });
        }

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                if (imgModal && imgModal.classList.contains('active')) {
                    closeImgModal();
                } else if (pdfModal && pdfModal.classList.contains('active')) {
                    closePdfModal();
                }
            }
        });

    });

})();