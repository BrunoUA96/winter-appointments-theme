/**
 * Sticky Navbar with Scroll Effect
 * Добавляет эффект при скролле для навигации
 */

(function() {
    'use strict';
    
    let lastScrollTop = 0;
    let ticking = false;
    
    function handleScroll() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
        
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Добавляем класс при скролле вниз
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
        ticking = false;
    }
    
    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(handleScroll);
            ticking = true;
        }
    }
    
    // Инициализация
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            window.addEventListener('scroll', onScroll, { passive: true });
            handleScroll(); // Проверяем начальное состояние
        });
    } else {
        window.addEventListener('scroll', onScroll, { passive: true });
        handleScroll(); // Проверяем начальное состояние
    }
    
    // Обработка PJAX переходов
    document.addEventListener('pjax:complete', function() {
        handleScroll();
    });
})();

