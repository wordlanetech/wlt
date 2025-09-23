document.addEventListener('DOMContentLoaded', async () => {
    const user_id = localStorage.getItem('user_id');
    if (!user_id) {
        alert('User not logged in. Redirecting to login page.');
        window.location.href = '/ems-frontend/login.html';
        return;
    }

    // Profile dropdown functionality
    const profileButton = document.getElementById('profileButton');
    const profileDropdown = document.getElementById('profileDropdown');

    if (profileButton && profileDropdown) {
        profileButton.addEventListener('click', (event) => {
            event.stopPropagation();
            profileDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (event) => {
            if (!profileDropdown.contains(event.target) && !profileButton.contains(event.target)) {
                profileDropdown.classList.remove('show');
            }
        });
    }

    const tasksGrid = document.getElementById('tasksGrid');
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const addNewTaskBtn = document.getElementById('addNewTaskBtn');

    // Helper function to format date
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Function to get status class
    function getStatusClass(status) {
        switch (status?.toLowerCase()) {
            case 'in progress':
                return 'status-in-progress';
            case 'completed':
                return 'status-completed';
            case 'pending':
                return 'status-pending';
            case 'on hold':
                return 'status-on-hold';
            default:
                return 'status-pending';
        }
    }

    // Function to create a task card with new design
    function createTaskCard(task, index) {
        const statusClass = getStatusClass(task.status);
        const priorityClass = task.priority?.toLowerCase() || 'medium';

        return `
            <div class="task-card animate-fade-in-up" style="--delay: ${index * 0.1}s">
                <h3>${task.name || 'Untitled Task'}</h3>
                <p class="task-id">Task ID: ${task.id || 'N/A'}</p>
                
                <div class="task-dates">
                    <div class="date-item">
                        <span class="date-label">Start Date</span>
                        <span class="date-value">${formatDate(task.start_date)}</span>
                    </div>
                    <div class="date-item">
                        <span class="date-label">Due Date</span>
                        <span class="date-value">${formatDate(task.end_date)}</span>
                    </div>
                </div>
                
                <span class="status-badge ${statusClass}">
                    <i class="fas fa-circle mr-2"></i>
                    ${task.status || 'Pending'}
                </span>
                
                <p>${task.description || 'No description provided for this task.'}</p>
                
                <div class="card-footer">
                    <span class="priority-badge priority-${priorityClass}">
                        ${task.priority || 'Medium'} Priority
                    </span>
                    <a href="#" class="view-details">
                        View Details <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;
    }

    // Function to fetch and display tasks
    async function fetchEmployeeTasksData() {
        try {
            loadingState.classList.remove('hidden');
            errorState.classList.add('hidden');
            tasksGrid.innerHTML = '';

            const response = await fetch(`https://dashboard.wordlanetech.com/api/manager/tasks/list?user_id=${user_id}`);
            const tasks = await response.json();

            loadingState.classList.add('hidden');

            if (!Array.isArray(tasks) || tasks.length === 0) {
                tasksGrid.innerHTML = `
                    <div class="text-center text-gray-500 col-span-3 py-10">
                        <i class="fas fa-tasks text-4xl mb-4 text-gray-300"></i>
                        <h3 class="text-xl font-semibold mb-2">No tasks found</h3>
                        <p class="text-gray-500">You don't have any tasks assigned yet.</p>
                    </div>
                `;
                return;
            }

            tasks.forEach((task, index) => {
                tasksGrid.insertAdjacentHTML('beforeend', createTaskCard(task, index));
            });

        } catch (error) {
            console.error('Error fetching employee tasks data:', error);
            loadingState.classList.add('hidden');
            errorState.classList.remove('hidden');
            
            // Hide error after 5 seconds
            setTimeout(() => {
                errorState.classList.add('hidden');
            }, 5000);
        }
    }

    // Function for adding new task (placeholder)
    function addNewTask() {
        alert('Add New Task functionality will be implemented here.');
    }

    // Event listener for add new task button
    if (addNewTaskBtn) {
        addNewTaskBtn.addEventListener('click', addNewTask);
    }

    // Initial load
    fetchEmployeeTasksData();
});