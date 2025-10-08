// Header Elements
const header = document.getElementById('mainHeader');
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mainNav = document.getElementById('mainNav');
let lastScrollTop = 0;
let isMenuOpen = false;

const heroBackground = document.getElementById('heroBackground');

window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Parallax effect for hero background
    if (heroBackground && scrollTop < 600) {
        const parallaxSpeed = 0.5;
        heroBackground.style.transform = `translateY(${scrollTop * parallaxSpeed}px)`;
    }
    
    // Header collapse on scroll
    if (scrollTop > 100 && !isMenuOpen) {
        header.classList.add('collapsed');
    } else if (scrollTop <= 50) {
        header.classList.remove('collapsed');
        mainNav.classList.remove('active');
        hamburgerBtn.classList.remove('active');
        isMenuOpen = false;
    }
    
    lastScrollTop = scrollTop;
});

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            
            // Анимация для карточек меню с задержкой
            if (entry.target.id === 'menu') {
                const menuItems = entry.target.querySelectorAll('.menu-item');
                menuItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.style.animation = `showItem 0.5s ease forwards`;
                    }, index * 50);
                });
            }
            
            // Анимация для карточек услуг
            if (entry.target.id === 'services') {
                const serviceCards = entry.target.querySelectorAll('.service-card');
                serviceCards.forEach((card, index) => {
                    setTimeout(() => {
                        card.style.animation = `showItem 0.5s ease forwards`;
                    }, index * 100);
                });
            }
            
            // Анимация для отзывов
            if (entry.target.id === 'reviews') {
                const reviews = entry.target.querySelectorAll('.review');
                reviews.forEach((review, index) => {
                    setTimeout(() => {
                        review.style.animation = `showItem 0.5s ease forwards`;
                    }, index * 150);
                });
            }
        }
    });
}, observerOptions);

// Применяем observer ко всем секциям с классом scroll-reveal
document.querySelectorAll('.scroll-reveal').forEach(section => {
    observer.observe(section);
});

const quotes = document.querySelectorAll('.quote');
let currentQuote = 0;

function rotateQuotes() {
    quotes[currentQuote].classList.remove('active');
    currentQuote = (currentQuote + 1) % quotes.length;
    quotes[currentQuote].classList.add('active');
}

// Меняем цитаты каждые 5 секунд
setInterval(rotateQuotes, 5000);

hamburgerBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    isMenuOpen = !isMenuOpen;
    this.classList.toggle('active');
    mainNav.classList.toggle('active');
    if (isMenuOpen) {
        header.classList.add('collapsed');
    }
});

// Mobile menu toggle (for non-collapsed header)
mobileMenuBtn.addEventListener('click', function() {
    const navUl = document.querySelector('nav ul');
    navUl.classList.toggle('active');
});

// Close menu when clicking outside
document.addEventListener('click', function(e) {
    if (header.classList.contains('collapsed') && 
        !header.contains(e.target) && 
        isMenuOpen) {
        mainNav.classList.remove('active');
        hamburgerBtn.classList.remove('active');
        isMenuOpen = false;
    }
});

document.querySelectorAll('.menu-category-btn').forEach(button => {
    button.addEventListener('click', function() {
        // Убираем активный класс со всех кнопок
        document.querySelectorAll('.menu-category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        this.classList.add('active');
        
        const category = this.getAttribute('data-category');
        const menuItems = document.querySelectorAll('.menu-item');
        
        // Сначала скрываем все элементы с анимацией
        menuItems.forEach(item => {
            const shouldShow = category === 'all' || item.getAttribute('data-category') === category;
            
            if (!shouldShow) {
                item.classList.add('hiding');
                setTimeout(() => {
                    item.style.display = 'none';
                    item.classList.remove('hiding');
                }, 500);
            }
        });
        
        // Затем показываем нужные элементы с анимацией
        setTimeout(() => {
            menuItems.forEach((item, index) => {
                const shouldShow = category === 'all' || item.getAttribute('data-category') === category;
                
                if (shouldShow) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.classList.add('showing');
                        setTimeout(() => {
                            item.classList.remove('showing');
                        }, 500);
                    }, index * 50);
                }
            });
        }, 100);
    });
});

const sliderTrack = document.querySelector('.gallery-slider-track');
const slides = document.querySelectorAll('.gallery-slide');
const prevBtn = document.querySelector('.slider-btn.prev');
const nextBtn = document.querySelector('.slider-btn.next');
const dotsContainer = document.querySelector('.slider-dots');

let currentSlide = 0;
const totalSlides = slides.length;

// Создаем точки для слайдера
for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
}

const dots = document.querySelectorAll('.dot');

function updateSlider() {
    sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    // Обновляем активную точку
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateSlider();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateSlider();
}

function goToSlide(index) {
    currentSlide = index;
    updateSlider();
}

nextBtn.addEventListener('click', nextSlide);
prevBtn.addEventListener('click', prevSlide);

// Автоматическая смена слайдов каждые 5 секунд
let autoSlideInterval = setInterval(nextSlide, 5000);

// Останавливаем автопрокрутку при наведении
document.querySelector('.gallery-slider').addEventListener('mouseenter', () => {
    clearInterval(autoSlideInterval);
});

// Возобновляем автопрокрутку при уходе курсора
document.querySelector('.gallery-slider').addEventListener('mouseleave', () => {
    autoSlideInterval = setInterval(nextSlide, 5000);
});

// Поддержка свайпов на мобильных устройствах
let touchStartX = 0;
let touchEndX = 0;

sliderTrack.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

sliderTrack.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    if (touchEndX < touchStartX - 50) {
        nextSlide();
    }
    if (touchEndX > touchStartX + 50) {
        prevSlide();
    }
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
            
            // Закрываем меню после перехода
            document.querySelector('nav ul').classList.remove('active');
            mainNav.classList.remove('active');
            hamburgerBtn.classList.remove('active');
            isMenuOpen = false;
        }
    });
});

document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Анимация успешной отправки
    const form = this;
    const submitBtn = form.querySelector('.btn');
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Отправка...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        submitBtn.textContent = '✓ Отправлено!';
        submitBtn.style.background = '#4CAF50';
        
        setTimeout(() => {
            alert('Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время.');
            form.reset();
            submitBtn.textContent = originalText;
            submitBtn.style.background = '';
            submitBtn.disabled = false;
        }, 1500);
    }, 1000);
});

document.addEventListener('keydown', function(e) {
    // Навигация по слайдеру стрелками
    if (e.key === 'ArrowLeft') {
        prevSlide();
    } else if (e.key === 'ArrowRight') {
        nextSlide();
    }
});

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Оптимизированная версия обработчика прокрутки
const optimizedScroll = debounce(function() {
    // Дополнительная логика при необходимости
}, 10);

window.addEventListener('scroll', optimizedScroll);

console.log('🎉 Сайт "Барашкина радость" загружен со всеми анимациями!');
