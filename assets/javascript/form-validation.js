/**
 * Real-time Form Validation
 * Валидация формы в реальном времени с улучшенным UX
 */

(function() {
    'use strict';
    
    // Правила валидации для каждого поля
    const validationRules = {
        patient_name: {
            required: true,
            minLength: 2,
            maxLength: 100,
            pattern: /^[a-zA-ZÀ-ÿ\s'-]+$/,
            messages: {
                required: 'Por favor, insira seu nome.',
                minLength: 'O nome deve ter pelo menos 2 caracteres.',
                maxLength: 'O nome não pode ter mais de 100 caracteres.',
                pattern: 'O nome deve conter apenas letras.'
            }
        },
        email: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            messages: {
                required: 'Por favor, insira seu email.',
                pattern: 'Por favor, insira um email válido.'
            }
        },
        phone: {
            required: true,
            pattern: /^[\d\s\-\+\(\)]+$/,
            minLength: 9,
            messages: {
                required: 'Por favor, insira seu telefone.',
                pattern: 'Por favor, insira um telefone válido.',
                minLength: 'O telefone deve ter pelo menos 9 dígitos.'
            }
        },
        consultation_type_id: {
            required: true,
            messages: {
                required: 'Por favor, selecione um tipo de consulta.'
            }
        },
        appointment_date: {
            required: true,
            messages: {
                required: 'Por favor, selecione uma data no calendário.'
            }
        },
        appointment_time: {
            required: true,
            messages: {
                required: 'Por favor, selecione um horário disponível.'
            }
        },
        description: {
            maxLength: 1000,
            messages: {
                maxLength: 'A descrição não pode ter mais de 1000 caracteres.'
            }
        }
    };
    
    // Инициализация валидации
    function initValidation() {
        const form = document.querySelector('form[data-request="onSaveBooking"]');
        if (!form) return;
        
        // Добавляем обработчики для всех полей
        const fields = form.querySelectorAll('input, select, textarea');
        fields.forEach(field => {
            const fieldName = field.name || field.id;
            
            // Валидация при потере фокуса
            field.addEventListener('blur', function() {
                validateField(this, fieldName);
            });
            
            // Валидация при вводе (для текстовых полей)
            if (field.type !== 'date' && field.tagName !== 'SELECT') {
                field.addEventListener('input', function() {
                    // Валидируем только если поле уже было в фокусе (touched)
                    if (this.classList.contains('touched')) {
                        validateField(this, fieldName);
                    }
                });
            }
            
            // Отмечаем поле как touched при первом взаимодействии
            field.addEventListener('focus', function() {
                this.classList.add('touched');
            });
            
            // Валидация при изменении (для select и date)
            if (field.tagName === 'SELECT' || field.type === 'date') {
                field.addEventListener('change', function() {
                    validateField(this, fieldName);
                });
            }
            
            // Счетчик символов для textarea
            if (field.tagName === 'TEXTAREA' && field.maxLength) {
                const counter = document.createElement('div');
                counter.className = 'char-counter';
                counter.setAttribute('aria-live', 'polite');
                field.parentNode.appendChild(counter);
                
                function updateCounter() {
                    const remaining = field.maxLength - field.value.length;
                    counter.textContent = `${field.value.length}/${field.maxLength} caracteres`;
                    counter.setAttribute('aria-label', `${remaining} caracteres restantes`);
                    
                    if (remaining < 50) {
                        counter.classList.add('warning');
                    } else {
                        counter.classList.remove('warning');
                    }
                }
                
                field.addEventListener('input', updateCounter);
                updateCounter(); // Инициализация
            }
        });
        
        // Валидация всей формы перед отправкой
        form.addEventListener('submit', function(e) {
            if (!validateForm(form)) {
                e.preventDefault();
                // Прокручиваем к первому полю с ошибкой
                const firstError = form.querySelector('.field-error');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstError.focus();
                }
            }
        });
    }
    
    // Валидация одного поля
    function validateField(field, fieldName) {
        const rules = validationRules[fieldName];
        if (!rules) return true;
        
        const value = field.value.trim();
        const fieldWrapper = field.closest('.form-group');
        if (!fieldWrapper) return true;
        
        // Удаляем предыдущие сообщения об ошибках
        removeFieldError(fieldWrapper);
        
        // Проверка обязательных полей
        if (rules.required && !value) {
            showFieldError(fieldWrapper, rules.messages.required);
            return false;
        }
        
        // Если поле не обязательное и пустое, пропускаем остальные проверки
        if (!value && !rules.required) {
            markFieldAsValid(fieldWrapper);
            return true;
        }
        
        // Проверка минимальной длины
        if (rules.minLength && value.length < rules.minLength) {
            showFieldError(fieldWrapper, rules.messages.minLength);
            return false;
        }
        
        // Проверка максимальной длины
        if (rules.maxLength && value.length > rules.maxLength) {
            showFieldError(fieldWrapper, rules.messages.maxLength);
            return false;
        }
        
        // Проверка паттерна
        if (rules.pattern && !rules.pattern.test(value)) {
            showFieldError(fieldWrapper, rules.messages.pattern);
            return false;
        }
        
        // Дополнительная валидация для email
        if (fieldName === 'email' && value) {
            const emailParts = value.split('@');
            if (emailParts.length !== 2 || !emailParts[0] || !emailParts[1] || !emailParts[1].includes('.')) {
                showFieldError(fieldWrapper, 'Por favor, insira um email válido.');
                return false;
            }
        }
        
        // Дополнительная валидация для даты
        if (fieldName === 'appointment_date' && value) {
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                showFieldError(fieldWrapper, 'Por favor, selecione uma data futura.');
                return false;
            }
        }
        
        // Если все проверки пройдены
        markFieldAsValid(fieldWrapper);
        return true;
    }
    
    // Показать ошибку поля
    function showFieldError(fieldWrapper, message) {
        const field = fieldWrapper.querySelector('input, select, textarea');
        if (!field) return;
        
        // Добавляем классы ошибки
        fieldWrapper.classList.add('has-error');
        fieldWrapper.classList.remove('has-success');
        field.classList.add('field-error');
        field.classList.remove('field-valid');
        field.setAttribute('aria-invalid', 'true');
        
        // Создаем элемент сообщения об ошибке
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error-message';
        errorElement.textContent = message;
        errorElement.setAttribute('role', 'alert');
        errorElement.setAttribute('aria-live', 'polite');
        
        // Добавляем после поля
        fieldWrapper.appendChild(errorElement);
        
        // Добавляем иконку ошибки
        if (!fieldWrapper.querySelector('.field-error-icon')) {
            const errorIcon = document.createElement('span');
            errorIcon.className = 'field-error-icon';
            errorIcon.innerHTML = '⚠️';
            errorIcon.setAttribute('aria-hidden', 'true');
            fieldWrapper.appendChild(errorIcon);
        }
    }
    
    // Отметить поле как валидное
    function markFieldAsValid(fieldWrapper) {
        const field = fieldWrapper.querySelector('input, select, textarea');
        if (!field) return;
        
        // Удаляем классы ошибки
        fieldWrapper.classList.remove('has-error');
        fieldWrapper.classList.add('has-success');
        field.classList.remove('field-error');
        field.classList.add('field-valid');
        field.setAttribute('aria-invalid', 'false');
        
        // Удаляем иконку ошибки
        const errorIcon = fieldWrapper.querySelector('.field-error-icon');
        if (errorIcon) {
            errorIcon.remove();
        }
        
        // Добавляем иконку успеха
        if (!fieldWrapper.querySelector('.field-success-icon')) {
            // const successIcon = document.createElement('span');
            // successIcon.className = 'field-success-icon';
            // successIcon.innerHTML = '✓';
            // successIcon.setAttribute('aria-hidden', 'true');
            // fieldWrapper.appendChild(successIcon);
        }
    }
    
    // Удалить сообщение об ошибке
    function removeFieldError(fieldWrapper) {
        const errorMessage = fieldWrapper.querySelector('.field-error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }
    
    // Валидация всей формы
    function validateForm(form) {
        let isValid = true;
        const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
        
        fields.forEach(field => {
            const fieldName = field.name || field.id;
            const fieldWrapper = field.closest('.form-group');
            
            if (fieldWrapper) {
                // Отмечаем поле как touched
                field.classList.add('touched');
                
                // Валидируем поле
                if (!validateField(field, fieldName)) {
                    isValid = false;
                }
            }
        });
        
        // Проверка reCAPTCHA
        if (typeof grecaptcha !== 'undefined') {
            const recaptchaResponse = grecaptcha.getResponse();
            if (!recaptchaResponse) {
                const recaptchaWrapper = form.querySelector('.g-recaptcha')?.closest('.form-group');
                if (recaptchaWrapper) {
                    showFieldError(recaptchaWrapper, 'Por favor, confirme que você não é um robô.');
                    isValid = false;
                }
            }
        }
        
        return isValid;
    }
    
    // Экспортируем функцию для использования в других скриптах
    window.validateBookingForm = validateForm;
    
    // Инициализация при загрузке DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initValidation);
    } else {
        initValidation();
    }
    
    // Переинициализация после PJAX переходов
    document.addEventListener('pjax:complete', function() {
        setTimeout(initValidation, 100);
    });
})();

