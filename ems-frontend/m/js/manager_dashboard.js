document.addEventListener('DOMContentLoaded', async () => {
    const user_id = localStorage.getItem('user_id');

    if (!user_id) {
        alert('User not logged in. Redirecting to login page.');
        window.location.href = '/ems-frontend/login.html';
        return;
    }

    const API_BASE = 'http://localhost:3000/api/manager';

    const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return isNaN(date)
        ? 'N/A'
        : date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const fetchAndUpdate = async (endpoint, onSuccess) => {
        try {
            const res = await fetch(`${API_BASE}/${endpoint}?user_id=${user_id}`);
            const data = await res.json();
            onSuccess(data);
        } catch (err) {
            console.error(`${endpoint} API error:`, err);
        }
    };

    // 1. Profile
    await fetchAndUpdate('profile', (data) => {
        document.getElementById('employeeId').textContent = data.user_id || 'N/A';
        document.getElementById('department').textContent = data.department || 'N/A';
        document.getElementById('position').textContent = data.role || 'N/A';
        document.getElementById('email').textContent = data.email || 'N/A';

        const fullName = `${data.first_name} ${data.last_name}`;
        document.getElementById('userName').textContent = data.first_name;
        document.querySelector('.profile-name').textContent = fullName;
    });

    // 2. Projects
    await fetchAndUpdate('projects', (data) => {
        document.getElementById('totalProjects').textContent = data.total || 0;
        document.getElementById('activeProjects').textContent = data.active || 0;
        const milestoneDate = data.nextMilestone;
        document.getElementById('nextMilestone').textContent = milestoneDate && !isNaN(new Date(milestoneDate)) 
        ? formatDate(milestoneDate)
        : 'N/A';
    });

    // 3. Tasks
    await fetchAndUpdate('tasks', (data) => {
        document.getElementById('totalActiveTasks').textContent = data.totalActiveTasks || 0;
        document.getElementById('upcomingTask').textContent = data.upcomingTask || 'None';
        document.getElementById('taskProject').textContent = data.taskProject || 'No project';
    });

    // 4. Leaves
    await fetchAndUpdate('leaves', (data) => {
        document.getElementById('pendingLeaves').textContent = data.pending || 0;
        document.getElementById('approvedLeaves').textContent = data.approved || 0;
        document.getElementById('lastLeaveRequest').textContent = formatDate(data.lastRequest);
    });

    // 5. Latest Document
    await fetchAndUpdate('documents/latest', (data) => {
        if (Object.keys(data).length > 0) {
            document.getElementById('documentName').textContent = data.name || 'N/A';
            document.getElementById('documentType').textContent = data.type || 'N/A';
            document.getElementById('documentDate').textContent = formatDate(data.uploaded_at);
            document.getElementById('documentDesc').textContent = data.description || 'N/A';
        } else {
            document.getElementById('documentName').textContent = 'No document';
        }
    });

    // Profile Dropdown Logic
    const profileButton = document.getElementById('profileButton');
    const profileDropdown = document.getElementById('profileDropdown');

    profileButton?.addEventListener('click', (event) => {
        event.stopPropagation();
        profileDropdown.classList.toggle('show');
    });

    document.addEventListener('click', (event) => {
        if (!profileDropdown.contains(event.target) && !profileButton.contains(event.target)) {
            profileDropdown.classList.remove('show');
        }
    });
});
