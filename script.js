
// === МОБИЛЬНОЕ МЕНЮ, КОРЗИНА И КУКИ ===

// --- Куки-консенс и Метрика (глобальные помощники) ---
// Ключ для хранения статуса согласия на cookies / локальное хранилище
const CONSENT_STORAGE_KEY = 'cookieConsent'; // values: 'accepted' | 'declined'

function getConsentStatus() {
    try {
        return localStorage.getItem(CONSENT_STORAGE_KEY);
    } catch (e) {
        return null;
    }
}

function setConsentStatus(status) {
    try {
        localStorage.setItem(CONSENT_STORAGE_KEY, status);
    } catch (e) {}
}

function createCookieBanner() {
    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.innerHTML = `
            <div class="cookie-banner__text">
                Мы используем cookies для улучшения работы сайта и анализа статистики. 
                Вы можете <a href="#" class="cookie-policy-link">ознакомиться с политикой конфиденциальности</a>, 
                а затем выбрать — согласиться или отказаться.
            </div>
            <div class="cookie-banner__actions">
                <button type="button" class="cookie-btn cookie-btn--decline">Отказаться</button>
                <button type="button" class="cookie-btn cookie-btn--accept">Согласиться</button>
            </div>
        `;
    document.body.appendChild(banner);
    return banner;
}

function showCookieBanner() {
    const existing = document.querySelector('.cookie-banner');
    const banner = existing || createCookieBanner();
    banner.classList.add('show');
    const declineBtn = banner.querySelector('.cookie-btn--decline');
    const acceptBtn = banner.querySelector('.cookie-btn--accept');

    declineBtn.onclick = () => {
        setConsentStatus('declined');
        // При отказе гарантируем отсутствие сохранённых данных корзины
        try { localStorage.removeItem('cart'); } catch (e) {}
        banner.classList.remove('show');
        ensureCookieSettingsButtonVisible();
    };

    acceptBtn.onclick = () => {
        setConsentStatus('accepted');
        banner.classList.remove('show');
        ensureCookieSettingsButtonVisible();
        loadYandexMetrikaIfConsented();
    };
}

function createCookieSettingsButton() {
    const btn = document.createElement('button');
    btn.className = 'cookie-settings-btn';
    btn.setAttribute('aria-label', 'Настройки cookies');
    btn.innerHTML = '⚙️';
    btn.onclick = () => {
        // Сбросить выбор и показать баннер снова
        try { localStorage.removeItem(CONSENT_STORAGE_KEY); } catch (e) {}
        showCookieBanner();
    };
    document.body.appendChild(btn);
    return btn;
}

function ensureCookieSettingsButtonVisible() {
    let btn = document.querySelector('.cookie-settings-btn');
    if (!btn) btn = createCookieSettingsButton();
    btn.classList.add('show');
}

function loadYandexMetrikaIfConsented() {
    if (getConsentStatus() !== 'accepted') return;
    // Не загружать повторно, если уже подгружено
    if (typeof window.ym === 'function') return;
    (function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) { if (document.scripts[j].src === r) { return; } }
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
    })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=104130134', 'ym');
    window.ym && window.ym(104130134, 'init', { ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", accurateTrackBounce:true, trackLinks:true });
}

// Класс для управления корзиной
class Cart {
    constructor() {
        this.items = new Map();
        this.total = 0;
    }

    addItem(id, name, price) {
        console.log('Добавление товара в корзину:', { id, name, price });
        if (!id || !name || !price) {
            console.error('Неверные данные товара:', { id, name, price });
            return;
        }
        
        try {
            if (this.items.has(id)) {
                const item = this.items.get(id);
                item.quantity++;
                console.log('Увеличено количество товара:', item);
            } else {
                this.items.set(id, { id, name, price, quantity: 1 });
                console.log('Добавлен новый товар:', { id, name, price });
            }
            this.updateTotal();
            this.saveToLocalStorage();
        } catch (error) {
            console.error('Ошибка при добавлении товара:', error);
        }
    }

    removeItem(id) {
        if (this.items.has(id)) {
            this.items.delete(id);
            this.updateTotal();
            this.saveToLocalStorage();
        }
    }

    updateQuantity(id, quantity) {
        if (this.items.has(id)) {
            const item = this.items.get(id);
            item.quantity = Math.max(0, quantity);
            if (item.quantity === 0) {
                this.removeItem(id);
            }
            this.updateTotal();
            this.saveToLocalStorage();
        }
    }

    updateTotal() {
        // Подсчет стоимости товаров
        const subtotal = Array.from(this.items.values()).reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        // Стоимость доставки
        const deliveryCost = subtotal >= 1200 ? 0 : 300;

        // Стоимость дополнительных приборов
        const cutlerySelect = document.getElementById('cutleryCount');
        const cutleryCount = cutlerySelect ? parseInt(cutlerySelect.value) : 1;
        const cutleryCost = Math.max(0, cutleryCount - 3) * 30;

        // Общая сумма
        this.total = subtotal + deliveryCost + cutleryCost;

        // Обновляем отображение всех сумм
        const subtotalElement = document.querySelector('#subtotal span');
        const deliveryElement = document.querySelector('#deliveryCost span');
        const cutleryElement = document.querySelector('#cutleryCost span');

        if (subtotalElement) subtotalElement.textContent = subtotal;
        if (deliveryElement) deliveryElement.textContent = deliveryCost;
        if (cutleryElement) cutleryElement.textContent = cutleryCost;
    }

    saveToLocalStorage() {
        // Сохраняем корзину только если пользователь дал согласие на использование cookies/локального хранилища
        if (getConsentStatus() !== 'accepted') {
            // На всякий случай очищаем возможные старые данные
            try { localStorage.removeItem('cart'); } catch (e) {}
            return;
        }
        try {
            const data = Array.from(this.items.entries());
            localStorage.setItem('cart', JSON.stringify(data));
            console.log('Корзина сохранена:', data);
        } catch (error) {
            console.error('Ошибка при сохранении корзины:', error);
        }
    }

    loadFromLocalStorage() {
        // Если пользователь не дал согласие, не восстанавливаем корзину между визитами
        if (getConsentStatus() !== 'accepted') {
            // Очищаем возможные старые данные и работаем только в рамках текущей сессии
            try { localStorage.removeItem('cart'); } catch (e) {}
            this.items = new Map();
            this.updateTotal();
            return;
        }

        const saved = localStorage.getItem('cart');
        if (!saved) {
            this.items = new Map();
            this.updateTotal();
            return;
        }

            try {
                const parsedData = JSON.parse(saved);
                if (Array.isArray(parsedData)) {
                    this.items = new Map(parsedData);
                } else {
                    this.items = new Map();
                }
                this.updateTotal();
            } catch (error) {
                console.error('Ошибка при загрузке корзины:', error);
                this.items = new Map();
                this.updateTotal();
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, инициализация корзины...');
    
    console.log('DOM загружен, начинаем инициализацию...');
    
    // Предотвращаем переход по ссылкам при клике на кнопку заказать
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('order-btn')) {
            console.log('Клик по кнопке заказа:', e.target.dataset);
            e.preventDefault();
            e.stopPropagation();
        }
    });
    // Мобильное меню
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mainNav = document.getElementById('mainNav');
    const navUl = mainNav ? mainNav.querySelector('ul') : null;

    if (hamburgerBtn && mainNav && navUl) {
        hamburgerBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            navUl.classList.toggle('active');
            this.classList.toggle('active');
        });
    }

    // Закрытие меню при клике вне
    document.addEventListener('click', function(e) {
        if (mainNav && navUl && navUl.classList.contains('active')) {
            if (!mainNav.contains(e.target) && !hamburgerBtn.contains(e.target)) {
                navUl.classList.remove('active');
                hamburgerBtn.classList.remove('active');
            }
        }
    });

    // Закрытие по Esc
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navUl && navUl.classList.contains('active')) {
            navUl.classList.remove('active');
            hamburgerBtn.classList.remove('active');
        }
    });

    // Фильтрация меню
    const menuCategories = document.querySelector('.menu-categories');
    const menuItems = document.querySelectorAll('.menu-item');
    
    if (menuCategories && menuItems.length) {
        // При загрузке показываем все элементы
        menuItems.forEach(item => {
            item.style.display = 'block';
        });

        menuCategories.addEventListener('click', function(e) {
            const button = e.target.closest('.menu-category-btn');
            if (!button) return;

            // Убираем активный класс со всех кнопок
            document.querySelectorAll('.menu-category-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            // Добавляем активный класс нажатой кнопке
            button.classList.add('active');

            // Получаем категорию
            const category = button.dataset.category;

            // Фильтруем элементы
            menuItems.forEach(item => {
                if (category === 'all') {
                    item.style.display = 'block';
                    item.style.animation = 'fadeIn 0.5s ease forwards';
                } else {
                    if (item.dataset.category === category) {
                        item.style.display = 'block';
                        item.style.animation = 'fadeIn 0.5s ease forwards';
                    } else {
                        item.style.display = 'none';
                    }
                }
            });
        });
    }

    // Инициализация корзины
    const cart = new Cart();
    cart.loadFromLocalStorage();

    // Получаем ссылки на элементы DOM
    const cartModal = document.getElementById('cartModal');
    const cartButton = document.getElementById('cartButton');
    const closeModal = document.querySelector('.close-modal');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartCount = document.querySelector('.cart-count');
    const orderForm = document.getElementById('orderForm');

    // Обработчики кнопок заказа
    const orderButtons = document.querySelectorAll('.order-btn');
    console.log('Найдено кнопок заказа:', orderButtons.length);
    
    if (orderButtons.length === 0) {
        console.error('Не найдено ни одной кнопки заказа!');
    }
    
    orderButtons.forEach(btn => {
        console.log('Добавляем обработчик для кнопки:', btn.dataset);
        btn.addEventListener('click', function(e) {
            console.log('Клик зарегистрирован');
            e.preventDefault();
            e.stopPropagation();
            
            const { id, name, price } = this.dataset;
            console.log('Данные товара для добавления:', { id, name, price });
            
            if (!id || !name || !price) {
                console.error('Отсутствуют необходимые данные товара:', this.dataset);
                return;
            }
            
            cart.addItem(id, name, parseInt(price));
            console.log('Товар добавлен в корзину');
            updateCartUI();
            showNotification('Товар добавлен в корзину');
        });
    });

    // Открытие/закрытие модального окна
    if (!cartButton) {
        console.error('Кнопка корзины не найдена!');
    } else {
        console.log('Кнопка корзины найдена');
        cartButton.addEventListener('click', () => {
            console.log('Клик по кнопке корзины');
            if (!cartModal) {
                console.error('Модальное окно не найдено при клике!');
                return;
            }
            console.log('Отображаем модальное окно...');
            cartModal.style.display = 'block';
            console.log('Обновляем UI корзины...');
            updateCartUI();
        });
    }

    closeModal.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });

    window.addEventListener('click', e => {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

    // Обновление UI корзины
    function updateCartUI() {
        console.log('Начинаем обновление UI корзины');
        
        // Проверяем наличие всех необходимых элементов
        if (!cartItems) console.error('Элемент cartItems не найден');
        if (!cartTotal) console.error('Элемент cartTotal не найден');
        if (!cartCount) console.error('Элемент cartCount не найден');
        if (!cartModal) console.error('Элемент cartModal не найден');
        
        if (!cartItems || !cartTotal || !cartCount || !cartModal) {
            console.error('Отсутствуют необходимые элементы корзины');
            return;
        }
        
        cartItems.innerHTML = '';
        cartTotal.textContent = cart.total;
        console.log('Обновляем содержимое корзины:', {
            total: cart.total,
            itemsCount: cart.items.size
        });
        updateCartButton();

        cart.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.price} ₽</p>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" data-id="${item.id}" data-action="decrease">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" data-id="${item.id}" data-action="increase">+</button>
                </div>
            `;
            cartItems.appendChild(itemElement);
        });
    }

    // Обработка изменения количества
    cartItems.addEventListener('click', e => {
        if (e.target.classList.contains('quantity-btn')) {
            const { id, action } = e.target.dataset;
            const item = cart.items.get(id);
            if (item) {
                if (action === 'increase') {
                    cart.updateQuantity(id, item.quantity + 1);
                } else if (action === 'decrease') {
                    cart.updateQuantity(id, item.quantity - 1);
                }
                updateCartUI();
            }
        }
    });

    // Валидация формы
    function validatePhone(phone) {
        return /^\+7\([0-9]{3}\)[0-9]{3}-[0-9]{2}-[0-9]{2}$/.test(phone);
    }

    function validateName(name) {
        return /^[А-Яа-яЁё\s-]{2,50}$/.test(name);
    }

    function formatPhone(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length > 0) {
            if (value[0] !== '7') value = '7' + value;
            value = '+' + value.substring(0, 11);
            value = value.replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, '$1($2)$3-$4-$5');
        }
        return value;
    }

    // Автоматическое форматирование телефона
    const phoneInput = document.getElementById('orderPhone');
    phoneInput.addEventListener('input', function() {
        this.value = formatPhone(this);
    });

    // Обработка отправки формы
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('orderName').value;
        const phone = document.getElementById('orderPhone').value;
        const address = document.getElementById('orderAddress').value;

        if (!validateName(name)) {
            showNotification('Пожалуйста, введите корректное имя', true);
            return;
        }

        if (!validatePhone(phone)) {
            showNotification('Пожалуйста, введите корректный номер телефона', true);
            return;
        }

        if (address.length < 10 || address.length > 200) {
            showNotification('Адрес должен содержать от 10 до 200 символов', true);
            return;
        }

        // Здесь можно добавить отправку заказа на сервер
        const order = {
            items: Array.from(cart.items.values()),
            total: cart.total,
            customer: { name, phone, address }
        };

        console.log('Заказ оформлен:', order);
        
        // Очистка корзины
        cart.items.clear();
        cart.updateTotal();
        cart.saveToLocalStorage();
        updateCartUI();
        
        showNotification('Заказ успешно оформлен! Мы свяжемся с вами в ближайшее время.');
        cartModal.style.display = 'none';
        orderForm.reset();
    });

    // Уведомления
    function showNotification(message, isError = false) {
        const notification = document.createElement('div');
        notification.className = `notification ${isError ? 'error' : 'success'}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Функция обновления состояния кнопки корзины
    function updateCartButton() {
        const itemsCount = Array.from(cart.items.values()).reduce((sum, item) => sum + item.quantity, 0);
        cartButton.classList.toggle('has-items', itemsCount > 0);
        cartCount.textContent = itemsCount;
    }

    // Обработчик изменения количества приборов
    const cutlerySelect = document.getElementById('cutleryCount');
    if (cutlerySelect) {
        cutlerySelect.addEventListener('change', () => {
            cart.updateTotal();
            updateCartUI();
        });
    }

    // Обработчик очистки корзины
    const clearCartBtn = document.getElementById('clearCart');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            cart.items.clear();
            cart.updateTotal();
            cart.saveToLocalStorage();
            updateCartUI();
            showNotification('Корзина очищена');
        });
    }

    // Проверка согласия с политикой конфиденциальности
    const privacyCheckbox = document.getElementById('privacyPolicy');
    const orderSubmitBtn = document.querySelector('.order-submit-btn');
    
    if (privacyCheckbox && orderSubmitBtn) {
        orderSubmitBtn.disabled = !privacyCheckbox.checked;
        
        privacyCheckbox.addEventListener('change', () => {
            orderSubmitBtn.disabled = !privacyCheckbox.checked;
        });
    }

    // Начальное обновление UI
    updateCartUI();
    updateCartButton();

    // Инициализация согласия
    const consent = getConsentStatus();
    if (consent === 'accepted') {
        // Принял cookies ранее: просто подгружаем Метрику и показываем кнопку настроек
        loadYandexMetrikaIfConsented();
        ensureCookieSettingsButtonVisible();
    } else {
        // Впервые на сайте ИЛИ ранее выбрал отказ:
        // показываем баннер каждый раз при новом заходе,
        // пока пользователь не согласится.
        showCookieBanner();
    }
});
