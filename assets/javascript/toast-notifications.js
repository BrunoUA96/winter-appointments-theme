/**
 * Toast Notifications System
 * Система уведомлений вместо простых alert
 */

(function() {
    'use strict';
    
    // Создаем контейнер для toast-уведомлений
    function createToastContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            container.setAttribute('aria-live', 'polite');
            container.setAttribute('aria-atomic', 'true');
            document.body.appendChild(container);
        }
        return container;
    }
    
    // Показать toast-уведомление
    function showToast(message, type = 'info', duration = 5000) {
        const container = createToastContainer();
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        
        // Иконки для разных типов
        const icons = {
            success: '✓',
            error: '⚠️',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        // Цвета для разных типов
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        
        toast.innerHTML = `
            <div class="toast-icon" style="background-color: ${colors[type] || colors.info}">
                ${icons[type] || icons.info}
            </div>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" aria-label="Fechar" onclick="this.parentElement.remove()">
                ×
            </button>
        `;
        
        container.appendChild(toast);
        
        // Анимация появления
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        
        // Автоматическое скрытие
        if (duration > 0) {
            setTimeout(() => {
                hideToast(toast);
            }, duration);
        }
        
        return toast;
    }
    
    // Скрыть toast
    function hideToast(toast) {
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }
    
    // Экспортируем функции
    window.showToast = showToast;
    window.hideToast = hideToast;
    
    // Инициализация контейнера при загрузке
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createToastContainer);
    } else {
        createToastContainer();
    }
})();

