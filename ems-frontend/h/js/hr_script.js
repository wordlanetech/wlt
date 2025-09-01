document.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:3000/api/hr/dashboard/summary')
        .then(res => res.json())
        .then(data => {
            document.querySelectorAll('.dashboard-card')[0].querySelector('.number').textContent = data.totalEmployees;
            document.querySelectorAll('.dashboard-card')[1].querySelector('.number').textContent = data.newHires;
            document.querySelectorAll('.dashboard-card')[2].querySelector('.number').textContent = data.pendingLeaves;
            document.querySelectorAll('.dashboard-card')[3].querySelector('.number').textContent = data.activeProjects;
        });

    fetch('http://localhost:3000/api/hr/dashboard/activities')
        .then(res => res.json())
        .then(activities => {
            const activityContainer = document.querySelector('.activity-card .space-y-2');
            activityContainer.innerHTML = '';

            activities.forEach(act => {
                const iconClass = {
                    'upload': 'fa-file-upload',
                    'leave_approval': 'fa-calendar-check',
                    'onboarding': 'fa-user-plus',
                    'task_overdue': 'fa-exclamation-triangle'
                }[act.type] || 'fa-info-circle';

                const html = `
                    <div class="activity-item">
                        <div class="activity-icon icon-blue">
                            <i class="fas ${iconClass}"></i>
                        </div>
                        <div class="activity-content">
                            <h4>${act.description}</h4>
                            <p class="time">${new Date(act.created_at).toLocaleString()}</p>
                        </div>
                    </div>
                `;
                activityContainer.insertAdjacentHTML('beforeend', html);
            });
        });
});
