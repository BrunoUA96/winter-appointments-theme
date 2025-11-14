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
    // Удаляем существующие сообщения
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Создаем новое сообщение
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    // Вставляем сообщение в начало формы
    const form = document.querySelector('form');
    if (form) {
        form.insertBefore(alert, form.firstChild);
        
        // Автоматически скрываем через 5 секунд
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
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
    // Проверяем валидность формы
    const form = document.querySelector('form');
    if (!form || !form.checkValidity()) {
        if (form) {
            form.reportValidity();
        }
        return;
    }
    
    // Проверяем reCAPTCHA
    if (typeof grecaptcha !== 'undefined') {
        const recaptchaResponse = grecaptcha.getResponse();
        if (!recaptchaResponse) {
            showMessage('Por favor, confirme que você não é um robô.', 'error');
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
        modal.style.display = 'block';
        // Блокируем прокрутку страницы
        document.body.style.overflow = 'hidden';
    }
}

// Закрыть модальное окно
function closeConfirmationModal() {
    const modal = document.getElementById('confirmationModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // Обработчик отправки формы
    const form = document.querySelector('form[data-request="onSaveBooking"]');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

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
                this.appendChild(hiddenField);
            }
            
            // Устанавливаем значение объединенной даты и времени
            hiddenField.value = combineDateTime(date, time);
            
            // Используем AJAX для отправки формы
            const formData = new FormData(this);
            
            // Добавляем объединенную дату и время в formData
            formData.set('appointment_time', hiddenField.value);
            
            // Отладочная информация
            console.log('Form data before submission:');
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }
            
            // Отправляем AJAX запрос
            if (typeof $ !== 'undefined' && $.request) {
                $.request('onSaveBooking', {
                    data: formData,
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

