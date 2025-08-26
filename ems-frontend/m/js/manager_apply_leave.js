// Manager Apply Leave JavaScript - Real-time functionality
class ManagerApplyLeaveSystem {
  constructor() {
    this.leaveTypes = []
    this.managerData = {}
    this.init()
  }

  init() {
    this.setupEventListeners()
    this.setupProfileDropdown()
    this.initializeForm()
  }

  setupEventListeners() {
    const startDateInput = document.getElementById("startDate")
    const endDateInput = document.getElementById("endDate")
    const totalDaysInput = document.getElementById("totalDays")

    // Set minimum date to today
    const today = new Date().toISOString().split("T")[0]
    startDateInput.min = today
    startDateInput.value = today

    // Update end date minimum when start date changes
    startDateInput.addEventListener("change", () => {
      endDateInput.min = startDateInput.value
      if (endDateInput.value && endDateInput.value < startDateInput.value) {
        endDateInput.value = startDateInput.value
      }
      this.calculateTotalDays()
    })

    // Calculate total days when end date changes
    endDateInput.addEventListener("change", () => {
      this.calculateTotalDays()
    })

    // Form submission
    document.getElementById("leaveForm").addEventListener("submit", (e) => {
      e.preventDefault()
      this.handleFormSubmission()
    })
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

  async initializeForm() {
    try {
      this.showLoading(true)

      // Simulate API call to get manager data
      await this.simulateAPIDelay(1000)

      // Set manager data
      this.managerData = {
        managerId: "MGR001",
        name: "Manager",
        department: "Management",
        email: "manager@wordlane.com",
      }

      // Populate manager ID
      document.getElementById("managerId").value = this.managerData.managerId

      // Load leave types with balances
      this.leaveTypes = [
        { type: "Annual Leave", available: 15, total: 20 },
        { type: "Sick Leave", available: 8, total: 10 },
        { type: "Personal Leave", available: 5, total: 5 },
        { type: "Emergency Leave", available: 3, total: 3 },
        { type: "Maternity/Paternity Leave", available: 90, total: 90 },
      ]

      this.populateLeaveTypes()
      this.showLoading(false)
    } catch (error) {
      console.error("Error initializing form:", error)
      this.showError("Failed to load form data. Please try refreshing the page.")
      this.showLoading(false)
    }
  }

  populateLeaveTypes() {
    const leaveTypeSelect = document.getElementById("leaveType")
    leaveTypeSelect.innerHTML = '<option value="">Select Leave Type</option>'

    this.leaveTypes.forEach((leave) => {
      const option = document.createElement("option")
      option.value = leave.type.toLowerCase().replace(/\s+/g, "_")
      option.textContent = `${leave.type} (Available: ${leave.available}/${leave.total} days)`
      leaveTypeSelect.appendChild(option)
    })
  }

  calculateTotalDays() {
    const startDate = document.getElementById("startDate").value
    const endDate = document.getElementById("endDate").value

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const timeDiff = end.getTime() - start.getTime()
      const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1

      if (dayDiff > 0) {
        document.getElementById("totalDays").value = dayDiff
      } else {
        document.getElementById("totalDays").value = ""
      }
    } else {
      document.getElementById("totalDays").value = ""
    }
  }

  async handleFormSubmission() {
    try {
      const submitButton = document.getElementById("submitButton")
      submitButton.disabled = true
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Submitting...'

      // Get form data
      const formData = new FormData(document.getElementById("leaveForm"))
      const leaveData = {
        managerId: formData.get("manager_id"),
        leaveType: formData.get("leave_type"),
        startDate: formData.get("start_date"),
        endDate: formData.get("end_date"),
        totalDays: formData.get("total_days"),
        reason: formData.get("reason"),
        handoverNotes: formData.get("handover_notes"),
        submittedAt: new Date().toISOString(),
        status: "pending",
      }

      // Validate form data
      if (!this.validateFormData(leaveData)) {
        throw new Error("Please fill in all required fields correctly.")
      }

      // Simulate API call
      await this.simulateAPIDelay(2000)

      // Show success message
      this.showSuccess()

      // Redirect after delay
      setTimeout(() => {
        window.location.href = "manager_leaves.html"
      }, 3000)
    } catch (error) {
      console.error("Error submitting leave request:", error)
      this.showError(error.message || "Failed to submit leave request. Please try again.")

      // Re-enable submit button
      const submitButton = document.getElementById("submitButton")
      submitButton.disabled = false
      submitButton.innerHTML = '<i class="fas fa-paper-plane mr-2"></i> Submit Request'
    }
  }

  validateFormData(data) {
    if (!data.managerId || !data.leaveType || !data.startDate || !data.endDate || !data.reason) {
      return false
    }

    if (new Date(data.startDate) > new Date(data.endDate)) {
      this.showError("End date cannot be before start date.")
      return false
    }

    if (Number.parseInt(data.totalDays) <= 0) {
      this.showError("Total days must be greater than 0.")
      return false
    }

    return true
  }

  showLoading(show) {
    const loadingState = document.getElementById("loadingState")
    const leaveForm = document.getElementById("leaveForm")

    if (show) {
      loadingState.classList.remove("hidden")
      leaveForm.classList.add("hidden")
    } else {
      loadingState.classList.add("hidden")
      leaveForm.classList.remove("hidden")
    }
  }

  showError(message) {
    const errorState = document.getElementById("errorState")
    const errorMessage = document.getElementById("errorMessage")
    const successState = document.getElementById("successState")

    errorMessage.textContent = message
    errorState.classList.remove("hidden")
    successState.classList.add("hidden")

    // Auto-hide after 5 seconds
    setTimeout(() => {
      errorState.classList.add("hidden")
    }, 5000)
  }

  showSuccess() {
    const successState = document.getElementById("successState")
    const errorState = document.getElementById("errorState")

    successState.classList.remove("hidden")
    errorState.classList.add("hidden")

    // Disable form inputs
    const formElements = document.getElementById("leaveForm").elements
    Array.from(formElements).forEach((element) => {
      element.disabled = true
    })
  }

  async simulateAPIDelay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// Initialize the system when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.managerApplyLeaveSystem = new ManagerApplyLeaveSystem()
})
