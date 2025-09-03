document.addEventListener('DOMContentLoaded', async () => {
    const user_id = localStorage.getItem('user_id');
    if (!user_id) {
        alert('User not logged in. Redirecting to login page.');
        window.location.href = '/ems-frontend/login.html';
        return;
    }
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

    const API_URL = `https://dashboard.wordlanetech.com/api/manager/projects/list?user_id=${user_id}`;
    const projectsGrid = document.getElementById('projectsGrid');
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');

    try {
        loadingState.classList.remove('hidden');
        const response = await fetch(API_URL);
        const projects = await response.json();
        loadingState.classList.add('hidden');

        if (!Array.isArray(projects) || projects.length === 0) {
            projectsGrid.innerHTML = `
                <div class="text-center text-gray-500 col-span-3">
                    No projects assigned yet.
                </div>
            `;
            return;
        }

        // Render all projects
        projectsGrid.innerHTML = projects.map(project => `
    <div class="project-card">
        <h3>${project.project_name}</h3>
        <p class="project-id">Project ID: ${project.id}</p>
        <p><strong>Status:</strong> ${project.status}</p>
        <p><strong>Start:</strong> ${formatDate(project.start_date)}</p>
        <p><strong>End:</strong> ${formatDate(project.end_date)}</p>
    </div>
`).join('');

    } catch (err) {
        console.error('Project fetch error:', err);
        loadingState.classList.add('hidden');
        errorState.classList.remove('hidden');
    }
});

// Format date in readable form
function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}
