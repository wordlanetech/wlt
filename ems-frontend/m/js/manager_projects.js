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

    const API_URL = `https://dashboard.wordlanetech.com/api/manager/projects/list?user_id=${user_id}`;
    const projectsGrid = document.getElementById('projectsGrid');
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const statusFilter = document.getElementById('statusFilter');

    // Format date in readable form
    function formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Get status class based on project status
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

    // Render projects
    function renderProjects(projects) {
        if (!Array.isArray(projects) || projects.length === 0) {
            projectsGrid.innerHTML = `
                <div class="text-center text-gray-500 col-span-3 py-10">
                    <i class="fas fa-folder-open text-4xl mb-4 text-gray-300"></i>
                    <h3 class="text-xl font-semibold mb-2">No projects found</h3>
                    <p class="text-gray-500">There are no projects matching your current filters.</p>
                </div>
            `;
            return;
        }

        projectsGrid.innerHTML = projects.map((project, index) => `
            <div class="project-card animate-fade-in-up" style="--delay: ${index * 0.1}s">
                <h3>${project.project_name || 'Untitled Project'}</h3>
                <p class="project-id">Project ID: ${project.id || 'N/A'}</p>
                
                <div class="project-dates">
                    <div class="date-item">
                        <span class="date-label">Start Date</span>
                        <span class="date-value">${formatDate(project.start_date)}</span>
                    </div>
                    <div class="date-item">
                        <span class="date-label">End Date</span>
                        <span class="date-value">${formatDate(project.end_date)}</span>
                    </div>
                </div>
                
                <span class="status-badge ${getStatusClass(project.status)}">
                    <i class="fas fa-circle mr-2"></i>
                    ${project.status || 'Pending'}
                </span>
                
                <p>${project.description || 'No description provided for this project.'}</p>
                
                <div class="card-footer">
                    <span class="priority-badge priority-${project.priority?.toLowerCase() || 'medium'}">
                        ${project.priority || 'Medium'} Priority
                    </span>
                    <a href="#" class="view-details">
                        View Details <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `).join('');
    }

    // Filter projects by status
    function filterProjects(projects, status) {
        if (status === 'all') return projects;
        return projects.filter(project => 
            project.status && project.status.toLowerCase() === status.replace('-', ' ')
        );
    }

    try {
        loadingState.classList.remove('hidden');
        const response = await fetch(API_URL);
        const projects = await response.json();
        loadingState.classList.add('hidden');

        // Initial render
        renderProjects(projects);

        // Add filter functionality if filter element exists
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                const filteredProjects = filterProjects(projects, e.target.value);
                renderProjects(filteredProjects);
            });
        }

    } catch (err) {
        console.error('Project fetch error:', err);
        loadingState.classList.add('hidden');
        errorState.classList.remove('hidden');
        
        // Hide error after 5 seconds
        setTimeout(() => {
            errorState.classList.add('hidden');
        }, 5000);
    }
});