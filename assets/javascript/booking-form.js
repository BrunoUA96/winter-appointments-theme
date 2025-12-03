
// Глобальная функция для отправки формы из модального окна
function submitBookingForm() {
    handleModalFormSubmit(null);
}

function handleSuccess(response) {
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
    const birthDateField = document.getElementById('birth_date');
    const snsNumberField = document.getElementById('sns_number');
    const nifField = document.getElementById('nif');
    const healthInsuranceField = document.getElementById('health_insurance');
    const consultationField = document.getElementById('consultation_type_id');
    const dateField = document.getElementById('appointment_date');
    const timeField = document.getElementById('appointment_time');
    const consultationReasonField = document.getElementById('consultation_reason');
    
    if (nameField) document.getElementById('preview-name').textContent = nameField.value;
    if (emailField) document.getElementById('preview-email').textContent = emailField.value;
    if (phoneField) document.getElementById('preview-phone').textContent = phoneField.value;
    if (birthDateField) {
        const birthDatePreview = document.getElementById('preview-birth-date');
        if (birthDatePreview) {
            birthDatePreview.textContent = formatDate(birthDateField.value);
        }
    }
    if (snsNumberField && snsNumberField.value) {
        const snsPreview = document.getElementById('preview-sns-number');
        if (snsPreview) {
            snsPreview.textContent = snsNumberField.value;
            document.getElementById('preview-sns-container').style.display = 'flex';
        }
    } else {
        const snsContainer = document.getElementById('preview-sns-container');
        if (snsContainer) snsContainer.style.display = 'none';
    }
    if (nifField && nifField.value) {
        const nifPreview = document.getElementById('preview-nif');
        if (nifPreview) {
            nifPreview.textContent = nifField.value;
            document.getElementById('preview-nif-container').style.display = 'flex';
        }
    } else {
        const nifContainer = document.getElementById('preview-nif-container');
        if (nifContainer) nifContainer.style.display = 'none';
    }
    if (healthInsuranceField && healthInsuranceField.value) {
        const healthInsurancePreview = document.getElementById('preview-health-insurance');
        if (healthInsurancePreview) {
            healthInsurancePreview.textContent = healthInsuranceField.value;
            document.getElementById('preview-health-insurance-container').style.display = 'flex';
        }
    } else {
        const healthInsuranceContainer = document.getElementById('preview-health-insurance-container');
        if (healthInsuranceContainer) healthInsuranceContainer.style.display = 'none';
    }
    if (consultationField) document.getElementById('preview-consultation').textContent = getConsultationName(consultationField);
    if (dateField) document.getElementById('preview-date').textContent = formatDate(dateField.value);
    if (timeField) document.getElementById('preview-time').textContent = timeField.value;
    
    // Показываем motivo da consulta
    const consultationReason = consultationReasonField ? consultationReasonField.value : '';
    const consultationReasonContainer = document.getElementById('preview-consultation-reason-container');
    if (consultationReason.trim() && consultationReasonContainer) {
        document.getElementById('preview-consultation-reason').textContent = consultationReason;
        consultationReasonContainer.style.display = 'flex';
    } else if (consultationReasonContainer) {
        consultationReasonContainer.style.display = 'none';
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

// Функция для обработки отправки формы из модального окна
function handleModalFormSubmit(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Получаем данные из основной формы
    const mainForm = document.querySelector('form[data-request="onSaveBooking"]');
    if (!mainForm) {
        alert('Erro: Formulário principal não encontrado.');
        return;
    }

    const dateField = document.getElementById('appointment_date');
    const timeField = document.getElementById('appointment_time');
    
    if (!dateField || !timeField) {
        alert('Erro: Campos de data ou hora não encontrados.');
        return;
    }

    const date = dateField.value;
    const time = timeField.value;
    
    if (!date || !time) {
        alert('Por favor, selecione uma data e um horário.');
        return;
    }
    
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
        alert('Erro: Framework AJAX não carregado.');
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

});

