document.addEventListener("DOMContentLoaded", function () {
  // ==================
  // Profile Dropdown (Global, for ALL pages)
  // ==================
  const profileButton = document.getElementById("profileButton");
  const profileDropdown = document.getElementById("profileDropdown");
  profileButton?.addEventListener("click", function (e) {
    e.stopPropagation();
    profileDropdown?.classList.toggle("show");
  });
  document.addEventListener("click", function (e) {
    if (
      !profileDropdown?.contains(e.target) &&
      !profileButton?.contains(e.target)
    ) {
      profileDropdown?.classList.remove("show");
    }
  });

  // ==================
  // EMPLOYEES / DEPARTMENTS LOGIC OMITTED
  // (Place your existing Employees, Departments logic here.)
  // ==================

  // ==================
  // ATTENDANCE PAGE LOGIC (API-ready, robust)
  // ==================
  if (document.body.classList.contains("attendance-page")) {
    let attendanceData = [];

    function getStatusClass(status) {
      if (status === "Present") return "status-present";
      if (status === "Absent") return "status-absent";
      if (status === "Leave") return "status-leave";
      return "";
    }

    function getInitials(name) {
      return (name || "")
        .split(" ")
        .map((w) => w[0]?.toUpperCase() || "")
        .join("")
        .slice(0, 2);
    }

    function renderAttendanceTable(data) {
      const tbody = document.getElementById("attendanceTableBody");
      if (!tbody) return;
      tbody.innerHTML = "";
      if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-gray-400 font-semibold">No attendance data found.</td></tr>`;
        return;
      }
      data.forEach((row) => {
        tbody.innerHTML += `
          <tr>
            <td class="flex items-center">
              <span class="employee-initials">${row.initials || getInitials(row.name)}</span>
              ${row.name}
            </td>
            <td>${row.date}</td>
            <td class="${row.checkin === '--' ? 'text-dash' : ''}">${row.checkin}</td>
            <td class="${row.checkout === '--' ? 'text-dash' : ''}">${row.checkout}</td>
            <td class="${row.hours === '--' ? 'text-dash' : ''}">${row.hours}</td>
            <td class="${getStatusClass(row.status)}">${row.status}</td>
            <td>
              <a href="#" class="action-icon"><i class="fas fa-edit"></i></a>
            </td>
          </tr>
        `;
      });
    }

    function filterAndSearchAttendance() {
      const dateFilter = document.getElementById("attendanceDateFilter")?.value;
      const search = document
        .getElementById("attendanceSearch")
        ?.value.trim()
        .toLowerCase();
      let filtered = attendanceData;
      if (dateFilter) filtered = filtered.filter((row) => row.date === dateFilter);
      if (search) filtered = filtered.filter((row) => row.name.toLowerCase().includes(search));
      renderAttendanceTable(filtered);
    }

    async function loadAttendanceData() {
      const API_URL = ""; // Your real API endpoint here
      try {
        if (API_URL) {
          const res = await fetch(API_URL, { credentials: "include" });
          if (!res.ok) throw new Error("Failed to fetch attendance");
          attendanceData = await res.json();
        } else {
          attendanceData = [
            { initials: "JP", name: "John Parker", date: "2025-08-01", checkin: "09:00 AM", checkout: "05:00 PM", hours: "8.0 hours", status: "Present" },
            { initials: "SD", name: "Sarah Davis", date: "2025-08-01", checkin: "--", checkout: "--", hours: "--", status: "Absent" },
            { initials: "MB", name: "Mike Brown", date: "2025-08-01", checkin: "08:30 AM", checkout: "05:30 PM", hours: "9.0 hours", status: "Present" },
            { initials: "MB", name: "Mike Brown", date: "2025-08-02", checkin: "09:30 AM", checkout: "05:10 PM", hours: "7.5 hours", status: "Present" },
          ];
        }
      } catch (error) {
        attendanceData = [];
        alert("Could not load attendance data.");
      }
      renderAttendanceTable(attendanceData);
    }

    document.getElementById("attendanceDateFilter")?.addEventListener("input", filterAndSearchAttendance);
    document.getElementById("attendanceSearch")?.addEventListener("input", filterAndSearchAttendance);

    function updateAttendanceClock() {
      const clock = document.getElementById("currentTime");
      if (!clock) return;
      const now = new Date();
      let hours = now.getHours();
      const mins = now.getMinutes().toString().padStart(2, "0");
      const secs = now.getSeconds().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      clock.textContent = `${hours.toString().padStart(2, "0")}:${mins}:${secs} ${ampm}`;
    }
    setInterval(updateAttendanceClock, 1000);
    updateAttendanceClock();

    document.querySelector(".export-btn")?.addEventListener("click", function () {
      alert("Export functionality is not implemented yet.");
    });

    loadAttendanceData();
  }

  // ==================
  // LEAVES PAGE LOGIC (API-ready, modular)
  // ==================
  if (document.body.classList.contains("leaves-page")) {
    let leavesData = [];
    const statusClasses = {
      Pending: "status-chip status-pending",
      Approved: "status-chip status-approved",
      Declined: "status-chip status-declined"
    };
    async function loadLeavesData() {
      const LEAVES_API_URL = ""; // Your endpoint here
      try {
        if (LEAVES_API_URL) {
          const res = await fetch(LEAVES_API_URL, { credentials: "include" });
          if (!res.ok) throw new Error("Failed to fetch leaves");
          leavesData = await res.json();
        } else {
          leavesData = [
            { employee: "John Parker", type: "Sick Leave", start: "2025-08-05", end: "2025-08-05", status: "Pending" },
            { employee: "Sarah Davis", type: "Vacation", start: "2025-08-10", end: "2025-08-15", status: "Approved" }
          ];
        }
      } catch (error) {
        leavesData = [];
        alert("Could not load leave requests.");
      }
      renderLeavesTable();
    }
    function renderLeavesTable() {
      const tbody = document.getElementById("leavesTableBody");
      const filterStatus = document.getElementById("leaveStatusFilter")?.value;
      let filtered = leavesData;
      if (filterStatus) filtered = leavesData.filter((l) => l.status === filterStatus);

      tbody.innerHTML = "";
      if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-gray-400">No leave requests found.</td></tr>`;
        return;
      }
      filtered.forEach((leave) => {
        tbody.innerHTML += `
          <tr>
            <td>${leave.employee}</td>
            <td>${leave.type}</td>
            <td>${leave.start}</td>
            <td>${leave.end}</td>
            <td><span class="${statusClasses[leave.status]}">${leave.status}</span></td>
            <td>
              <a href="#" class="action-icon text-[#1F446A]"><i class="fas fa-eye"></i></a>
              ${
                leave.status === "Pending"
                  ? `<a href="#" class="action-icon text-green-600 ml-2 approve-leave"><i class="fas fa-check"></i></a>
                     <a href="#" class="action-icon text-red-600 ml-2 decline-leave"><i class="fas fa-times"></i></a>`
                  : ""
              }
            </td>
          </tr>
        `;
      });
    }
    const addLeaveBtn = document.getElementById("addLeaveBtn");
    const addLeaveModal = document.getElementById("addLeaveModal");
    const closeLeaveModal = document.getElementById("closeLeaveModal");
    const cancelLeaveBtn = document.getElementById("cancelLeaveBtn");
    const addLeaveForm = document.getElementById("addLeaveForm");
    const leaveMessageBox = document.getElementById("leaveMessageBox");

    addLeaveBtn?.addEventListener("click", () => {
      addLeaveModal.classList.remove("hidden", "opacity-0");
      addLeaveModal.classList.add("flex");
    });
    function closeModal() {
      addLeaveModal.classList.add("opacity-0");
      setTimeout(() => {
        addLeaveModal.classList.add("hidden");
        addLeaveModal.classList.remove("flex");
      }, 200);
    }
    closeLeaveModal?.addEventListener("click", closeModal);
    cancelLeaveBtn?.addEventListener("click", closeModal);
    addLeaveForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const emp = document.getElementById("leaveEmployee").value.trim();
      const type = document.getElementById("leaveType").value;
      const start = document.getElementById("leaveStartDate").value;
      const end = document.getElementById("leaveEndDate").value;
      if (!emp || !type || !start || !end) {
        leaveMessageBox.textContent = "Please fill all required fields.";
        leaveMessageBox.className = "mt-2 text-red-600 text-center";
        leaveMessageBox.classList.remove("hidden");
        return;
      }
      // For API: POST request here instead of push
      leavesData.push({ employee: emp, type, start, end, status: "Pending" });
      addLeaveForm.reset();
      renderLeavesTable();
      leaveMessageBox.textContent = "Leave request submitted!";
      leaveMessageBox.className = "mt-2 text-green-600 text-center";
      leaveMessageBox.classList.remove("hidden");
      setTimeout(() => {
        closeModal();
        leaveMessageBox.classList.add("hidden");
      }, 800);
    });
    document.getElementById("leaveStatusFilter")?.addEventListener("change", renderLeavesTable);
    document.getElementById("leavesTableBody")?.addEventListener("click", function (e) {
      if (e.target.closest(".approve-leave")) {
        const row = e.target.closest("tr");
        const empName = row.children[0].textContent.trim();
        leavesData = leavesData.map((l) =>
          l.employee === empName && l.status === "Pending" ? { ...l, status: "Approved" } : l
        );
        renderLeavesTable();
      }
      if (e.target.closest(".decline-leave")) {
        const row = e.target.closest("tr");
        const empName = row.children[0].textContent.trim();
        leavesData = leavesData.map((l) =>
          l.employee === empName && l.status === "Pending" ? { ...l, status: "Declined" } : l
        );
        renderLeavesTable();
      }
    });
    loadLeavesData();
  }

  // ==================
  // DOCUMENTS PAGE LOGIC (API-ready, robust)
  // ==================
  if (document.body.classList.contains("documents-page")) {
    let documentsData = [];
    function getFileIcon(name) {
      if (name.match(/\.(pdf)$/i)) return '<i class="fas fa-file-pdf mr-2 text-red-500"></i>';
      if (name.match(/\.(jpg|jpeg|png)$/i)) return '<i class="fas fa-file-image mr-2 text-blue-400"></i>';
      return '<i class="fas fa-file-alt mr-2 text-gray-400"></i>';
    }
    function renderDocumentsTable() {
      const tbody = document.getElementById("documentsTableBody");
      const filterType = document.getElementById("docTypeFilter")?.value;
      let filtered = filterType ? documentsData.filter((d) => d.type === filterType) : documentsData;
      tbody.innerHTML = "";
      if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-gray-400">No documents found.</td></tr>`;
        return;
      }
      filtered.forEach((doc) => {
        tbody.innerHTML += `
          <tr>
            <td>${doc.emp}</td>
            <td>${getFileIcon(doc.name)}${doc.name}</td>
            <td>${doc.type}</td>
            <td>${doc.date}</td>
            <td>
              <a href="${doc.url}" target="_blank" class="action-icon" title="View"><i class="fas fa-eye"></i></a>
              <a href="${doc.url}" download class="action-icon" title="Download"><i class="fas fa-download"></i></a>
            </td>
          </tr>
        `;
      });
    }
    function updateDocTypeOptions() {
      const select = document.getElementById("docTypeFilter");
      const uniqueTypes = Array.from(new Set(documentsData.map((d) => d.type)));
      select.innerHTML = `<option value="">All Document Types</option>`;
      uniqueTypes.forEach((t) => {
        select.innerHTML += `<option value="${t}">${t}</option>`;
      });
    }
    async function loadDocumentsData() {
      const DOCS_API_URL = ""; // Your real API endpoint here
      try {
        if (DOCS_API_URL) {
          const res = await fetch(DOCS_API_URL, { credentials: "include" });
          if (!res.ok) throw new Error("Failed to fetch documents");
          documentsData = await res.json();
        } else {
          documentsData = [
            { emp: "John Parker", name: "offer_letter_john_parker.pdf", type: "Offer Letter", date: "2025-07-28", url: "#" },
            { emp: "Sarah Davis", name: "id_proof_sarah_davis.jpeg", type: "ID Proof", date: "2025-07-29", url: "#" }
          ];
        }
      } catch (e) {
        documentsData = [];
        alert("Could not load employee documents.");
      }
      renderDocumentsTable();
      updateDocTypeOptions();
    }
    const uploadDocBtn = document.getElementById("uploadDocBtn");
    const uploadDocumentModal = document.getElementById("uploadDocumentModal");
    const closeUploadModal = document.getElementById("closeUploadModal");
    const cancelUploadBtn = document.getElementById("cancelUploadBtn");
    const uploadDocumentForm = document.getElementById("uploadDocumentForm");
    const docMessageBox = document.getElementById("docMessageBox");
    uploadDocBtn?.addEventListener("click", () => {
      uploadDocumentModal.classList.remove("hidden", "opacity-0");
      uploadDocumentModal.classList.add("flex");
      docMessageBox.classList.add("hidden");
      uploadDocumentForm.reset();
    });
    function closeModal() {
      uploadDocumentModal.classList.add("opacity-0");
      setTimeout(() => {
        uploadDocumentModal.classList.add("hidden");
        uploadDocumentModal.classList.remove("flex");
      }, 200);
    }
    closeUploadModal?.addEventListener("click", closeModal);
    cancelUploadBtn?.addEventListener("click", closeModal);
    uploadDocumentForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const emp = document.getElementById("docEmployee").value.trim();
      const type = document.getElementById("docType").value;
      const fileInput = document.getElementById("docFile");
      if (!emp || !type || !fileInput.files.length) {
        docMessageBox.textContent = "Please fill all required fields.";
        docMessageBox.className = "mt-2 text-red-600 text-center";
        docMessageBox.classList.remove("hidden");
        return;
      }
      const file = fileInput.files[0];
      const docName = file.name;
      const today = new Date();
      const dateStr = today.toISOString().split("T")[0];
      const localUrl = URL.createObjectURL(file);
      documentsData.push({
        emp,
        name: docName,
        type,
        date: dateStr,
        url: localUrl,
      });
      renderDocumentsTable();
      updateDocTypeOptions();
      docMessageBox.textContent = "Document uploaded successfully!";
      docMessageBox.className = "mt-2 text-green-600 text-center";
      docMessageBox.classList.remove("hidden");
      setTimeout(() => {
        closeModal();
        docMessageBox.classList.add("hidden");
      }, 900);
    });
    document.getElementById("docTypeFilter")?.addEventListener("change", renderDocumentsTable);
    loadDocumentsData();
  }

  // ==================
  // REPORTS PAGE LOGIC (button feedback only)
  // ==================
  if (document.body.classList.contains("reports-page")) {
    function fakeDownloadReport(reportName) {
      const reportMsg = document.getElementById("reportMessage");
      reportMsg.textContent = `${reportName} generated and downloaded!`;
      reportMsg.classList.remove("hidden");
      setTimeout(() => reportMsg.classList.add("hidden"), 1600);
    }
    document.getElementById("generateMonthlyAttendance")?.addEventListener("click", () => {
      fakeDownloadReport("Monthly Attendance Report");
    });
    document.getElementById("generateTurnoverReport")?.addEventListener("click", () => {
      fakeDownloadReport("Employee Turnover Report");
    });
    document.getElementById("generateDeptHeadcount")?.addEventListener("click", () => {
      fakeDownloadReport("Department Headcount Report");
    });
  }
});
