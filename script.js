window.addEventListener('DOMContentLoaded', function() {
    // 1. Параллакс-эффект для hero
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', function() {
            if (window.innerWidth > 900) {
                const y = window.scrollY * 0.4;
                hero.style.backgroundPosition = `center calc(50% + ${y}px)`;
            } else {
                hero.style.backgroundPosition = '';
            }
        });
    }

    // 2. Анимация появления секций при скролле
    const revealEls = document.querySelectorAll('section, .menu-item, .service-card, .gallery-item, .review');
    function revealOnScroll() {
        const trigger = window.innerHeight * 0.92;
        revealEls.forEach(el => {
            if (!el.classList.contains('reveal')) el.classList.add('reveal');
            const rect = el.getBoundingClientRect();
            if (rect.top < trigger) {
                el.classList.add('revealed');
            }
        });
    }
    window.addEventListener('scroll', revealOnScroll);
    window.addEventListener('resize', revealOnScroll);
    setTimeout(revealOnScroll, 200);

    // 12. Появление header при скролле вверх
    let lastScrollY = window.scrollY;
    let stickyTimeout = null;
    const header = document.getElementById('mainHeader');
    window.addEventListener('scroll', function() {
        const currY = window.scrollY;
        if (!header) return;
        if (currY < lastScrollY && currY > 100) {
            header.classList.add('sticky-show');
            clearTimeout(stickyTimeout);
            stickyTimeout = setTimeout(() => header.classList.remove('sticky-show'), 1200);
        }
        lastScrollY = currY;
    });

    // Меню и скролл-логика
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mainNav = document.getElementById('mainNav');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navUl = document.querySelector('nav ul');
    let lastScrollTop = 0;
    let isMenuOpen = false;

    // Скрытие/показ header при скролле
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > 100 && !isMenuOpen) {
            header && header.classList.add('collapsed');
        } else if (scrollTop <= 50) {
            header && header.classList.remove('collapsed');
            mainNav && mainNav.classList.remove('active');
            hamburgerBtn && hamburgerBtn.classList.remove('active');
            isMenuOpen = false;
        }
        lastScrollTop = scrollTop;
    });

    // Hamburger toggle
    if (hamburgerBtn && mainNav && header) {
        hamburgerBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            isMenuOpen = !isMenuOpen;
            this.classList.toggle('active');
            mainNav.classList.toggle('active');
            if (isMenuOpen) {
                header.classList.add('collapsed');
            }
        });
    }

    // Mobile menu toggle
    if (mobileMenuBtn && navUl) {
        mobileMenuBtn.addEventListener('click', function() {
            navUl.classList.toggle('active');
        });
    }

    // Закрытие меню
    document.addEventListener('click', function(e) {
        if (header && header.classList.contains('collapsed') && 
            !header.contains(e.target) && 
            isMenuOpen) {
            mainNav && mainNav.classList.remove('active');
            hamburgerBtn && hamburgerBtn.classList.remove('active');
            isMenuOpen = false;
        }
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isMenuOpen) {
            mainNav && mainNav.classList.remove('active');
            hamburgerBtn && hamburgerBtn.classList.remove('active');
            isMenuOpen = false;
        }
    });

    // Фильтр меню
    let noItemsMsg = document.createElement('div');
    noItemsMsg.className = 'no-menu-items-msg';
    noItemsMsg.textContent = 'Нет блюд в выбранной категории.';
    const menuItemsContainer = document.querySelector('.menu-items');
    if (menuItemsContainer) {
        menuItemsContainer.appendChild(noItemsMsg);
        noItemsMsg.style.display = 'none';
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
            noItemsMsg.style.display = shown === 0 ? '' : 'none';
        }
        localStorage.setItem('menuCategory', category);
    }
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            const category = this.getAttribute('data-category');
            filterMenu(category);
        });
    });
    let savedCategory = localStorage.getItem('menuCategory');
    let initialBtn = savedCategory ? document.querySelector('.menu-category-btn[data-category="' + savedCategory + '"]') : document.querySelector('.menu-category-btn.active');
    if (initialBtn) {
        initialBtn.click();
    }

    // ✅ ПЛАВНЫЙ СКРОЛЛ ТОЛЬКО ПО ЯКОРНЫМ ССЫЛКАМ
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth' // ← остаётся! только для кликов
                });
                // Закрытие меню
                if (navUl) navUl.classList.remove('active');
                if (mainNav) mainNav.classList.remove('active');
                if (hamburgerBtn) hamburgerBtn.classList.remove('active');
                isMenuOpen = false;
            }
        });
    });

    // Отправка формы
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время.');
            this.reset();
        });
    }
});
