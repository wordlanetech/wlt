document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'https://dashboard.wordlanetech.com/api';

    const addEmployeeBtn = document.getElementById('addEmployeeBtn');
    const addEmployeeModal = document.getElementById('addEmployeeModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const addEmployeeForm = document.getElementById('addEmployeeForm');
    const messageBox = document.getElementById('messageBox');
    const employeesTableBody = document.getElementById('employeesTableBody');
    const searchInput = document.getElementById('searchInput');

    // Add toast notification container
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    document.body.appendChild(toastContainer);

    const liveClock = document.getElementById('liveClock');
    if (liveClock) {
        function updateLiveClock() {
            const now = new Date();
            liveClock.textContent = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
        }
        setInterval(updateLiveClock, 1000);
    }

    // Enhanced toast notification function
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type} show`;
        toast.textContent = message;
        
        // Add icon based on type
        const icon = document.createElement('i');
        icon.className = type === 'success' ? 'fas fa-check-circle mr-2' : 'fas fa-exclamation-circle mr-2';
        toast.insertBefore(icon, toast.firstChild);
        
        toastContainer.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    function showMessage(message, type = 'error') {
        messageBox.textContent = message;
        messageBox.classList.remove('hidden', 'bg-red-100', 'text-red-800', 'bg-green-100', 'text-green-800');
        if (type === 'success') {
            messageBox.classList.add('bg-green-100', 'text-green-800');
        } else {
            messageBox.classList.add('bg-red-100', 'text-red-800');
        }
        messageBox.classList.remove('hidden');
        
        // Auto-hide success messages after 3 seconds
        if (type === 'success') {
            setTimeout(() => {
                messageBox.classList.add('hidden');
            }, 3000);
        }
    }

    function openModal() {
        addEmployeeModal.classList.remove('hidden');
        setTimeout(() => {
            addEmployeeModal.classList.add('active');
            addEmployeeModal.querySelector('.modal-content').classList.add('active');
        }, 10);
        
        // Reset form when opening modal
        addEmployeeForm.reset();
        messageBox.classList.add('hidden');
        
        // Add pulse animation to primary button
        const primaryBtn = addEmployeeModal.querySelector('.modal-button-primary');
        primaryBtn.classList.add('pulse-animation');
        setTimeout(() => {
            primaryBtn.classList.remove('pulse-animation');
        }, 2000);
    }

    function closeModal() {
        addEmployeeModal.classList.remove('active');
        addEmployeeModal.querySelector('.modal-content').classList.remove('active');
        setTimeout(() => {
            addEmployeeModal.classList.add('hidden');
            addEmployeeForm.reset();
            messageBox.classList.add('hidden');
        }, 300);
    }

    addEmployeeBtn?.addEventListener('click', openModal);
    closeModalBtn?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);
    addEmployeeModal?.addEventListener('click', (e) => {
        if (e.target === addEmployeeModal) closeModal();
    });

    async function populateDropdowns() {
        try {
            const [genders, departments, designations, roles] = await Promise.all([
                fetch(`${API_BASE_URL}/genders`).then(res => res.json()),
                fetch(`${API_BASE_URL}/departments`).then(res => res.json()),
                fetch(`${API_BASE_URL}/designations`).then(res => res.json()),
                fetch(`${API_BASE_URL}/roles`).then(res => res.json())
            ]);
            populateSelect('gender_id', genders);
            populateSelect('department_id', departments);
            populateSelect('designation_id', designations);
            populateSelect('role_id', roles);
        } catch (err) {
            console.error('Error populating dropdowns:', err);
            showMessage('Failed to load dropdown data.');
            showToast('Failed to load dropdown data.', 'error');
        }
    }

    function populateSelect(id, data) {
        const select = document.getElementById(id);
        if (!select) return;
        select.innerHTML = `<option value="">Select</option>`;
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name;
            select.appendChild(option);
        });
    }

    async function fetchEmployees() {
        employeesTableBody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-500">
            <div class="flex flex-col items-center justify-center">
                <div class="loading-spinner mb-3"></div>
                <p>Loading employees...</p>
            </div>
        </td></tr>`;
        try {
            const response = await fetch(`${API_BASE_URL}/employees/list`);
            const employees = await response.json();

            console.log("Fetched employees:", employees);

            if (!Array.isArray(employees)) throw new Error("Invalid employee data");

            if (employees.length === 0) {
                employeesTableBody.innerHTML = `<tr><td colspan="5" class="text-center py-8">
                    <div class="empty-state">
                        <div class="empty-state-icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <h3 class="empty-state-title">No employees found</h3>
                        <p class="empty-state-description">Add your first employee to get started</p>
                        <button id="addFirstEmployeeBtn" class="btn-primary">
                            <i class="fas fa-user-plus mr-2"></i> Add Employee
                        </button>
                    </div>
                </td></tr>`;
                
                document.getElementById('addFirstEmployeeBtn')?.addEventListener('click', openModal);
                updateStatsCards(employees);
                return;
            }

            // Update stats cards
            updateStatsCards(employees);
            
            // Display employees
            displayEmployees(employees);

        } catch (err) {
            console.error('Error fetching employees:', err);
            employeesTableBody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-red-500">
                <div class="flex flex-col items-center justify-center">
                    <i class="fas fa-exclamation-circle text-3xl text-red-400 mb-3"></i>
                    <p class="font-medium">Failed to load employee data</p>
                    <p class="text-sm mt-1">Please try again later</p>
                </div>
            </td></tr>`;
            showToast('Failed to load employee data.', 'error');
        }
    }
    
    function updateStatsCards(employees) {
        // Total employees
        document.getElementById('totalEmployeesCount').textContent = employees.length;
        
        // For demo purposes, we'll simulate the other counts
        // In a real application, these would come from the API
        document.getElementById('activeEmployeesCount').textContent = employees.length;
        document.getElementById('departmentsCount').textContent = Math.max(1, Math.floor(employees.length / 5));
        
        // Add animation to stats cards when updated
        const statsCards = document.querySelectorAll('.stats-card');
        statsCards.forEach(card => {
            card.style.animation = 'none';
            setTimeout(() => {
                card.style.animation = 'cardEntrance 0.6s ease-out forwards';
            }, 10);
        });
        
        // Show toast notification for stats update
        showToast(`Employee data updated. Total: ${employees.length}`, 'success');
    }
    
    function displayEmployees(employees) {
        employeesTableBody.innerHTML = '';
        
        employees.forEach((emp, index) => {
            const initials = `${emp.first_name?.charAt(0) ?? ''}${emp.last_name?.charAt(0) ?? ''}`;
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50 transition-all duration-200 ease-in-out';
            row.innerHTML = `
                <td class="py-3 px-4 text-sm font-medium text-gray-900 text-center align-middle">
                    <div class="modern-user-id">${emp.user_id ?? 'N/A'}</div>
                </td>
                <td class="py-3 px-4 text-center align-middle">
                    <div class="flex items-center justify-center">
                        <div class="modern-avatar bg-gradient-to-br from-blue-500 to-indigo-600 mr-3 flex-shrink-0">
                            ${initials}
                        </div>
                        <div class="text-left">
                            <div class="font-medium text-gray-900">${emp.first_name ?? 'N/A'} ${emp.last_name ?? ''} <span class="text-sm text-gray-500">(${emp.email ?? 'N/A'})</span></div>
                        </div>
                    </div>
                </td>
                <td class="py-3 px-4 text-sm text-gray-900 text-center align-middle">${emp.designation_name ?? 'N/A'}</td>
                <td class="py-3 px-4 text-sm text-gray-900 text-center align-middle">
                    <div class="flex justify-center">
                        <span class="modern-department-badge">
                            ${emp.department_name ?? 'N/A'}
                        </span>
                    </div>
                </td>
                <td class="py-3 px-1 text-sm text-center align-middle">
                    <div class="modern-actions">
                        <button class="modern-action-btn view" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="modern-action-btn edit" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="modern-action-btn delete" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            // Add staggered animation to rows
            row.style.animation = `fadeInUp 0.3s ease-out ${index * 0.05}s both`;
            
            employeesTableBody.appendChild(row);
        });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.action-btn.view').forEach(btn => {
            btn.addEventListener('click', function() {
                const row = this.closest('tr');
                const name = row.querySelector('.font-medium').textContent;
                showToast(`Viewing details for ${name}`, 'success');
                
                // Add visual feedback
                this.classList.add('pulse-animation');
                setTimeout(() => {
                    this.classList.remove('pulse-animation');
                }, 1000);
            });
        });
        
        document.querySelectorAll('.action-btn.edit').forEach(btn => {
            btn.addEventListener('click', function() {
                const row = this.closest('tr');
                const name = row.querySelector('.font-medium').textContent;
                showToast(`Editing ${name}`, 'success');
                
                // Add visual feedback
                this.classList.add('pulse-animation');
                setTimeout(() => {
                    this.classList.remove('pulse-animation');
                }, 1000);
            });
        });
        
        document.querySelectorAll('.action-btn.delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const row = this.closest('tr');
                const name = row.querySelector('.font-medium').textContent;
                if (confirm(`Are you sure you want to delete ${name}?`)) {
                    showToast(`Deleted ${name}`, 'success');
                    row.style.animation = 'fadeOutDown 0.3s ease-out forwards';
                    setTimeout(() => {
                        row.remove();
                        // Update stats after deletion
                        const currentCount = parseInt(document.getElementById('totalEmployeesCount').textContent);
                        updateStatsCards(Array(currentCount - 1).fill({}));
                    }, 300);
                } else {
                    showToast('Delete cancelled', 'success');
                }
            });
        });
    }

    addEmployeeForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        messageBox.classList.add('hidden');

        const formData = new FormData(addEmployeeForm);
        const data = Object.fromEntries(formData.entries());

        if (data.password !== data.confirmPassword) {
            showMessage('Passwords do not match.');
            showToast('Passwords do not match.', 'error');
            return;
        }

        delete data.confirmPassword;

        // Show loading state
        const submitBtn = addEmployeeForm.querySelector('.modal-button-primary');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Adding...';
        submitBtn.disabled = true;

        try {
            const response = await fetch(`${API_BASE_URL}/employees/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to add employee');

            showMessage(result.message, 'success');
            showToast(result.message, 'success');
            fetchEmployees();
            setTimeout(closeModal, 2000);
        } catch (err) {
            console.error('Error submitting form:', err);
            showMessage(err.message);
            showToast(err.message, 'error');
        } finally {
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    // Enhanced search functionality with debounce
    let searchTimeout;
    searchInput?.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#employeesTableBody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
            
            // Show empty state if no results
            const visibleRows = Array.from(rows).filter(row => row.style.display !== 'none');
            if (visibleRows.length === 0 && searchTerm) {
                employeesTableBody.innerHTML = `<tr><td colspan="5" class="text-center py-8">
                    <div class="empty-state">
                        <div class="empty-state-icon">
                            <i class="fas fa-search"></i>
                        </div>
                        <h3 class="empty-state-title">No employees found</h3>
                        <p class="empty-state-description">No employees match your search for "${searchTerm}"</p>
                    </div>
                </td></tr>`;
                showToast(`No employees found for "${searchTerm}"`, 'success');
            } else if (visibleRows.length === 0 && !searchTerm) {
                fetchEmployees(); // Reload all employees if search is cleared
            }
        }, 300);
    });
    
    // Add animation styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes fadeOutDown {
            from {
                opacity: 1;
                transform: translateY(0);
            }
            to {
                opacity: 0;
                transform: translateY(20px);
            }
        }
        
        .loading-spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(31, 68, 106, 0.2);
            border-radius: 50%;
            border-top-color: #1F446A;
            animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        /* Enhanced notification toast */
        .toast {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            color: white;
            font-weight: 500;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transform: translateX(120%);
            transition: transform 0.3s ease;
            z-index: 1000;
            display: flex;
            align-items: center;
        }
        
        .toast.show {
            transform: translateX(0);
        }
        
        .toast.success {
            background: linear-gradient(135deg, #10b981, #059669);
        }
        
        .toast.error {
            background: linear-gradient(135deg, #ef4444, #dc2626);
        }
        
        /* Enhanced empty state */
        .empty-state {
            text-align: center;
            padding: 3rem 1rem;
        }
        
        .empty-state-icon {
            font-size: 3rem;
            color: #cbd5e1;
            margin-bottom: 1rem;
        }
        
        .empty-state-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #334155;
            margin-bottom: 0.5rem;
        }
        
        .empty-state-description {
            color: #64748b;
            margin-bottom: 1.5rem;
        }
        
        /* Enhanced pulse animation for buttons */
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(31, 68, 106, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(31, 68, 106, 0); }
            100% { box-shadow: 0 0 0 0 rgba(31, 68, 106, 0); }
        }
        
        .pulse-animation {
            animation: pulse 2s infinite;
        }
    `;
    document.head.appendChild(style);
    
    // Initialize the page
    populateDropdowns();
    fetchEmployees();
    
    // Add a welcome toast
    setTimeout(() => {
        showToast('Welcome to the Employee Management System!', 'success');
    }, 1000);
});