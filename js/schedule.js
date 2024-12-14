// Initialize variables
let calendar;
let schedules = [];

// Load schedules from JSON
async function loadSchedules() {
    try {
        const response = await fetch('../data/schedules.json');
        const data = await response.json();
        schedules = data.schedules;
        initializeCalendar();
        updateUpcomingSchedules();
    } catch (error) {
        console.error('Error loading schedules:', error);
    }
}

// Initialize FullCalendar
function initializeCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: schedules.map(schedule => ({
            id: schedule.id,
            title: schedule.title,
            start: schedule.start_date,
            end: schedule.end_date,
            className: `type-${schedule.type}`,
            extendedProps: {
                type: schedule.type,
                description: schedule.description,
                priority: schedule.priority,
                assigned_to: schedule.assigned_to,
                location: schedule.location
            }
        })),
        eventClick: function(info) {
            showEventDetails(info.event);
        }
    });

    calendar.render();
}

// Update upcoming schedules list
function updateUpcomingSchedules() {
    const container = document.getElementById('upcomingSchedules');
    if (!container) return;

    // Sort schedules by start date
    const sortedSchedules = [...schedules].sort((a, b) => 
        new Date(a.start_date) - new Date(b.start_date)
    );

    // Get only upcoming schedules (from today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingSchedules = sortedSchedules.filter(schedule => 
        new Date(schedule.start_date) >= today
    ).slice(0, 10); // Show only next 10 schedules

    container.innerHTML = upcomingSchedules.map(schedule => `
        <div class="schedule-item">
            <div class="d-flex justify-content-between align-items-start mb-2">
                <h6 class="mb-0">${schedule.title}</h6>
                <span class="schedule-type type-${schedule.type}">${formatType(schedule.type)}</span>
            </div>
            <div class="text-muted small mb-2">
                <i class="bi bi-clock me-1"></i>${formatDateTime(schedule.start_date)}
            </div>
            <div class="d-flex justify-content-between align-items-center">
                <span class="badge priority-${schedule.priority}">${schedule.priority.toUpperCase()}</span>
                <span class="text-muted small">${schedule.location}</span>
            </div>
        </div>
    `).join('');
}

// Format schedule type for display
function formatType(type) {
    return type.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Format date and time for display
function formatDateTime(dateString) {
    const options = { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Handle add schedule form submission
document.getElementById('addScheduleForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const newSchedule = {
        id: 'SCH' + (schedules.length + 1).toString().padStart(3, '0'),
        title: formData.get('title'),
        type: formData.get('type'),
        description: formData.get('description'),
        start_date: formData.get('start_date'),
        end_date: formData.get('end_date'),
        status: 'scheduled',
        priority: formData.get('priority'),
        assigned_to: formData.get('assigned_to'),
        location: formData.get('location')
    };

    schedules.push(newSchedule);
    calendar.addEvent({
        id: newSchedule.id,
        title: newSchedule.title,
        start: newSchedule.start_date,
        end: newSchedule.end_date,
        className: `type-${newSchedule.type}`,
        extendedProps: {
            type: newSchedule.type,
            description: newSchedule.description,
            priority: newSchedule.priority,
            assigned_to: newSchedule.assigned_to,
            location: newSchedule.location
        }
    });

    updateUpcomingSchedules();
    
    // Close modal and reset form
    const modal = bootstrap.Modal.getInstance(document.getElementById('addScheduleModal'));
    modal.hide();
    this.reset();
});

// Filter functionality
document.querySelectorAll('.dropdown-item[data-filter]').forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        const filterType = this.dataset.filter;
        const filterValue = this.dataset.value;

        if (filterType === 'clear') {
            calendar.getEvents().forEach(event => {
                event.setProp('display', 'auto');
            });
            return;
        }

        calendar.getEvents().forEach(event => {
            if (event.extendedProps[filterType] === filterValue) {
                event.setProp('display', 'auto');
            } else {
                event.setProp('display', 'none');
            }
        });
    });
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadSchedules();
});
