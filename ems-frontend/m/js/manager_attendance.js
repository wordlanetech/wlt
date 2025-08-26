// Manager Attendance JavaScript - Real-time functionality
class ManagerAttendanceSystem {
  constructor() {
    this.attendanceData = []
    this.filteredData = []
    this.managerAttendance = {
      isCheckedIn: false,
      checkInTime: null,
      checkOutTime: null,
      workingHours: 0,
    }
    this.currentFilters = {
      date: "",
      department: "all",
      status: "all",
      search: "",
    }
    this.init()
  }

  init() {
    this.setupEventListeners()
    this.loadAttendanceData()
    this.setupRealTimeUpdates()
    this.setupProfileDropdown()
    this.setupManagerAttendance() // Add this line
  }

  setupEventListeners() {
    // Filter event listeners
    document.getElementById("dateFilter").addEventListener("change", (e) => {
      this.currentFilters.date = e.target.value
      this.applyFilters()
    })

    document.getElementById("departmentFilter").addEventListener("change", (e) => {
      this.currentFilters.department = e.target.value
      this.applyFilters()
    })

    document.getElementById("statusFilter").addEventListener("change", (e) => {
      this.currentFilters.status = e.target.value
      this.applyFilters()
    })

    document.getElementById("searchEmployee").addEventListener("input", (e) => {
      this.currentFilters.search = e.target.value.toLowerCase()
      this.applyFilters()
    })

    // Set default date to today
    document.getElementById("dateFilter").value = new Date().toISOString().split("T")[0]
    this.currentFilters.date = document.getElementById("dateFilter").value
  }

  setupProfileDropdown() {
    const profileButton = document.getElementById("profileButton")
    const profileDropdown = document.getElementById("profileDropdown")

    profileButton.addEventListener("click", (e) => {
      e.stopPropagation()
      profileDropdown.classList.toggle("show")
    })

    document.addEventListener("click", (e) => {
      if (!profileButton.contains(e.target)) {
        profileDropdown.classList.remove("show")
      }
    })
  }

  async loadAttendanceData() {
    try {
      document.getElementById("loadingState").style.display = "block"
      document.getElementById("errorState").classList.add("hidden")

      // Simulate API call with realistic data
      await this.simulateAPIDelay(1500)

      this.attendanceData = this.generateSampleAttendanceData()
      this.applyFilters()
      this.updateOverviewCards()

      document.getElementById("loadingState").style.display = "none"
      document.getElementById("attendanceTable").classList.remove("hidden")
    } catch (error) {
      console.error("Error loading attendance data:", error)
      document.getElementById("loadingState").style.display = "none"
      document.getElementById("errorState").classList.remove("hidden")
    }
  }

  generateSampleAttendanceData() {
    const employees = [
      { name: "John Smith", department: "engineering", avatar: "JS" },
      { name: "Sarah Johnson", department: "marketing", avatar: "SJ" },
      { name: "Mike Davis", department: "sales", avatar: "MD" },
      { name: "Emily Brown", department: "hr", avatar: "EB" },
      { name: "David Wilson", department: "engineering", avatar: "DW" },
      { name: "Lisa Anderson", department: "marketing", avatar: "LA" },
      { name: "Tom Miller", department: "sales", avatar: "TM" },
      { name: "Anna Garcia", department: "hr", avatar: "AG" },
      { name: "Chris Lee", department: "engineering", avatar: "CL" },
      { name: "Jessica Taylor", department: "marketing", avatar: "JT" },
    ]

    const statuses = ["present", "absent", "late", "on-leave"]
    const today = new Date().toISOString().split("T")[0]

    return employees.map((employee, index) => {
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const checkIn = status === "present" || status === "late" ? this.generateRandomTime("08:00", "10:00") : null
      const checkOut = checkIn && status === "present" ? this.generateRandomTime("17:00", "19:00") : null
      const hoursWorked = checkIn && checkOut ? this.calculateHours(checkIn, checkOut) : null

      return {
        id: `EMP${String(index + 1).padStart(3, "0")}`,
        name: employee.name,
        department: employee.department,
        avatar: employee.avatar,
        date: today,
        checkIn,
        checkOut,
        hoursWorked,
        status,
        lastUpdated: new Date(),
      }
    })
  }

  generateRandomTime(start, end) {
    const startTime = new Date(`2024-01-01 ${start}`)
    const endTime = new Date(`2024-01-01 ${end}`)
    const randomTime = new Date(startTime.getTime() + Math.random() * (endTime.getTime() - startTime.getTime()))
    return randomTime.toTimeString().slice(0, 5)
  }

  calculateHours(checkIn, checkOut) {
    const start = new Date(`2024-01-01 ${checkIn}`)
    const end = new Date(`2024-01-01 ${checkOut}`)
    const diff = (end - start) / (1000 * 60 * 60)
    return diff.toFixed(1)
  }

  applyFilters() {
    this.filteredData = this.attendanceData.filter((record) => {
      const matchesDate = !this.currentFilters.date || record.date === this.currentFilters.date
      const matchesDepartment =
        this.currentFilters.department === "all" || record.department === this.currentFilters.department
      const matchesStatus = this.currentFilters.status === "all" || record.status === this.currentFilters.status
      const matchesSearch =
        !this.currentFilters.search || record.name.toLowerCase().includes(this.currentFilters.search)

      return matchesDate && matchesDepartment && matchesStatus && matchesSearch
    })

    this.renderAttendanceTable()
  }

  renderAttendanceTable() {
    const tbody = document.getElementById("attendanceTableBody")

    if (this.filteredData.length === 0) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-8 text-gray-500">
                        <i class="fas fa-search text-4xl mb-4 block"></i>
                        No attendance records found matching your criteria.
                    </td>
                </tr>
            `
      return
    }

    tbody.innerHTML = this.filteredData
      .map(
        (record) => `
            <tr class="hover:bg-gray-50 transition-colors duration-200">
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                            ${record.avatar}
                        </div>
                        <div>
                            <div class="font-semibold text-gray-900">${record.name}</div>
                            <div class="text-sm text-gray-500">${record.id}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="capitalize text-gray-700">${record.department}</span>
                </td>
                <td class="px-6 py-4 text-gray-700">${this.formatDate(record.date)}</td>
                <td class="px-6 py-4 text-gray-700">${record.checkIn || "-"}</td>
                <td class="px-6 py-4 text-gray-700">${record.checkOut || "-"}</td>
                <td class="px-6 py-4 text-gray-700">${record.hoursWorked ? record.hoursWorked + "h" : "-"}</td>
                <td class="px-6 py-4">
                    <span class="status-badge-table status-${record.status}">
                        ${this.getStatusIcon(record.status)} ${record.status.replace("-", " ")}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <div class="flex space-x-2">
                        <button onclick="window.attendanceSystem.viewDetails('${record.id}')" class="action-btn" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="window.attendanceSystem.editRecord('${record.id}')" class="action-btn" title="Edit Record">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="window.attendanceSystem.sendReminder('${record.id}')" class="action-btn" title="Send Reminder">
                            <i class="fas fa-bell"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `,
      )
      .join("")
  }

  getStatusIcon(status) {
    const icons = {
      present: '<i class="fas fa-check-circle"></i>',
      absent: '<i class="fas fa-times-circle"></i>',
      late: '<i class="fas fa-clock"></i>',
      "on-leave": '<i class="fas fa-calendar-minus"></i>',
    }
    return icons[status] || ""
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  updateOverviewCards() {
    const present = this.attendanceData.filter((r) => r.status === "present").length
    const absent = this.attendanceData.filter((r) => r.status === "absent").length
    const late = this.attendanceData.filter((r) => r.status === "late").length
    const onLeave = this.attendanceData.filter((r) => r.status === "on-leave").length

    this.animateCounter("presentCount", present)
    this.animateCounter("absentCount", absent)
    this.animateCounter("lateCount", late)
    this.animateCounter("leaveCount", onLeave)
  }

  animateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId)
    const startValue = 0
    const duration = 1000
    const startTime = performance.now()

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const currentValue = Math.floor(startValue + (targetValue - startValue) * progress)

      element.textContent = currentValue

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }

  setupRealTimeUpdates() {
    // Simulate real-time updates every 30 seconds
    setInterval(() => {
      this.updateRandomAttendanceRecord()
    }, 30000)
  }

  updateRandomAttendanceRecord() {
    if (this.attendanceData.length === 0) return

    const randomIndex = Math.floor(Math.random() * this.attendanceData.length)
    const record = this.attendanceData[randomIndex]

    // Simulate status changes
    if (record.status === "absent" && Math.random() > 0.7) {
      record.status = "late"
      record.checkIn = this.generateRandomTime("09:30", "11:00")
      record.lastUpdated = new Date()

      this.showNotification(`${record.name} just checked in (Late)`, "info")
      this.applyFilters()
      this.updateOverviewCards()
    }
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div")
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
      type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500"
    } text-white`
    notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${type === "success" ? "check" : type === "error" ? "times" : "info"}-circle mr-2"></i>
                ${message}
            </div>
        `

    document.body.appendChild(notification)

    setTimeout(() => {
      notification.remove()
    }, 5000)
  }

  async simulateAPIDelay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // Action methods
  viewDetails(employeeId) {
    const employee = this.attendanceData.find((e) => e.id === employeeId)
    if (employee) {
      alert(`Viewing details for ${employee.name}\nStatus: ${employee.status}\nDepartment: ${employee.department}`)
    }
  }

  editRecord(employeeId) {
    const employee = this.attendanceData.find((e) => e.id === employeeId)
    if (employee) {
      const newStatus = prompt(
        `Edit status for ${employee.name}:\nCurrent: ${employee.status}\nEnter new status (present/absent/late/on-leave):`,
      )
      if (newStatus && ["present", "absent", "late", "on-leave"].includes(newStatus)) {
        employee.status = newStatus
        employee.lastUpdated = new Date()
        this.applyFilters()
        this.updateOverviewCards()
        this.showNotification(`Updated ${employee.name}'s status to ${newStatus}`, "success")
      }
    }
  }

  sendReminder(employeeId) {
    const employee = this.attendanceData.find((e) => e.id === employeeId)
    if (employee) {
      this.showNotification(`Reminder sent to ${employee.name}`, "success")
    }
  }

  setupManagerAttendance() {
    // Check if manager is already checked in today
    const today = new Date().toISOString().split("T")[0]
    const savedAttendance = localStorage.getItem(`manager_attendance_${today}`)

    if (savedAttendance) {
      this.managerAttendance = JSON.parse(savedAttendance)
    }

    this.updateManagerAttendanceUI()
  }

  updateManagerAttendanceUI() {
    const punchInBtn = document.getElementById("managerPunchIn")
    const punchOutBtn = document.getElementById("managerPunchOut")
    const statusDisplay = document.getElementById("managerStatus")
    const workingHoursDisplay = document.getElementById("workingHours")

    if (this.managerAttendance.isCheckedIn) {
      punchInBtn.disabled = true
      punchInBtn.innerHTML = '<i class="fas fa-check mr-2"></i> Checked In'
      punchOutBtn.disabled = false
      punchOutBtn.innerHTML = '<i class="fas fa-sign-out-alt mr-2"></i> Punch Out'
      statusDisplay.innerHTML = `<span class="text-green-600"><i class="fas fa-circle mr-1"></i> Checked In at ${this.managerAttendance.checkInTime}</span>`

      // Update working hours in real-time
      this.updateWorkingHours()
    } else if (this.managerAttendance.checkOutTime) {
      punchInBtn.disabled = true
      punchOutBtn.disabled = true
      punchInBtn.innerHTML = '<i class="fas fa-check mr-2"></i> Day Complete'
      punchOutBtn.innerHTML = '<i class="fas fa-check mr-2"></i> Checked Out'
      statusDisplay.innerHTML = `<span class="text-blue-600"><i class="fas fa-circle mr-1"></i> Checked Out at ${this.managerAttendance.checkOutTime}</span>`
      workingHoursDisplay.textContent = `${this.managerAttendance.workingHours} hours`
    } else {
      punchInBtn.disabled = false
      punchOutBtn.disabled = true
      punchInBtn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i> Punch In'
      punchOutBtn.innerHTML = '<i class="fas fa-sign-out-alt mr-2"></i> Punch Out'
      statusDisplay.innerHTML = '<span class="text-gray-600"><i class="fas fa-circle mr-1"></i> Not Checked In</span>'
      workingHoursDisplay.textContent = "0 hours"
    }
  }

  managerPunchIn() {
    const now = new Date()
    const timeString = now.toTimeString().slice(0, 5)

    this.managerAttendance.isCheckedIn = true
    this.managerAttendance.checkInTime = timeString
    this.managerAttendance.checkOutTime = null

    this.saveManagerAttendance()
    this.updateManagerAttendanceUI()
    this.showNotification(`Successfully punched in at ${timeString}`, "success")

    // Start real-time working hours update
    this.startWorkingHoursTimer()
  }

  managerPunchOut() {
    const now = new Date()
    const timeString = now.toTimeString().slice(0, 5)

    this.managerAttendance.isCheckedIn = false
    this.managerAttendance.checkOutTime = timeString

    // Calculate working hours
    const checkIn = new Date(`2024-01-01 ${this.managerAttendance.checkInTime}`)
    const checkOut = new Date(`2024-01-01 ${timeString}`)
    const workingHours = ((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(1)
    this.managerAttendance.workingHours = workingHours

    this.saveManagerAttendance()
    this.updateManagerAttendanceUI()
    this.showNotification(`Successfully punched out at ${timeString}. Total working hours: ${workingHours}`, "success")

    // Stop the timer
    if (this.workingHoursTimer) {
      clearInterval(this.workingHoursTimer)
    }
  }

  updateWorkingHours() {
    if (this.managerAttendance.isCheckedIn && this.managerAttendance.checkInTime) {
      const now = new Date()
      const checkIn = new Date(`2024-01-01 ${this.managerAttendance.checkInTime}`)
      const currentTime = new Date(`2024-01-01 ${now.toTimeString().slice(0, 5)}`)
      const workingHours = ((currentTime - checkIn) / (1000 * 60 * 60)).toFixed(1)

      document.getElementById("workingHours").textContent = `${workingHours} hours`
    }
  }

  startWorkingHoursTimer() {
    this.workingHoursTimer = setInterval(() => {
      this.updateWorkingHours()
    }, 60000) // Update every minute
  }

  saveManagerAttendance() {
    const today = new Date().toISOString().split("T")[0]
    localStorage.setItem(`manager_attendance_${today}`, JSON.stringify(this.managerAttendance))
  }
}

// Global functions for button clicks
window.exportAttendance = () => {
  window.attendanceSystem.showNotification("Exporting attendance report...", "info")
  // Simulate export
  setTimeout(() => {
    window.attendanceSystem.showNotification("Attendance report exported successfully!", "success")
  }, 2000)
}

window.viewAnalytics = () => {
  window.attendanceSystem.showNotification("Opening attendance analytics...", "info")
  // Redirect to analytics page or open modal
}

// Initialize the system when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.attendanceSystem = new ManagerAttendanceSystem()
})
