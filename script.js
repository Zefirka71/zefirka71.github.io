window.addEventListener('DOMContentLoaded', function() {
    // === ОСТАВЛЯЕМ ТОЛЬКО ЛОГИКУ ХЕДЕРА ===

    const header = document.getElementById('mainHeader');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mainNav = document.getElementById('mainNav');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navUl = document.querySelector('nav ul');
    let isMenuOpen = false;

    // Единый scroll-обработчик для хедера
    let lastScrollTop = 0;
    let lastScrollY = window.scrollY;
    let stickyTimeout = null;

    window.addEventListener('scroll', function() {
        if (!header) return;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // 1. Скрытие/показ хедера при скролле вниз/вверх
        if (scrollTop > 100 && !isMenuOpen) {
            header.classList.add('collapsed');
        } else if (scrollTop <= 50) {
            header.classList.remove('collapsed');
            mainNav && mainNav.classList.remove('active');
            hamburgerBtn && hamburgerBtn.classList.remove('active');
            isMenuOpen = false;
        }

        // 2. Появление хедера при скролле вверх (sticky-show)
        const currY = window.scrollY;
        if (currY < lastScrollY && currY > 100) {
            header.classList.add('sticky-show');
            clearTimeout(stickyTimeout);
            stickyTimeout = setTimeout(() => {
                if (header) header.classList.remove('sticky-show');
            }, 1200);
        }
        lastScrollY = currY;
        lastScrollTop = scrollTop;
    });

    // === МЕНЮ ===

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

    // Mobile menu toggle (для не-collapsed header)
    if (mobileMenuBtn && navUl) {
        mobileMenuBtn.addEventListener('click', function() {
            navUl.classList.toggle('active');
        });
    }

    // Закрытие меню по клику вне и по Esc
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

    // === ФИЛЬТР МЕНЮ ===

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

    // Восстановление категории из localStorage
    let savedCategory = localStorage.getItem('menuCategory');
    let initialBtn = savedCategory 
        ? document.querySelector(`.menu-category-btn[data-category="${savedCategory}"]`) 
        : document.querySelector('.menu-category-btn.active');
    if (initialBtn) {
        initialBtn.click();
    }

    // === ПЛАВНЫЙ СКРОЛЛ ПО ЯКОРНЫМ ССЫЛКАМ ===

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
                // Закрытие всех меню
                if (navUl) navUl.classList.remove('active');
                if (mainNav) mainNav.classList.remove('active');
                if (hamburgerBtn) hamburgerBtn.classList.remove('active');
                isMenuOpen = false;
            }
        });
    });

    // === ОТПРАВКА ФОРМЫ ===

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время.');
            this.reset();
        });
    }
});
