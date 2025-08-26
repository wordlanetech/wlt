document.addEventListener("DOMContentLoaded", () => {
  const addDeptBtn = document.getElementById("addDepartmentBtn");
  const addDeptModal = document.getElementById("addDepartmentModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const addDeptForm = document.getElementById("addDepartmentForm");
  const deptGrid = document.getElementById("departmentsGrid");
  const messageBox = document.getElementById("deptMessageBox");

  // Show modal
  addDeptBtn.addEventListener("click", () => {
    addDeptModal.classList.remove("hidden");
  });

  // Close modal
  [closeModalBtn, cancelBtn].forEach(btn => {
    btn.addEventListener("click", () => {
      addDeptModal.classList.add("hidden");
      addDeptForm.reset();
      messageBox.classList.add("hidden");
    });
  });

  // Render departments
  function renderDepartments(departments) {
    deptGrid.innerHTML = "";
    departments.forEach((dept) => {
      const card = document.createElement("div");
      card.className = "bg-white rounded-lg shadow-md p-4 border border-gray-200";
      card.innerHTML = `
        <h3 class="text-xl font-bold text-gray-800 mb-1">${dept.name}</h3>
        <p class="text-sm text-gray-600 mb-2">${dept.description}</p>
        <p class="text-sm text-gray-500"><strong>ID:</strong> ${dept.id}</p>
        <p class="text-sm text-gray-500"><strong>Head:</strong> ${dept.head}</p>
      `;
      deptGrid.appendChild(card);
    });
  }

  // Load departments from API
  async function fetchAndRenderDepartments() {
    try {
      const response = await fetch('http://localhost:3001/api/full-departments');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const departments = await response.json();
      renderDepartments(departments);
    } catch (error) {
      console.error('Error fetching departments:', error);
      alert("Failed to load departments. Please try again.");
    }
  }

  // Submit department form
  addDeptForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      id: document.getElementById("deptId").value.trim(),
      name: document.getElementById("deptName").value.trim(),
      description: document.getElementById("deptDesc").value.trim(),
      head: document.getElementById("deptHead").value.trim(),
    };

    try {
      const res = await fetch("http://localhost:3001/api/full-departments/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to add department");

      showMessage("Department added successfully!", true);
      addDeptForm.reset();
      fetchAndRenderDepartments(); // reload after adding
    } catch (err) {
      showMessage(err.message, false);
    }
  });

  function showMessage(msg, success = true) {
    messageBox.textContent = msg;
    messageBox.className = `text-sm mt-2 text-center px-4 py-2 rounded ${success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`;
    messageBox.classList.remove("hidden");
  }

  // Initial call
  fetchAndRenderDepartments();
});
