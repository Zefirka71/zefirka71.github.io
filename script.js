window.addEventListener('DOMContentLoaded', function() {
    // === ХЕДЕР: скрытие/показ при скролле + sticky при скролле вверх ===
    const header = document.getElementById('mainHeader');
    if (!header) return;

    let lastScrollTop = 0;
    let lastScrollY = window.scrollY;
    let stickyTimeout = null;
    let isMenuOpen = false;

    // Единственный scroll-обработчик
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // 1. Скрытие/показ основного хедера
        if (scrollTop > 100 && !isMenuOpen) {
            header.classList.add('collapsed');
        } else if (scrollTop <= 50) {
            header.classList.remove('collapsed');
        }

        // 2. Появление sticky-хедера при скролле ВВЕРХ (и если уже прокрутили)
        if (scrollTop < lastScrollY && scrollTop > 100) {
            header.classList.add('sticky-show');
            clearTimeout(stickyTimeout);
            stickyTimeout = setTimeout(() => {
                header.classList.remove('sticky-show');
            }, 1200);
        }

        lastScrollTop = scrollTop;
        lastScrollY = scrollTop;
    });

    // === МЕНЮ ===
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mainNav = document.getElementById('mainNav');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navUl = document.querySelector('nav ul');

    // Hamburger toggle
    if (hamburgerBtn && mainNav) {
        hamburgerBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            isMenuOpen = !isMenuOpen;
            this.classList.toggle('active');
            mainNav.classList.toggle('active');
            if (isMenuOpen) {
                header.classList.add('collapsed');
            } else {
                // Если меню закрыто и скролл небольшой — убрать collapsed
                if (window.scrollY <= 50) {
                    header.classList.remove('collapsed');
                }
            }
        });
    }

    // Mobile menu toggle (альтернативная кнопка)
    if (mobileMenuBtn && navUl) {
        mobileMenuBtn.addEventListener('click', function() {
            navUl.classList.toggle('active');
        });
    }

    // Закрытие меню по клику вне
    document.addEventListener('click', function(e) {
        if (header.classList.contains('collapsed') && 
            !header.contains(e.target) && 
            isMenuOpen) {
            mainNav.classList.remove('active');
            hamburgerBtn.classList.remove('active');
            isMenuOpen = false;
        }
    });

    // Закрытие по Esc
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isMenuOpen) {
            mainNav.classList.remove('active');
            hamburgerBtn.classList.remove('active');
            isMenuOpen = false;
        }
    });

    // === ФИЛЬТР МЕНЮ ===
    const menuItemsContainer = document.querySelector('.menu-items');
    if (menuItemsContainer) {
        let noItemsMsg = document.createElement('div');
        noItemsMsg.className = 'no-menu-items-msg';
        noItemsMsg.textContent = 'Нет блюд в выбранной категории.';
        noItemsMsg.style.display = 'none';
        menuItemsContainer.appendChild(noItemsMsg);

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
            noItemsMsg.style.display = shown === 0 ? '' : 'none';
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

        // Восстановление категории
        let savedCategory = localStorage.getItem('menuCategory');
        let initialBtn = savedCategory 
            ? document.querySelector(`.menu-category-btn[data-category="${savedCategory}"]`) 
            : document.querySelector('.menu-category-btn.active');
        if (initialBtn) {
            initialBtn.click();
        }
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
                // Закрыть меню
                if (navUl) navUl.classList.remove('active');
                if (mainNav) mainNav.classList.remove('active');
                if (hamburgerBtn) hamburgerBtn.classList.remove('active');
                isMenuOpen = false;
            }
        });
    });

    // === ФОРМА ===
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время.');
            this.reset();
        });
    }
});
