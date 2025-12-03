/**
 * Calendar Picker with Time Slots
 * Календарь с выбором даты и временных слотов
 */

(function() {
    'use strict';
    
    let selectedDate = null;
    let selectedTime = null;
    let unavailableDates = []; // Массив недоступных дат
    
    // Загрузка недоступных дат
    function loadUnavailableDates() {
        if (typeof $ !== 'undefined' && $.request) {
            $.request('onGetUnavailableDates', {
                success: function(response) {
                    const data = response.data || response;
                    if (data.success && data.unavailableDates) {
                        // Убеждаемся, что unavailableDates - это массив
                        if (Array.isArray(data.unavailableDates)) {
                            unavailableDates = data.unavailableDates;
                        } else if (typeof data.unavailableDates === 'object') {
                            // Если это объект, преобразуем в массив значений
                            unavailableDates = Object.values(data.unavailableDates);
                        } else {
                            // Если это строка или другое, создаем массив
                            unavailableDates = [data.unavailableDates].filter(Boolean);
                        }
                        // Перерисовываем календарь с учетом недоступных дат
                        const calendarContainer = document.getElementById('calendar-container');
                        if (calendarContainer) {
                            createCalendar(calendarContainer);
                        }
                    } else {
                        // Если данных нет, устанавливаем пустой массив
                        unavailableDates = [];
                    }
                },
                error: function() {
                    console.error('Error loading unavailable dates');
                    unavailableDates = [];
                }
            });
        }
    }
    
    // Инициализация календаря
    function initCalendar() {
        const calendarContainer = document.getElementById('calendar-container');
        if (!calendarContainer) return;
        
        // Загружаем недоступные даты
        loadUnavailableDates();
        
        // Создаем календарь
        createCalendar(calendarContainer);
        
        // Инициализируем временные слоты
        initTimeSlots();
    }
    
    // Создание календаря
    function createCalendar(container) {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        let displayMonth = currentMonth;
        let displayYear = currentYear;
        
        function renderCalendar() {
            const firstDay = new Date(displayYear, displayMonth, 1).getDay();
            const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
            const todayDate = new Date();
            
            const monthNames = [
                'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
            ];
            
            const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
            
            let html = `
                <div class="calendar-header">
                    <button type="button" class="calendar-nav-btn prev-month" aria-label="Mês anterior">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M15 18l-6-6 6-6"/>
                        </svg>
                    </button>
                    <h3 class="calendar-month-year">${monthNames[displayMonth]} ${displayYear}</h3>
                    <button type="button" class="calendar-nav-btn next-month" aria-label="Próximo mês">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 18l6-6-6-6"/>
                        </svg>
                    </button>
                </div>
                <div class="calendar-weekdays">
                    ${dayNames.map(day => `<div class="calendar-weekday">${day}</div>`).join('')}
                </div>
                <div class="calendar-days">
            `;
            
            // Пустые ячейки для первого дня месяца
            for (let i = 0; i < firstDay; i++) {
                html += '<div class="calendar-day empty"></div>';
            }
            
            // Дни месяца
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(displayYear, displayMonth, day);
                const dateString = formatDateForInput(date);
                const isPast = date < todayDate && date.toDateString() !== todayDate.toDateString();
                const isToday = date.toDateString() === todayDate.toDateString();
                const isSelected = selectedDate && dateString === selectedDate;
                // Убеждаемся, что unavailableDates - это массив перед использованием includes
                const isUnavailable = Array.isArray(unavailableDates) && unavailableDates.includes(dateString);
                
                let classes = 'calendar-day';
                if (isPast) classes += ' past';
                if (isToday) classes += ' today';
                if (isSelected) classes += ' selected';
                if (isUnavailable) classes += ' unavailable';
                
                html += `
                    <div class="${classes}" 
                         data-date="${dateString}"
                         ${(isPast || isUnavailable) ? '' : 'tabindex="0" role="button"'}
                         ${(isPast || isUnavailable) ? '' : `aria-label="Selecionar ${day} de ${monthNames[displayMonth]}"`}
                         ${isUnavailable ? 'title="Data indisponível (dia de folga ou férias)"' : ''}>
                        ${day}
                    </div>
                `;
            }
            
            html += '</div>';
            container.innerHTML = html;
            
            // Добавляем обработчики событий
            container.querySelectorAll('.calendar-day:not(.past):not(.empty):not(.unavailable)').forEach(day => {
                day.addEventListener('click', function() {
                    const dateString = this.dataset.date;
                    // Проверяем доступность даты перед выбором
                    if (Array.isArray(unavailableDates) && !unavailableDates.includes(dateString)) {
                        selectDate(dateString);
                    }
                });
                
                day.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        const dateString = this.dataset.date;
                        if (Array.isArray(unavailableDates) && !unavailableDates.includes(dateString)) {
                            selectDate(dateString);
                        }
                    }
                });
            });
            
            container.querySelector('.prev-month').addEventListener('click', function() {
                displayMonth--;
                if (displayMonth < 0) {
                    displayMonth = 11;
                    displayYear--;
                }
                renderCalendar();
            });
            
            container.querySelector('.next-month').addEventListener('click', function() {
                displayMonth++;
                if (displayMonth > 11) {
                    displayMonth = 0;
                    displayYear++;
                }
                renderCalendar();
            });
        }
        
        // Функция для обновления недоступных дат и перерисовки
        window.updateUnavailableDates = function(dates) {
            unavailableDates = dates || [];
            renderCalendar();
        };
        
        renderCalendar();
    }
    
    // Выбор даты
    function selectDate(dateString) {
        selectedDate = dateString;
        selectedTime = null;
        
        // Обновляем визуальное выделение
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
            if (day.dataset.date === dateString) {
                day.classList.add('selected');
            }
        });
        
        // Обновляем скрытое поле даты
        const dateInput = document.getElementById('appointment_date');
        if (dateInput) {
            dateInput.value = dateString;
            dateInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        // Сбрасываем выбранное время
        const timeInput = document.getElementById('appointment_time');
        if (timeInput) {
            timeInput.value = '';
        }
        
        // Загружаем доступные временные слоты
        loadTimeSlots(dateString);
    }
    
    // Загрузка временных слотов для выбранной даты
    function loadTimeSlots(dateString) {
        const timeSlotsContainer = document.getElementById('time-slots-container');
        if (!timeSlotsContainer) return;
        
        // Получаем выбранный тип консультации
        const consultationTypeSelect = document.getElementById('consultation_type_id');
        const consultationTypeId = consultationTypeSelect ? consultationTypeSelect.value : null;
        
        // Если тип консультации не выбран, показываем сообщение
        if (!consultationTypeId) {
            timeSlotsContainer.innerHTML = `
                <div class="time-slots-placeholder">
                    <p>Por favor, selecione primeiro o tipo de consulta</p>
                </div>
            `;
            return;
        }
        
        // Показываем загрузку
        timeSlotsContainer.innerHTML = '<div class="time-slots-loading">Carregando horários disponíveis...</div>';
        
        // Запрашиваем доступные слоты через AJAX
        if (typeof $ !== 'undefined' && $.request) {
            $.request('onGetAvailableTimeSlots', {
                data: { 
                    date: dateString,
                    consultation_type_id: consultationTypeId
                },
                success: function(response) {
                    // Winter CMS возвращает данные в response.data или напрямую
                    const data = response.data || response;
                    if (data.success && data.timeSlots) {
                        renderTimeSlots(data.timeSlots);
                    } else {
                        const message = data.message || 'Erro ao carregar horários disponíveis.';
                        timeSlotsContainer.innerHTML = `<div class="time-slots-error">${message}</div>`;
                    }
                },
                error: function(response) {
                    const errorMessage = response.data?.message || 'Erro ao carregar horários disponíveis.';
                    timeSlotsContainer.innerHTML = `<div class="time-slots-error">${errorMessage}</div>`;
                }
            });
        } else {
            console.error('Winter CMS AJAX framework not loaded');
            timeSlotsContainer.innerHTML = '<div class="time-slots-error">Erro ao carregar horários disponíveis.</div>';
        }
    }
    
    // Отображение временных слотов
    function renderTimeSlots(timeSlots) {
        const timeSlotsContainer = document.getElementById('time-slots-container');
        if (!timeSlotsContainer) return;
        
        const availableSlots = timeSlots.filter(slot => slot.available);
        
        if (availableSlots.length === 0) {
            timeSlotsContainer.innerHTML = `
                <div class="time-slots-empty">
                    <p>Não há horários disponíveis para esta data.</p>
                    <p>Por favor, selecione outra data.</p>
                </div>
            `;
            return;
        }
        
        let html = '<div class="time-slots-grid">';
        
        availableSlots.forEach(slot => {
            const isSelected = selectedTime === slot.time;
            html += `
                <button type="button" 
                        class="time-slot ${isSelected ? 'selected' : ''}"
                        data-time="${slot.time}"
                        aria-label="Selecionar horário ${slot.display}">
                    ${slot.display}
                </button>
            `;
        });
        
        html += '</div>';
        timeSlotsContainer.innerHTML = html;
        
        // Добавляем обработчики для временных слотов
        timeSlotsContainer.querySelectorAll('.time-slot').forEach(slot => {
            slot.addEventListener('click', function() {
                selectTime(this.dataset.time);
            });
        });
    }
    
    // Выбор времени
    function selectTime(time) {
        selectedTime = time;
        
        // Обновляем визуальное выделение
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('selected');
            if (slot.dataset.time === time) {
                slot.classList.add('selected');
            }
        });
        
        // Обновляем скрытое поле времени
        const timeInput = document.getElementById('appointment_time');
        if (timeInput) {
            timeInput.value = time;
            timeInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
    
    // Инициализация временных слотов
    function initTimeSlots() {
        const timeSlotsContainer = document.getElementById('time-slots-container');
        if (!timeSlotsContainer) return;
        
        // Показываем сообщение о выборе даты
        timeSlotsContainer.innerHTML = `
            <div class="time-slots-placeholder">
                <p>Selecione o tipo de consulta e uma data para ver os horários disponíveis</p>
            </div>
        `;
        
        // Добавляем обработчик изменения типа консультации
        const consultationTypeSelect = document.getElementById('consultation_type_id');
        if (consultationTypeSelect) {
            consultationTypeSelect.addEventListener('change', function() {
                // Если дата уже выбрана, перезагружаем временные слоты
                if (selectedDate) {
                    loadTimeSlots(selectedDate);
                } else {
                    // Иначе просто обновляем сообщение
                    timeSlotsContainer.innerHTML = `
                        <div class="time-slots-placeholder">
                            <p>Selecione uma data para ver os horários disponíveis</p>
                        </div>
                    `;
                }
            });
        }
    }
    
    // Форматирование даты для input
    function formatDateForInput(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // Экспортируем функции для использования в других скриптах
    window.selectCalendarDate = selectDate;
    window.selectCalendarTime = selectTime;
    
    // Инициализация при загрузке DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCalendar);
    } else {
        initCalendar();
    }
    
    // Переинициализация после PJAX переходов
    document.addEventListener('pjax:complete', function() {
        setTimeout(initCalendar, 100);
    });
})();

