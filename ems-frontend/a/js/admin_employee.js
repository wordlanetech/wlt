document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:3001/api';

    const addEmployeeBtn = document.getElementById('addEmployeeBtn');
    const addEmployeeModal = document.getElementById('addEmployeeModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const addEmployeeForm = document.getElementById('addEmployeeForm');
    const messageBox = document.getElementById('messageBox');
    const employeesTableBody = document.getElementById('employeesTableBody');

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

    function showMessage(message, type = 'error') {
        messageBox.textContent = message;
        messageBox.classList.remove('hidden', 'bg-red-100', 'text-red-800', 'bg-green-100', 'text-green-800');
        if (type === 'success') {
            messageBox.classList.add('bg-green-100', 'text-green-800');
        } else {
            messageBox.classList.add('bg-red-100', 'text-red-800');
        }
    }

    function openModal() {
        addEmployeeModal.classList.remove('hidden');
        setTimeout(() => {
            addEmployeeModal.classList.add('active');
            addEmployeeModal.querySelector('.modal-content').classList.add('active');
        }, 10);
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
        employeesTableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-gray-500">Loading employees...</td></tr>`;
        try {
            const response = await fetch(`${API_BASE_URL}/employees/list`);
            const employees = await response.json();

            console.log("Fetched employees:", employees); // ✅ DEBUG

            if (!Array.isArray(employees)) throw new Error("Invalid employee data");

            employeesTableBody.innerHTML = '';
if (!Array.isArray(employees)) {
    employeesTableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-red-500">Invalid data from server.</td></tr>`;
    return;
}

            if (employees.length === 0) {
                employeesTableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-gray-500">No employees found.</td></tr>`;
                return;
            }

            employees.forEach(emp => {
                const initials = `${emp.first_name?.charAt(0) ?? ''}${emp.last_name?.charAt(0) ?? ''}`;
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${emp.user_id}</td>
                    <td class="flex items-center space-x-3">
                        <img src="https://placehold.co/40x40/CCCCCC/FFFFFF?text=${initials}" class="w-10 h-10 rounded-full object-cover">
                        <span class="font-semibold text-gray-800">${emp.first_name ?? 'N/A'} ${emp.last_name ?? ''}</span>
                    </td>
                    <td>${emp.designation_name ?? 'N/A'}</td>
                    <td>${emp.department_name ?? 'N/A'}</td>
                    <td>
                        <div class="flex space-x-2">
                            <button class="text-blue-500 hover:text-blue-700"><i class="fas fa-eye"></i></button>
                            <button class="text-yellow-500 hover:text-yellow-700"><i class="fas fa-edit"></i></button>
                            <button class="text-red-500 hover:text-red-700"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                `;
                employeesTableBody.appendChild(row);
            });

        } catch (err) {
            console.error('Error fetching employees:', err);
            employeesTableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-red-500">Failed to load employee data.</td></tr>`;
        }
    }

    addEmployeeForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        messageBox.classList.add('hidden');

        const formData = new FormData(addEmployeeForm);
        const data = Object.fromEntries(formData.entries());

        if (data.password !== data.confirmPassword) {
            showMessage('Passwords do not match.');
            return;
        }

        delete data.confirmPassword;

        try {
            const response = await fetch(`${API_BASE_URL}/employees/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to add employee');

            showMessage(result.message, 'success');
            fetchEmployees();
            setTimeout(closeModal, 2000);
        } catch (err) {
            console.error('Error submitting form:', err);
            showMessage(err.message);
        }
    });

    populateDropdowns();
    fetchEmployees();
});
