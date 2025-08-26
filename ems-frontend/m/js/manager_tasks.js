const profileButton = document.getElementById('profileButton');
const profileDropdown = document.getElementById('profileDropdown');
const tasksGrid = document.getElementById('tasksGrid');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');

// Toggle dropdown visibility
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

// Helper function to format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Function to create a task card
function createTaskCard(task) {
    const statusClass = task.status.toLowerCase().replace(/\s/g, '-');
    const priorityClass = task.priority.toLowerCase();

    return `
        <div class="task-card" data-status="${statusClass}">
            <h3>${task.name}</h3>
            <p class="task-id">${task.id}</p>
            <p>${task.description}</p>
            
            <div class="task-info">
                <div class="info-item">
                    <span class="info-label">Project</span>
                    <span class="info-value">${task.project} (${task.projectId})</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Due Date</span>
                    <span class="info-value">${formatDate(task.dueDate)}</span>
                </div>
            </div>
            
            <span class="status-badge status-${statusClass}">${task.status}</span>
            
            <div class="card-footer">
                <span class="priority-badge priority-${priorityClass}">${task.priority}</span>
                <div class="task-actions">
                    <a href="#" class="action-btn" onclick="viewTaskDetails('${task.taskIdRaw}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </a>
                    ${task.status !== 'Completed' ? `
                    <a href="#" class="action-btn" onclick="markTaskComplete('${task.taskIdRaw}')" title="Mark as Complete">
                        <i class="fas fa-check-circle"></i>
                    </a>` : ''}
                </div>
            </div>
        </div>
    `;
}

// Function to view task details
function viewTaskDetails(taskId) {
    console.log('Viewing task details for:', taskId);
    alert(`Task details for ${taskId} will be shown here.`);
}

// Function to mark task as complete
async function markTaskComplete(taskId) {
    if (!confirm(`Mark task ${taskId} as complete?`)) return;

    try {
        const response = await fetch(`http://localhost:3001/api/tasks/${taskId}/complete`, {
            method: 'PATCH'
        });

        if (!response.ok) {
            throw new Error('Failed to update task');
        }

        alert(`Task ${taskId} marked as complete.`);
        fetchEmployeeTasksData(); // Reload task list
    } catch (error) {
        console.error('Error marking task complete:', error);
        alert('Failed to mark task as complete.');
    }
}

// Function to fetch and display tasks
async function fetchEmployeeTasksData() {
    try {
        loadingState.classList.remove('hidden');
        errorState.classList.add('hidden');
        tasksGrid.innerHTML = '';

        const response = await fetch('http://localhost:3001/api/tasks');
        const tasks = await response.json();

        loadingState.classList.add('hidden');

        if (!Array.isArray(tasks)) {
            throw new Error('Invalid response format');
        }

        tasks.forEach(task => {
            tasksGrid.insertAdjacentHTML('beforeend', createTaskCard({
                taskIdRaw: task.id,
                id: `TASK${String(task.id).padStart(3, '0')}`,
                name: task.name,
                description: task.description || 'No description.',
                status: task.status || 'Pending',
                project: task.project || 'Unknown',
                projectId: task.project_id || 'N/A',
                dueDate: task.end_date,
                priority: 'Medium', // You can change this if priority is stored in DB
                assignedBy: task.assigned_by
            }));
        });

    } catch (error) {
        console.error('Error fetching employee tasks data:', error);
        loadingState.classList.add('hidden');
        errorState.classList.remove('hidden');
    }
}

function addNewTask() {
    // Placeholder for adding a new task
    alert('Add New Task functionality will be implemented here.');
}

const addNewTaskBtn = document.getElementById('addNewTaskBtn');
addNewTaskBtn.addEventListener('click', addNewTask);

// Initial load
document.addEventListener('DOMContentLoaded', fetchEmployeeTasksData);
