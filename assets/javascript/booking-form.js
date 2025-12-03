console.log('Booking form script loadedввввв');

function onRecaptchaSuccess(token) {
    console.log('reCAPTCHA verified with token:', token);
}

function handleSuccess(response) {
    console.log('Form submitted successfully:', response);
    
    // Закрываем модальное окно
    closeConfirmationModal();
    
    // Показываем сообщение об успехе
    showMessage('Consulta agendada com sucesso. Em breve você receberá um e-mail de confirmação.', 'success');
    
    // Очищаем форму
    document.querySelector('form').reset();
    // Очищаем reCAPTCHA
    if (typeof grecaptcha !== 'undefined') {
        grecaptcha.reset();
    }
}

function handleError(response) {
    console.error('Form submission failed:', response);
    
    // Закрываем модальное окно
    closeConfirmationModal();
    
    // Показываем сообщение об ошибке
    showMessage('Ocorreu um erro ao criar a consulta. Por favor, tente novamente.', 'error');
    
    // Очищаем reCAPTCHA при ошибке
    if (typeof grecaptcha !== 'undefined') {
        grecaptcha.reset();
    }
}

function showMessage(message, type) {
    // Используем toast-уведомления вместо простых alert
    if (typeof showToast === 'function') {
        showToast(message, type, 6000);
    } else {
        // Fallback на старый способ, если toast не загружен
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        const form = document.querySelector('form');
        if (form) {
            form.insertBefore(alert, form.firstChild);
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.remove();
                }
            }, 5000);
        }
    }
}

// Функция для объединения даты и времени
function combineDateTime(date, time) {
    if (!date || !time) return '';
    return `${date} ${time}`;
}

// Функция для форматирования даты
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Функция для получения названия типа консультации
function getConsultationName(selectElement) {
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    return selectedOption ? selectedOption.text : '';
}

// Показать модальное окно подтверждения
function showConfirmationModal() {
    // Используем улучшенную валидацию, если доступна
    const form = document.querySelector('form');
    if (!form) return;
    
    // Проверяем валидность формы через нашу систему валидации
    if (typeof validateBookingForm === 'function') {
        if (!validateBookingForm(form)) {
            // Прокручиваем к первому полю с ошибкой
            const firstError = form.querySelector('.field-error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
            return;
        }
    } else {
        // Fallback на стандартную валидацию
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
    }
    
    // Проверяем reCAPTCHA
    if (typeof grecaptcha !== 'undefined') {
        const recaptchaResponse = grecaptcha.getResponse();
        if (!recaptchaResponse) {
            showMessage('Por favor, confirme que você não é um robô.', 'error');
            // Прокручиваем к reCAPTCHA
            const recaptchaElement = document.querySelector('.g-recaptcha');
            if (recaptchaElement) {
                recaptchaElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }
    }
    
    // Заполняем предпросмотр данными
    const nameField = document.getElementById('patient_name');
    const emailField = document.getElementById('email');
    const phoneField = document.getElementById('phone');
    const consultationField = document.getElementById('consultation_type_id');
    const dateField = document.getElementById('appointment_date');
    const timeField = document.getElementById('appointment_time');
    const descriptionField = document.getElementById('description');
    
    if (nameField) document.getElementById('preview-name').textContent = nameField.value;
    if (emailField) document.getElementById('preview-email').textContent = emailField.value;
    if (phoneField) document.getElementById('preview-phone').textContent = phoneField.value;
    if (consultationField) document.getElementById('preview-consultation').textContent = getConsultationName(consultationField);
    if (dateField) document.getElementById('preview-date').textContent = formatDate(dateField.value);
    if (timeField) document.getElementById('preview-time').textContent = timeField.value;
    
    // Показываем описание только если оно заполнено
    const description = descriptionField ? descriptionField.value : '';
    const descriptionContainer = document.getElementById('preview-description-container');
    if (description.trim() && descriptionContainer) {
        document.getElementById('preview-description').textContent = description;
        descriptionContainer.style.display = 'flex';
    } else if (descriptionContainer) {
        descriptionContainer.style.display = 'none';
    }
    
    // Показываем модальное окно
    const modal = document.getElementById('confirmationModal');
    if (modal) {
        // Перемещаем модальное окно в body, если оно еще не там
        // Это гарантирует, что оно будет поверх всех элементов
        if (modal.parentNode !== document.body) {
            document.body.appendChild(modal);
        }
        
        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');
        // Блокируем прокрутку страницы
        document.body.style.overflow = 'hidden';
        
        // Фокус на кнопке закрытия для доступности
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            setTimeout(() => closeBtn.focus(), 100);
        }
        
        // Предотвращаем фокус на элементах за модальным окном
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        
        // Обработка Tab для зацикливания фокуса внутри модального окна
        modal.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        e.preventDefault();
                        lastFocusable.focus();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        e.preventDefault();
                        firstFocusable.focus();
                    }
                }
            }
        });
    }
}

// Закрыть модальное окно
function closeConfirmationModal() {
    const modal = document.getElementById('confirmationModal');
    if (modal) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = 'auto';
        
        // Возвращаем фокус на кнопку подтверждения
        const confirmBtn = document.getElementById('confirmBtn');
        if (confirmBtn) {
            setTimeout(() => confirmBtn.focus(), 100);
        }
    }
}

// Переместить модальное окно в body при загрузке страницы
function moveModalToBody() {
    const modal = document.getElementById('confirmationModal');
    if (modal && modal.parentNode !== document.body) {
        document.body.appendChild(modal);
    }
}

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // Перемещаем модальное окно в body сразу при загрузке
    moveModalToBody();
    
    // Также перемещаем после PJAX переходов
    document.addEventListener('pjax:complete', function() {
        setTimeout(moveModalToBody, 100);
    });
    // Обработчик отправки основной формы (для валидации)
    const mainForm = document.querySelector('form[data-request="onSaveBooking"]:not(#modal-form)');
    
    // Обработчик отправки формы в модальном окне
    const modalForm = document.getElementById('modal-form');
    if (modalForm) {
        modalForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Получаем данные из основной формы
            const mainForm = document.querySelector('form[data-request="onSaveBooking"]:not(#modal-form)');
            if (!mainForm) {
                console.error('Main form not found');
                return;
            }

            const dateField = document.getElementById('appointment_date');
            const timeField = document.getElementById('appointment_time');
            
            if (!dateField || !timeField) {
                console.error('Date or time field not found');
                return;
            }

            const date = dateField.value;
            const time = timeField.value;
            
            // Создаем скрытое поле для отправки объединенной даты и времени
            let hiddenField = document.getElementById('combined_appointment_time');
            if (!hiddenField) {
                hiddenField = document.createElement('input');
                hiddenField.type = 'hidden';
                hiddenField.id = 'combined_appointment_time';
                hiddenField.name = 'appointment_time';
                mainForm.appendChild(hiddenField);
            }
            
            // Устанавливаем значение объединенной даты и времени
            hiddenField.value = combineDateTime(date, time);
            
            // Отладочная информация
            console.log('Form data before submission:');
            const formData = new FormData(mainForm);
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }
            
            // Отправляем AJAX запрос через основную форму
            // Winter CMS framework автоматически соберет данные из формы
            if (typeof $ !== 'undefined' && $.request) {
                // Используем основную форму напрямую
                $(mainForm).request('onSaveBooking', {
                    success: function(response) {
                        handleSuccess(response);
                    },
                    error: function(response) {
                        handleError(response);
                    }
                });
            } else {
                console.error('Winter CMS AJAX framework not loaded');
            }
        });
    }

    // Закрытие модального окна при клике вне его
    window.onclick = function(event) {
        const modal = document.getElementById('confirmationModal');
        if (event.target === modal) {
            closeConfirmationModal();
        }
    }

    // Закрытие модального окна по Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeConfirmationModal();
        }
    });

    // Добавляем обработчики изменения полей для отладки
    document.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('change', function(e) {
            console.log(`Field ${this.name} changed to:`, this.value);
        });
    });
     
    // Обработчик изменения типа консультации
    const consultationField = document.getElementById('consultation_type_id');
    if (consultationField) {
        consultationField.addEventListener('change', function() {
            updateConsultationFeatures(this.value);
        });
    }
});

// Функция для обновления features консультации
function updateConsultationFeatures(consultationTypeId) {
    const featuresContainer = document.getElementById('consultation-features');
    
    if (!featuresContainer) {
        return;
    }
    
    if (!consultationTypeId) {
        featuresContainer.innerHTML = `
            <div class="feature-item">
                <span class="feature-icon">✓</span>
                <span>Selecione um tipo de consulta para ver o que está incluído</span>
            </div>
        `;
        return;
    }
    
    // Получаем features через AJAX
    if (typeof $ !== 'undefined' && $.request) {
        $.request('onGetConsultationFeatures', {
            data: { consultation_type_id: consultationTypeId },
            success: function(response) {
                if (response.features && response.features.length > 0) {
                    let featuresHtml = '';
                    response.features.forEach(feature => {
                        featuresHtml += `
                            <div class="feature-item">
                                <span class="feature-icon">✓</span>
                                <span>${feature}</span>
                            </div>
                        `;
                    });
                    featuresContainer.innerHTML = featuresHtml;
                } else {
                    featuresContainer.innerHTML = `
                        <div class="feature-item">
                            <span class="feature-icon">ℹ️</span>
                            <span>Nenhuma informação disponível para este tipo de consulta</span>
                        </div>
                    `;
                }
            },
            error: function() {
                featuresContainer.innerHTML = `
                    <div class="feature-item">
                        <span class="feature-icon">⚠️</span>
                        <span>Erro ao carregar informações da consulta</span>
                    </div>
                `;
            }
        });
    } else {
        console.error('Winter CMS AJAX framework not loaded');
    }
}

