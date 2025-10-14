window.addEventListener('DOMContentLoaded', function () {
    // === 1. Параллакс-эффект для hero (оптимизирован) ===
    const hero = document.querySelector('.hero');
    let ticking = false;

    function updateParallax() {
        if (!hero) return;
        if (window.innerWidth > 900) {
            const y = window.scrollY * 0.4;
            hero.style.backgroundPosition = `center calc(50% + ${y}px)`;
        } else {
            hero.style.backgroundPosition = '';
        }
        ticking = false;
    }

    function requestParallaxUpdate() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }

    if (hero) {
        window.addEventListener('scroll', requestParallaxUpdate, { passive: true });
        window.addEventListener('resize', requestParallaxUpdate);
    }

    // === 2. Анимация появления элементов — через Intersection Observer ===
    const revealEls = document.querySelectorAll('section, .menu-item, .service-card, .gallery-item, .review');

    if (revealEls.length > 0) {
        // Добавляем базовый класс сразу
        revealEls.forEach(el => el.classList.add('reveal'));

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    // Опционально: перестать наблюдать после появления (экономия ресурсов)
                    // revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.08, // ~8% видимости → как у тебя было 92% от высоты окна
            rootMargin: '0px 0px -8% 0px'
        });

        revealEls.forEach(el => revealObserver.observe(el));
    }

    // === 3. Sticky header при скролле вверх (оптимизирован) ===
    const header = document.getElementById('mainHeader');
    let lastScrollY = window.scrollY;
    let stickyTimeout = null;
    let isMenuOpen = false;

    function handleScroll() {
        if (!header) return;

        const currY = window.scrollY;

        // Sticky-show при скролле вверх
        if (currY < lastScrollY && currY > 100) {
            header.classList.add('sticky-show');
            clearTimeout(stickyTimeout);
            stickyTimeout = setTimeout(() => {
                header.classList.remove('sticky-show');
            }, 1200);
        }

        // Collapsed header при скролле вниз
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > 100 && !isMenuOpen) {
            header.classList.add('collapsed');
        } else if (scrollTop <= 50) {
            header.classList.remove('collapsed');
        }

        lastScrollY = currY;
    }

    // Единый scroll-обработчик (оптимизирован)
    let scrollTicking = false;
    function requestScrollUpdate() {
        if (!scrollTicking) {
            requestAnimationFrame(handleScroll);
            scrollTicking = true;
        }
    }

    if (header) {
        window.addEventListener('scroll', requestScrollUpdate, { passive: true });
    }

    // === 4. Меню и кнопки ===
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mainNav = document.getElementById('mainNav');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navUl = document.querySelector('nav ul');

    // Hamburger toggle
    if (hamburgerBtn && mainNav && header) {
        hamburgerBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            isMenuOpen = !isMenuOpen;
            this.classList.toggle('active');
            mainNav.classList.toggle('active');
            if (isMenuOpen) {
                header.classList.add('collapsed');
            } else {
                // При закрытии — проверим, нужно ли убрать collapsed
                if (window.scrollY <= 50) {
                    header.classList.remove('collapsed');
                }
            }
        });
    }

    // Mobile menu toggle
    if (mobileMenuBtn && navUl) {
        mobileMenuBtn.addEventListener('click', function () {
            navUl.classList.toggle('active');
        });
    }

    // Закрытие меню по клику вне
    document.addEventListener('click', function (e) {
        if (header && header.classList.contains('collapsed') &&
            !header.contains(e.target) &&
            isMenuOpen) {
            mainNav?.classList.remove('active');
            hamburgerBtn?.classList.remove('active');
            isMenuOpen = false;
        }
    });

    // Закрытие по Esc
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isMenuOpen) {
            mainNav?.classList.remove('active');
            hamburgerBtn?.classList.remove('active');
            isMenuOpen = false;
        }
    });

    // === 5. Фильтр меню ===
    const menuItemsContainer = document.querySelector('.menu-items');
    let noItemsMsg = null;

    if (menuItemsContainer) {
        noItemsMsg = document.createElement('div');
        noItemsMsg.className = 'no-menu-items-msg';
        noItemsMsg.textContent = 'Нет блюд в выбранной категории.';
        noItemsMsg.style.display = 'none';
        menuItemsContainer.appendChild(noItemsMsg);
    }

    const filterButtons = document.querySelectorAll('.menu-category-btn');
    const menuItems = document.querySelectorAll('.menu-item');

    function filterMenu(category) {
        let shown = 0;
        menuItems.forEach(item => {
            if (category === 'all' || item.getAttribute('data-category') === category) {
                item.style.display = '';
                shown++;
            } else {
                item.style.display = 'none';
            }
        });
        if (noItemsMsg) {
            noItemsMsg.style.display = shown === 0 ? 'block' : 'none';
        }
        localStorage.setItem('menuCategory', category);
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            const category = this.getAttribute('data-category');
            filterMenu(category);
        });
    });

    // Восстановление фильтра
    const savedCategory = localStorage.getItem('menuCategory');
    const initialBtn = savedCategory
        ? document.querySelector(`.menu-category-btn[data-category="${savedCategory}"]`)
        : document.querySelector('.menu-category-btn.active');

    if (initialBtn) {
        initialBtn.click();
    }

    // === 6. Плавный скролл ПО ЯКОРНЫМ ССЫЛКАМ (только при клике!) ===
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);

            if (target) {
                const offsetTop = target.offsetTop - 80; // 80px — отступ под header
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });

                // Закрыть мобильное меню
                if (navUl) navUl.classList.remove('active');
                if (mainNav) mainNav.classList.remove('active');
                if (hamburgerBtn) hamburgerBtn.classList.remove('active');
                isMenuOpen = false;
            }
        });
    });

    // === 7. Форма обратной связи ===
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            alert('Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время.');
            this.reset();
        });
    }
});
