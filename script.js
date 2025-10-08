const header = document.getElementById('mainHeader');
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mainNav = document.getElementById('mainNav');
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
let lastScrollTop = 0;
let isMenuOpen = false;
// Header collapse on scroll
window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
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
// Hamburger menu toggle
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
// Menu Category Filter
document.querySelectorAll('.menu-category-btn').forEach(button => {
    button.addEventListener('click', function() {
        document.querySelectorAll('.menu-category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        this.classList.add('active');
        const category = this.getAttribute('data-category');
        document.querySelectorAll('.menu-item').forEach(item => {
            if (category === 'all' || item.getAttribute('data-category') === category) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
});
// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
            // Close menus
            document.querySelector('nav ul').classList.remove('active');
            mainNav.classList.remove('active');
            hamburgerBtn.classList.remove('active');
            isMenuOpen = false;
        }
    });
});
// Form submission
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время.');
    this.reset();
});
