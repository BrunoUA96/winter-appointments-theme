/**
 * Нативное PJAX решение с анимациями переходов
 * Совместимо с Winter CMS
 * 
 * Использование:
 * - Обычные ссылки используют fade анимацию по умолчанию
 * - Для других анимаций добавьте data-transition="название" к ссылке:
 *   - data-transition="fade" - плавное появление/исчезновение
 *   - data-transition="slideLeft" - слайд влево
 *   - data-transition="slideRight" - слайд вправо
 *   - data-transition="slideUp" - слайд вверх
 *   - data-transition="scale" - масштабирование
 * 
 * - Для отключения PJAX добавьте data-no-pjax к ссылке
 * 
 * Примеры:
 * <a href="/page">Обычная ссылка (fade)</a>
 * <a href="/page" data-transition="slideLeft">Слайд влево</a>
 * <a href="/page" data-transition="slideRight">Слайд вправо</a>
 * <a href="/page" data-no-pjax>Обычная загрузка</a>
 */
(function() {
    'use strict';
    
    const container = document.getElementById('layout-content');
    if (!container) return;
    
    // Помечаем, что PJAX включен (для прелоадера)
    window.isPjaxEnabled = true;
    
    let isTransitioning = false;
    let currentAnimation = 'fade'; // По умолчанию fade
    
    // Настройки анимаций
    const animations = {
        fade: {
            duration: 400,
            leave: (el) => {
                el.style.transition = 'opacity 0.4s ease-out';
                el.style.opacity = '0';
            },
            enter: (el) => {
                el.style.opacity = '0';
                el.style.transition = 'opacity 0.4s ease-in';
                requestAnimationFrame(() => {
                    el.style.opacity = '1';
                });
            }
        },
        slideLeft: {
            duration: 500,
            leave: (el) => {
                el.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s';
                el.style.transform = 'translateX(-100%)';
                el.style.opacity = '0';
            },
            enter: (el) => {
                el.style.opacity = '0';
                el.style.transform = 'translateX(100%)';
                el.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s';
                requestAnimationFrame(() => {
                    el.style.transform = 'translateX(0)';
                    el.style.opacity = '1';
                });
            }
        },
        slideRight: {
            duration: 500,
            leave: (el) => {
                el.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s';
                el.style.transform = 'translateX(100%)';
                el.style.opacity = '0';
            },
            enter: (el) => {
                el.style.opacity = '0';
                el.style.transform = 'translateX(-100%)';
                el.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s';
                requestAnimationFrame(() => {
                    el.style.transform = 'translateX(0)';
                    el.style.opacity = '1';
                });
            }
        },
        slideUp: {
            duration: 500,
            leave: (el) => {
                el.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s';
                el.style.transform = 'translateY(-100%)';
                el.style.opacity = '0';
            },
            enter: (el) => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
                el.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s';
                requestAnimationFrame(() => {
                    el.style.transform = 'translateY(0)';
                    el.style.opacity = '1';
                });
            }
        },
        scale: {
            duration: 400,
            leave: (el) => {
                el.style.transition = 'transform 0.4s ease-out, opacity 0.4s';
                el.style.transform = 'scale(0.95)';
                el.style.opacity = '0';
            },
            enter: (el) => {
                el.style.opacity = '0';
                el.style.transform = 'scale(1.05)';
                el.style.transition = 'transform 0.4s ease-out, opacity 0.4s';
                requestAnimationFrame(() => {
                    el.style.transform = 'scale(1)';
                    el.style.opacity = '1';
                });
            }
        }
    };
    
    // Перехватываем клики по ссылкам
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a[href]');
        if (!link || isTransitioning) return;
        
        // Игнорируем внешние ссылки, якоря, и ссылки с data-no-pjax
        if (link.hostname !== window.location.hostname || 
            link.hash || 
            link.hasAttribute('data-no-pjax') ||
            link.target === '_blank' ||
            link.hasAttribute('download') ||
            link.getAttribute('href') === '#' ||
            link.getAttribute('href') === '') {
            return;
        }
        
        // Определяем тип анимации из data-атрибута
        const animationType = link.getAttribute('data-transition') || 'fade';
        if (animations[animationType]) {
            currentAnimation = animationType;
        }
        
        e.preventDefault();
        loadPage(link.href, currentAnimation);
    });
    
    function loadPage(url, animationType = 'fade') {
        if (isTransitioning) return;
        isTransitioning = true;
        
        const anim = animations[animationType] || animations.fade;
        
        // Показываем легкий индикатор загрузки
        showLoadingIndicator();
        
        // Анимация ухода
        anim.leave(container);
        
        // Загружаем новую страницу
        fetch(url, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.text();
            })
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const newContent = doc.getElementById('layout-content');
                
                if (newContent) {
                    // Ждем завершения анимации ухода
                    setTimeout(() => {
                        // Заменяем контент
                        container.innerHTML = newContent.innerHTML;
                        
                        // Обновляем title
                        const newTitle = doc.querySelector('title');
                        if (newTitle) {
                            document.title = newTitle.textContent;
                        }
                        
                        // Обновляем meta теги (опционально)
                        const newMeta = doc.querySelector('meta[name="description"]');
                        if (newMeta) {
                            let metaDesc = document.querySelector('meta[name="description"]');
                            if (metaDesc) {
                                metaDesc.setAttribute('content', newMeta.getAttribute('content'));
                            }
                        }
                        
                        // Обновляем URL без перезагрузки
                        window.history.pushState({}, '', url);
                        
                        // Анимация входа
                        anim.enter(container);
                        
                        // Переинициализация после завершения анимации
                        setTimeout(() => {
                            hideLoadingIndicator();
                            reinitialize();
                            isTransitioning = false;
                        }, anim.duration);
                    }, anim.duration);
                } else {
                    // Fallback на обычную загрузку
                    hideLoadingIndicator();
                    window.location.href = url;
                    isTransitioning = false;
                }
            })
            .catch(() => {
                // Fallback на обычную загрузку при ошибке
                hideLoadingIndicator();
                window.location.href = url;
                isTransitioning = false;
            });
    }
    
    function showLoadingIndicator() {
        let indicator = document.getElementById('pjax-loading-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'pjax-loading-indicator';
            indicator.className = 'pjax-loading';
            document.body.appendChild(indicator);
        }
        indicator.classList.add('active');
    }
    
    function hideLoadingIndicator() {
        const indicator = document.getElementById('pjax-loading-indicator');
        if (indicator) {
            indicator.classList.remove('active');
            // Удаляем после анимации
            setTimeout(() => {
                if (indicator && indicator.parentNode) {
                    indicator.remove();
                }
            }, 500);
        }
    }
    
    function reinitialize() {
        // Переинициализация Snowboard (если нужно)
        if (window.Snowboard) {
            // Snowboard обычно переинициализируется автоматически
            // Но можно принудительно обновить компоненты через события
            document.dispatchEvent(new Event('snowboard:reinit'));
        }
        
        // Переинициализация reCAPTCHA
        reinitializeRecaptcha();
        
        // Переинициализация ваших скриптов
        // Например, если есть формы или другие интерактивные элементы
        
        // Обновление CSRF токенов
        const csrfToken = document.querySelector('meta[name="csrf-token"]');
        if (csrfToken) {
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                const tokenInput = form.querySelector('input[name="_token"]');
                if (tokenInput && csrfToken.content) {
                    tokenInput.value = csrfToken.content;
                }
            });
        }
        
        // Прокрутка наверх (опционально)
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Запуск анимаций контента (если они есть)
        document.body.classList.add('page-loaded');
    }
    
    function reinitializeRecaptcha() {
        // Проверяем, есть ли элементы reCAPTCHA на странице
        const recaptchaElements = document.querySelectorAll('.g-recaptcha');
        
        if (recaptchaElements.length === 0) {
            return; // Нет reCAPTCHA на странице
        }
        
        // Ждем немного, чтобы убедиться, что DOM обновлен и скрипт reCAPTCHA загружен
        setTimeout(() => {
            // Проверяем, загружен ли скрипт reCAPTCHA
            if (typeof grecaptcha === 'undefined') {
                // Если скрипт не загружен, ждем его загрузки
                waitForRecaptchaScript().then(() => {
                    renderRecaptchaWidgets(recaptchaElements);
                }).catch(() => {
                    console.warn('reCAPTCHA script not available');
                });
            } else {
                // Скрипт уже загружен, переинициализируем виджеты
                renderRecaptchaWidgets(recaptchaElements);
            }
        }, 200);
    }
    
    function waitForRecaptchaScript() {
        return new Promise((resolve, reject) => {
            // Если grecaptcha уже доступен
            if (typeof grecaptcha !== 'undefined') {
                resolve();
                return;
            }
            
            // Проверяем, есть ли скрипт в DOM
            const existingScript = document.querySelector('script[src*="recaptcha/api.js"]');
            if (existingScript) {
                // Скрипт есть в DOM, ждем его загрузки
                let attempts = 0;
                const maxAttempts = 50; // 5 секунд максимум
                
                const checkInterval = setInterval(() => {
                    attempts++;
                    if (typeof grecaptcha !== 'undefined') {
                        clearInterval(checkInterval);
                        resolve();
                    } else if (attempts >= maxAttempts) {
                        clearInterval(checkInterval);
                        reject(new Error('reCAPTCHA script timeout'));
                    }
                }, 100);
            } else {
                // Скрипта нет в DOM, возможно он загружается из шаблона
                // Ждем немного и проверяем снова
                setTimeout(() => {
                    if (typeof grecaptcha !== 'undefined') {
                        resolve();
                    } else {
                        reject(new Error('reCAPTCHA script not found'));
                    }
                }, 1000);
            }
        });
    }
    
    function renderRecaptchaWidgets(recaptchaElements) {
        recaptchaElements.forEach((element, index) => {
            // Получаем sitekey и callback из data-атрибутов (как в оригинальном шаблоне)
            const sitekey = element.getAttribute('data-sitekey');
            const callback = element.getAttribute('data-callback') || null;
            
            if (!sitekey) {
                console.warn('reCAPTCHA element missing data-sitekey attribute');
                return;
            }
            
            // Проверяем, не был ли виджет уже отрендерен
            const existingWidget = element.querySelector('iframe, div[data-sitekey]');
            if (existingWidget) {
                // Виджет уже существует, очищаем его для пересоздания
                element.innerHTML = '';
            }
            
            // Если элемент пустой, создаем новый виджет
            // Используем тот же подход, что и в оригинале - через grecaptcha.render()
            if (element.innerHTML.trim() === '') {
                // Создаем уникальный ID для виджета, если его еще нет
                if (!element.id) {
                    element.id = 'recaptcha-widget-' + Date.now() + '-' + index;
                }
                
                // Рендерим виджет reCAPTCHA с теми же параметрами, что и в оригинале
                try {
                    grecaptcha.render(element.id, {
                        'sitekey': sitekey,
                        'callback': callback,
                        'size': 'normal',
                        'theme': 'light'
                    });
                } catch (error) {
                    console.error('Error rendering reCAPTCHA:', error);
                    // Пытаемся еще раз через небольшую задержку
                    setTimeout(() => {
                        try {
                            grecaptcha.render(element.id, {
                                'sitekey': sitekey,
                                'callback': callback,
                                'size': 'normal',
                                'theme': 'light'
                            });
                        } catch (retryError) {
                            console.error('Error rendering reCAPTCHA on retry:', retryError);
                        }
                    }, 500);
                }
            }
        });
    }
    
    // Обработка кнопок назад/вперед
    window.addEventListener('popstate', () => {
        if (!isTransitioning) {
            loadPage(window.location.href, 'fade');
        }
    });
    
    // Инициализация при загрузке страницы
    // Убеждаемся, что контент видим (если прелоадер не показался)
    function initContainer() {
        // Проверяем, был ли показан прелоадер
        const preloader = document.getElementById('preloader');
        if (!preloader || preloader.classList.contains('hidden')) {
            // Если прелоадер не показался или уже скрыт, показываем контент
            container.style.opacity = '1';
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initContainer);
    } else {
        initContainer();
    }
    
    // Также слушаем событие скрытия прелоадера
    document.addEventListener('preloader-hidden', () => {
        container.style.opacity = '1';
    });
})();

