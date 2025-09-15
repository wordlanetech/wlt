// Admin Dashboard JavaScript - Enhanced Version with Aesthetic Improvements
// Global variables
let dashboardData = {};
let departmentChart = null;
const API_BASE_URL = 'https://dashboard.wordlanetech.com/api';

// Initialize dashboard when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupProfileDropdown();
    setupNavigation();
    setInterval(updateLastUpdatedTime, 60000); // Update every minute
});

// Initialize dashboard
async function initializeDashboard() {
    try {
        showLoading(true);
        await Promise.all([
            fetchDashboardStats(),
            fetchPendingApprovals(),
            fetchDepartmentData(),
            loadUserProfile()
        ]);
        updateLastUpdatedTime();
    } catch (error) {
        console.error('Dashboard initialization error:', error);
        showError('Failed to load dashboard data. Please check your connection.');
    } finally {
        showLoading(false);
    }
}

// Fetch dashboard statistics
async function fetchDashboardStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard-stats`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                logout();
                return;
            }
            throw new Error(`Failed to fetch dashboard stats: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        dashboardData.stats = data;
        
        // Update dashboard cards with animation
        updateElementIfExists('totalEmployees', data.totalEmployees || '0');
        updateElementIfExists('newHires', data.newHires || '0');
        updateElementIfExists('pendingLeaves', data.pendingLeaves || '0');
        updateElementIfExists('activeProjects', data.activeProjects || '0');
        
        // Add trend indicators with enhanced styling
        addTrendIndicator('employeesChange', data.totalEmployees, 'Employees');
        addTrendIndicator('hiresChange', data.newHires, 'Hires');
        addTrendIndicator('leavesChange', data.pendingLeaves, 'Leaves');
        addTrendIndicator('projectsChange', data.activeProjects, 'Projects');
        
        // Add subtle animation to cards
        animateCards();
        
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        updateStatsWithError();
    }
}

// Fetch pending approvals
async function fetchPendingApprovals() {
    try {
        const response = await fetch(`${API_BASE_URL}/leaves?status=pending&limit=5`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                logout();
                return;
            }
            throw new Error(`Failed to fetch pending approvals: ${response.status} ${response.statusText}`);
        }
        
        const approvals = await response.json();
        displayPendingApprovals(approvals);
    } catch (error) {
        console.error('Error fetching pending approvals:', error);
        displayPendingApprovalsError();
    }
}

// Fetch department data for chart
async function fetchDepartmentData() {
    try {
        const response = await fetch(`${API_BASE_URL}/full-departments`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                logout();
                return;
            }
            throw new Error(`Failed to fetch department data: ${response.status} ${response.statusText}`);
        }
        
        const departments = await response.json();
        console.log('Department data received:', departments); // Debug log
        createDepartmentChart(departments);
        updateDepartmentStats(departments);
    } catch (error) {
        console.error('Error fetching department data:', error);
        // Show placeholder if chart fails
        showChartPlaceholder();
    }
}

// Update department stats in the quick stats section
function updateDepartmentStats(departments) {
    if (!departments || departments.length === 0) {
        updateElementIfExists('totalDepartments', '0');
        updateElementIfExists('avgEmployees', '0');
        updateProgress('departmentsProgress', 0);
        updateProgress('employeesProgress', 0);
        return;
    }
    
    // Total departments
    const totalDepartments = departments.length;
    updateElementIfExists('totalDepartments', totalDepartments);
    
    // Average employees per department
    const totalEmployees = departments.reduce((sum, dept) => sum + (parseInt(dept.employee_count) || 0), 0);
    const avgEmployees = totalDepartments > 0 ? Math.round(totalEmployees / totalDepartments) : 0;
    updateElementIfExists('avgEmployees', avgEmployees);
    
    // Update progress bars (simplified)
    updateProgress('departmentsProgress', Math.min(100, totalDepartments * 10));
    updateProgress('employeesProgress', Math.min(100, avgEmployees * 10));
}

// Update progress bar width
function updateProgress(elementId, percentage) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.width = `${Math.min(100, percentage)}%`;
    }
}

// Load user profile
async function loadUserProfile() {
    try {
        const userId = localStorage.getItem('user_id');
        const roleId = localStorage.getItem('role_id');
        const token = localStorage.getItem('token');
        
        if (!userId || !roleId || !token) {
            logout();
            return;
        }

        // Set admin profile info
        updateElementIfExists('profileName', 'Admin');
        const profileImg = document.getElementById('profileImage');
        if (profileImg) {
            profileImg.src = 'https://placehold.co/32x32/1F446A/FFFFFF?text=AD';
            // Add floating animation
            profileImg.style.animation = 'float 3s ease-in-out infinite';
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
    }
}

// Display pending approvals
function displayPendingApprovals(approvals) {
    const container = document.getElementById('pendingApprovalsContainer');
    if (!container) return;
    
    if (!approvals || approvals.length === 0) {
        container.innerHTML = `
            <div class="text-center py-6">
                <i class="fas fa-check-circle text-2xl text-green-400 mb-2"></i>
                <p class="text-gray-500 text-sm">No pending approvals</p>
            </div>
        `;
        return;
    }

    container.innerHTML = approvals.slice(0, 3).map((approval, index) => `
        <div class="p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-300 border border-gray-100 hover:border-[#1F446A]/20 hover:shadow-sm" 
             onclick="navigateTo('admin_leaves.html')" 
             style="animation-delay: ${index * 0.1}s">
            <div class="flex justify-between items-start">
                <div>
                    <h5 class="text-sm font-semibold text-gray-800">${escapeHtml(approval.employee_name || 'Employee')}</h5>
                    <p class="text-xs text-gray-600 mt-1">${escapeHtml(approval.leave_type || 'Leave Request')}</p>
                </div>
                <span class="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">${formatDate(approval.created_at)}</span>
            </div>
        </div>
    `).join('');
}

// Create department chart
function createDepartmentChart(departments) {
    const ctx = document.getElementById('departmentChart');
    const placeholder = document.getElementById('chartPlaceholder');
    const container = document.getElementById('chartContainer');
    
    if (!ctx || !placeholder || !container) return;

    // Hide placeholder and show chart
    placeholder.classList.add('hidden');
    container.classList.remove('hidden');

    if (departmentChart) {
        departmentChart.destroy();
    }

    // Check if we have data
    if (!departments || departments.length === 0) {
        console.log('No department data available');
        showChartPlaceholder();
        return;
    }

    // Filter out departments with no employees and those without names
    const validDepartments = departments.filter(dept => 
        dept.name && dept.name.trim() !== '' && 
        (dept.employee_count > 0 || dept.employee_count === 0)
    );
    
    console.log('Valid departments:', validDepartments); // Debug log

    // If no valid departments, show placeholder
    if (validDepartments.length === 0) {
        console.log('No valid departments to display');
        showChartPlaceholder();
        return;
    }

    const labels = validDepartments.map(dept => dept.name || 'Unknown');
    const data = validDepartments.map(dept => parseInt(dept.employee_count) || 0);
    
    console.log('Chart data:', { labels, data }); // Debug log
    
    // If all data is zero, we'll still show the chart but with a message
    if (data.every(count => count === 0)) {
        console.log('All departments have zero employees');
        // We'll still show the chart with zero data rather than placeholder
    }
    
    const colors = [
        '#1F446A', '#0ea5e9', '#059669', '#10b981', 
        '#d97706', '#f59e0b', '#dc2626', '#ef4444',
        '#7c3aed', '#8b5cf6', '#0d9488', '#14b8a6'
    ];

    departmentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 0,
                hoverOffset: 12,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 12,
                            family: "'Inter', sans-serif"
                        },
                        color: '#334155'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(31, 68, 106, 0.9)',
                    titleFont: {
                        size: 14,
                        family: "'Inter', sans-serif"
                    },
                    bodyFont: {
                        size: 13,
                        family: "'Inter', sans-serif"
                    },
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.raw} employees`;
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1000
            }
        }
    });
    
    // If all data is zero, show a message on the chart
    if (data.every(count => count === 0)) {
        // Add a text overlay to indicate no data
        const chartWrapper = ctx.closest('.h-64');
        if (chartWrapper) {
            // Remove any existing no data message
            const existingMessage = chartWrapper.querySelector('.no-data-message');
            if (existingMessage) {
                existingMessage.remove();
            }
            
            const noDataMessage = document.createElement('div');
            noDataMessage.className = 'no-data-message absolute inset-0 flex items-center justify-center';
            noDataMessage.innerHTML = `
                <div class="text-center text-gray-500 bg-white bg-opacity-80 px-4 py-2 rounded-lg">
                    <i class="fas fa-chart-pie text-2xl mb-2"></i>
                    <p class="text-sm">No employee data available</p>
                </div>
            `;
            chartWrapper.style.position = 'relative';
            chartWrapper.appendChild(noDataMessage);
        }
    }
}

// Show chart placeholder
function showChartPlaceholder() {
    const placeholder = document.getElementById('chartPlaceholder');
    const container = document.getElementById('chartContainer');
    
    if (placeholder && container) {
        container.classList.add('hidden');
        placeholder.classList.remove('hidden');
    }
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateElementIfExists(id, value) {
    const element = document.getElementById(id);
    if (element) {
        // Add fade effect when updating
        element.style.opacity = '0.5';
        setTimeout(() => {
            element.textContent = value;
            element.style.opacity = '1';
        }, 150);
    }
}

function addTrendIndicator(elementId, value, label) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Simple trend based on value (in a real app, this would come from backend)
    const trend = value > 10 ? 'up' : value < 5 ? 'down' : 'stable';
    const trendText = trend === 'up' ? '↗ Increased' : trend === 'down' ? '↘ Decreased' : '→ Stable';
    const trendClass = trend === 'up' ? 'trend up' : trend === 'down' ? 'trend down' : 'trend stable';
    
    element.innerHTML = `<span class="${trendClass}"><i class="fas fa-${trend === 'up' ? 'arrow-up' : trend === 'down' ? 'arrow-down' : 'minus'} mr-1"></i> ${trendText} this month</span>`;
}

function updateStatsWithError() {
    ['totalEmployees', 'newHires', 'pendingLeaves', 'activeProjects'].forEach(id => {
        updateElementIfExists(id, 'Error');
    });
}

function displayPendingApprovalsError() {
    const container = document.getElementById('pendingApprovalsContainer');
    if (container) {
        container.innerHTML = `
            <div class="text-center py-6 text-red-500">
                <i class="fas fa-exclamation-circle text-xl mb-2"></i>
                <p class="text-sm">Failed to load approvals</p>
                <button onclick="fetchPendingApprovals()" class="mt-2 text-xs text-[#1F446A] hover:underline">Retry</button>
            </div>
        `;
    }
}

function updateLastUpdatedTime() {
    const now = new Date();
    updateElementIfExists('lastUpdated', `Updated: ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`);
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.toggle('hidden', !show);
    }
}

function showError(message) {
    console.error(message);
    // In a real app, you might show a toast notification here
}

// Navigation and interaction functions
function navigateTo(page) {
    // Add smooth transition
    document.body.style.opacity = '0.8';
    document.body.style.transform = 'scale(0.98)';
    setTimeout(() => {
        window.location.href = page;
    }, 300);
}

function refreshDashboard() {
    const icon = document.getElementById('refreshIcon');
    if (icon) {
        icon.classList.add('fa-spin');
    }
    
    // Add visual feedback
    document.body.style.opacity = '0.95';
    
    initializeDashboard().finally(() => {
        setTimeout(() => {
            if (icon) {
                icon.classList.remove('fa-spin');
            }
            document.body.style.opacity = '1';
            document.body.style.transform = 'scale(1)';
        }, 500);
    });
}

function logout() {
    if (confirm('Your session has expired. Please log in again.')) {
        localStorage.clear();
        window.location.href = '../login.html';
    }
}

// Profile dropdown setup
function setupProfileDropdown() {
    const profileButton = document.getElementById('profileButton');
    const profileDropdown = document.getElementById('profileDropdown');

    if (profileButton && profileDropdown) {
        profileButton.addEventListener('click', function(e) {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
        });

        // Hide dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!profileDropdown.contains(e.target) && !profileButton.contains(e.target)) {
                profileDropdown.classList.remove('show');
            }
        });
    }
}

// Navigation setup
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPage = window.location.pathname.split('/').pop();

    navLinks.forEach(link => {
        const hrefPage = link.getAttribute('href');
        if (hrefPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Enhanced animations
function animateCards() {
    const cards = document.querySelectorAll('.dashboard-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 200 + (index * 100));
    });
}