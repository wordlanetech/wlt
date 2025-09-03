// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", function () {
  // Profile Dropdown Toggle
  const profileButton = document.getElementById("profileButton");
  const profileDropdown = document.getElementById("profileDropdown");

  profileButton.addEventListener("click", function (e) {
    e.stopPropagation();
    profileDropdown.classList.toggle("hidden");
  });

  // Hide dropdown when clicking outside
  document.addEventListener("click", function (e) {
    if (!profileDropdown.contains(e.target) && !profileButton.contains(e.target)) {
      profileDropdown.classList.add("hidden");
    }
  });

  // Navbar Active Link Highlighting
  const navLinks = document.querySelectorAll(".nav-link");
  const currentPage = window.location.pathname.split("/").pop();

  navLinks.forEach(link => {
    const hrefPage = link.getAttribute("href");
    if (hrefPage === currentPage) {
      link.classList.add("bg-[#1F446A]", "text-white");
      link.classList.remove("text-gray-700", "hover:bg-gray-200");
    } else {
      link.classList.remove("bg-[#1F446A]", "text-white");
      link.classList.add("text-gray-700", "hover:bg-gray-200");
    }
  });

  // 🔥 Call the API to load real dashboard data
  fetchDashboardData();
});

// 📦 Fetch and inject real-time dashboard data
async function fetchDashboardData() {
  try {
    const response = await fetch("https://dashboard.wordlanetech.com/api/dashboard-stats");
    const data = await response.json();

    // Update dashboard numbers
    document.querySelector(".dashboard-card:nth-child(1) .number").textContent = data.totalEmployees;
    document.querySelector(".dashboard-card:nth-child(2) .number").textContent = data.newHires;
    document.querySelector(".dashboard-card:nth-child(3) .number").textContent = data.pendingLeaves;
    document.querySelector(".dashboard-card:nth-child(4) .number").textContent = data.activeProjects;

    // Populate recent activities
    const activityContainer = document.querySelector(".activity-card .space-y-2");
    activityContainer.innerHTML = ""; // Clear previous

    data.recentActivities.forEach(activity => {
      const activityElement = document.createElement("div");
      activityElement.className = "activity-item hover:translate-x-2 transition-all duration-200";
      activityElement.innerHTML = `
        <div class="activity-icon icon-blue"><i class="fas ${activity.icon}"></i></div>
        <div class="activity-content">
          <h4>${activity.description}</h4>
          <p class="time">${activity.time}</p>
        </div>
      `;
      activityContainer.appendChild(activityElement);
    });
  } catch (error) {
    console.error("Error loading dashboard data:", error);
  }
}
