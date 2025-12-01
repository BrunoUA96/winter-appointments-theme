/**
 * Preloader Animation
 * Красивая анимация загрузки с логотипом
 */

(function() {
    'use strict';
    
    // Проверяем, используется ли PJAX (прелоадер только при первой загрузке)
    if (window.isPjaxEnabled) {
        // Если PJAX включен, прелоадер не нужен для переходов
        // Показываем только при первой загрузке страницы
        const isFirstLoad = !sessionStorage.getItem('pjax-initialized');
        if (!isFirstLoad) {
            return;
        }
        sessionStorage.setItem('pjax-initialized', 'true');
    }
    
    // Проверяем, что DOM загружен
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPreloader);
    } else {
        initPreloader();
    }
    
    function initPreloader() {
        const preloader = document.getElementById('preloader');
        
        if (!preloader) {
            return;
        }
        
        // Проверяем, загружена ли страница
        const checkLoad = () => {
            if (document.readyState === 'complete') {
                // Даем время для завершения анимаций
                setTimeout(() => {
                    hidePreloader(preloader);
                }, 2000);
            }
        };
        
        // Если страница уже загружена
        if (document.readyState === 'complete') {
            setTimeout(checkLoad, 1500);
        } else {
            // Ждем полной загрузки страницы
            window.addEventListener('load', () => {
                setTimeout(checkLoad, 1200);
            });
        }
        
        // Fallback: скрываем прелоадер через максимум 6 секунд
        setTimeout(() => {
            if (!preloader.classList.contains('hidden')) {
                setTimeout(() => {
                    hidePreloader(preloader);
                }, 500);
            }
        }, 6000);
    }
    
    function hidePreloader(preloader) {
        // Просто скрываем прелоадер без анимации перехода логотипа
        hidePreloaderSimple(preloader);
    }
    
    function hidePreloaderSimple(preloader) {
        // Добавляем класс для плавного исчезновения
        preloader.classList.add('hidden');
        
        // Добавляем класс на body для запуска анимаций контента
        document.body.classList.add('preloader-hidden');
        
        // Отправляем кастомное событие для PJAX
        document.dispatchEvent(new CustomEvent('preloader-hidden'));
        
        // Удаляем прелоадер из DOM после анимации
        setTimeout(() => {
            if (preloader.parentNode) {
                preloader.remove();
            }
            
            // Разрешаем прокрутку страницы
            document.body.style.overflow = '';
        }, 600);
    }
    
    // Анимация SVG логотипа (теперь встроен в HTML, не нужно загружать)
    function initLogoAnimation() {
        const logoSvg = document.querySelector('#preloader-logo .logo-svg');
        if (logoSvg) {
            // SVG уже встроен, анимации запустятся автоматически через CSS
            // Можно добавить дополнительные эффекты при необходимости
        }
    }
    
    // Запускаем инициализацию сразу
    initLogoAnimation();
})();

