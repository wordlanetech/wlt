// Manager Documents JavaScript - Real-time functionality
class ManagerDocumentsSystem {
  constructor() {
    this.documentsData = []
    this.filteredData = []
    this.currentFilters = {
      type: "all",
      department: "all",
      date: "all",
      search: "",
    }
    this.init()
  }

  init() {
    this.setupEventListeners()
    this.loadDocumentsData()
    this.setupRealTimeUpdates()
    this.setupProfileDropdown()
    this.setupUploadModal()
  }

  setupEventListeners() {
    // Filter event listeners
    document.getElementById("typeFilter").addEventListener("change", (e) => {
      this.currentFilters.type = e.target.value
      this.applyFilters()
    })

    document.getElementById("departmentFilter").addEventListener("change", (e) => {
      this.currentFilters.department = e.target.value
      this.applyFilters()
    })

    document.getElementById("dateFilter").addEventListener("change", (e) => {
      this.currentFilters.date = e.target.value
      this.applyFilters()
    })

    document.getElementById("searchDocument").addEventListener("input", (e) => {
      this.currentFilters.search = e.target.value.toLowerCase()
      this.applyFilters()
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

  setupUploadModal() {
    const modal = document.getElementById("uploadModal")
    const cancelBtn = document.getElementById("cancelUpload")
    const uploadForm = document.getElementById("uploadForm")

    cancelBtn.addEventListener("click", () => {
      this.hideUploadModal()
    })

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        this.hideUploadModal()
      }
    })

    uploadForm.addEventListener("submit", (e) => {
      e.preventDefault()
      this.handleFileUpload()
    })
  }

  async loadDocumentsData() {
    try {
      document.getElementById("loadingState").classList.remove("hidden")
      document.getElementById("errorState").classList.add("hidden")

      await this.simulateAPIDelay(1000)

      this.documentsData = this.generateSampleDocumentsData()
      this.applyFilters()
      this.updateOverviewCards()

      document.getElementById("loadingState").classList.add("hidden")
    } catch (error) {
      console.error("Error loading documents data:", error)
      document.getElementById("loadingState").classList.add("hidden")
      document.getElementById("errorState").classList.remove("hidden")
    }
  }

  generateSampleDocumentsData() {
    const documents = [
      {
        title: "Employee Handbook 2024",
        type: "policy",
        department: "hr",
        description: "Updated employee handbook with new policies and procedures",
        fileSize: "2.4 MB",
        uploadedBy: "HR Manager",
        uploadDate: "2024-01-15",
      },
      {
        title: "Q4 Sales Report",
        type: "report",
        department: "sales",
        description: "Quarterly sales performance analysis and metrics",
        fileSize: "1.8 MB",
        uploadedBy: "Sales Director",
        uploadDate: "2024-01-10",
      },
      {
        title: "Software License Agreement",
        type: "contract",
        department: "engineering",
        description: "Annual software licensing contract renewal",
        fileSize: "856 KB",
        uploadedBy: "IT Manager",
        uploadDate: "2024-01-08",
      },
      {
        title: "API Documentation v2.1",
        type: "manual",
        department: "engineering",
        description: "Complete API reference and integration guide",
        fileSize: "3.2 MB",
        uploadedBy: "Lead Developer",
        uploadDate: "2024-01-05",
      },
      {
        title: "Marketing Strategy 2024",
        type: "presentation",
        department: "marketing",
        description: "Annual marketing strategy and campaign plans",
        fileSize: "4.1 MB",
        uploadedBy: "Marketing Manager",
        uploadDate: "2024-01-03",
      },
      {
        title: "Security Protocols",
        type: "policy",
        department: "engineering",
        description: "Updated security guidelines and best practices",
        fileSize: "1.2 MB",
        uploadedBy: "Security Officer",
        uploadDate: "2024-01-02",
      },
      {
        title: "Training Materials",
        type: "manual",
        department: "hr",
        description: "New employee onboarding and training resources",
        fileSize: "5.7 MB",
        uploadedBy: "Training Coordinator",
        uploadDate: "2023-12-28",
      },
      {
        title: "Budget Proposal 2024",
        type: "report",
        department: "hr",
        description: "Annual budget allocation and financial planning",
        fileSize: "2.9 MB",
        uploadedBy: "Finance Manager",
        uploadDate: "2023-12-25",
      },
    ]

    return documents.map((doc, index) => ({
      id: `DOC${String(index + 1).padStart(3, "0")}`,
      ...doc,
      downloads: Math.floor(Math.random() * 50) + 1,
      lastAccessed: this.getRandomRecentDate(),
      isShared: Math.random() > 0.5,
      version: `v${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}`,
      tags: this.generateRandomTags(),
      lastUpdated: new Date(),
    }))
  }

  getRandomRecentDate() {
    const today = new Date()
    const pastDate = new Date(today)
    pastDate.setDate(today.getDate() - Math.floor(Math.random() * 30))
    return pastDate.toISOString().split("T")[0]
  }

  generateRandomTags() {
    const allTags = ["important", "confidential", "public", "draft", "final", "archived"]
    const numTags = Math.floor(Math.random() * 3) + 1
    const shuffled = allTags.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, numTags)
  }

  applyFilters() {
    this.filteredData = this.documentsData.filter((doc) => {
      const matchesType = this.currentFilters.type === "all" || doc.type === this.currentFilters.type
      const matchesDepartment =
        this.currentFilters.department === "all" || doc.department === this.currentFilters.department
      const matchesDate =
        this.currentFilters.date === "all" || this.matchesDateFilter(doc.uploadDate, this.currentFilters.date)
      const matchesSearch =
        !this.currentFilters.search ||
        doc.title.toLowerCase().includes(this.currentFilters.search) ||
        doc.description.toLowerCase().includes(this.currentFilters.search)

      return matchesType && matchesDepartment && matchesDate && matchesSearch
    })

    this.renderDocumentsGrid()
  }

  matchesDateFilter(uploadDate, filter) {
    const today = new Date()
    const docDate = new Date(uploadDate)

    switch (filter) {
      case "today":
        return docDate.toDateString() === today.toDateString()
      case "week":
        const weekAgo = new Date(today)
        weekAgo.setDate(today.getDate() - 7)
        return docDate >= weekAgo
      case "month":
        const monthAgo = new Date(today)
        monthAgo.setMonth(today.getMonth() - 1)
        return docDate >= monthAgo
      default:
        return true
    }
  }

  renderDocumentsGrid() {
    const grid = document.getElementById("documentsGrid")

    if (this.filteredData.length === 0) {
      grid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-file-times text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-500 mb-2">No Documents Found</h3>
                    <p class="text-gray-400">No documents match your current filters.</p>
                </div>
            `
      return
    }

    grid.innerHTML = this.filteredData
      .map(
        (doc) => `
            <div class="document-card">
                <div class="document-id">${doc.id}</div>
                <h3>${doc.title}</h3>
                <p>${doc.description}</p>
                
                <div class="type-badge type-${doc.type}">
                    ${this.getTypeIcon(doc.type)} ${doc.type.charAt(0).toUpperCase() + doc.type.slice(1)}
                </div>
                
                <div class="document-info">
                    <div class="info-item">
                        <span class="info-label">Department</span>
                        <span class="info-value">${doc.department.charAt(0).toUpperCase() + doc.department.slice(1)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Uploaded</span>
                        <span class="info-value">${this.formatDate(doc.uploadDate)}</span>
                    </div>
                </div>
                
                <div class="document-info">
                    <div class="info-item">
                        <span class="info-label">Version</span>
                        <span class="info-value">${doc.version}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Downloads</span>
                        <span class="info-value">${doc.downloads}</span>
                    </div>
                </div>
                
                <div class="card-footer">
                    <span class="file-size">${doc.fileSize}</span>
                    <div class="document-actions">
                        <button onclick="window.documentsSystem.downloadDocument('${doc.id}')" class="action-btn" title="Download">
                            <i class="fas fa-download"></i>
                        </button>
                        <button onclick="window.documentsSystem.shareDocument('${doc.id}')" class="action-btn" title="Share">
                            <i class="fas fa-share-alt"></i>
                        </button>
                        <button onclick="window.documentsSystem.editDocument('${doc.id}')" class="action-btn" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="window.documentsSystem.deleteDocument('${doc.id}')" class="action-btn" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `,
      )
      .join("")
  }

  getTypeIcon(type) {
    const icons = {
      policy: '<i class="fas fa-shield-alt"></i>',
      report: '<i class="fas fa-chart-bar"></i>',
      contract: '<i class="fas fa-file-contract"></i>',
      manual: '<i class="fas fa-book"></i>',
      presentation: '<i class="fas fa-presentation"></i>',
      other: '<i class="fas fa-file"></i>',
    }
    return icons[type] || icons.other
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  updateOverviewCards() {
    const totalDocs = this.documentsData.length
    const recentUploads = this.documentsData.filter((doc) => {
      const uploadDate = new Date(doc.uploadDate)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return uploadDate >= weekAgo
    }).length
    const sharedDocs = this.documentsData.filter((doc) => doc.isShared).length
    const storageUsed = this.calculateTotalStorage()

    this.animateCounter("totalDocs", totalDocs)
    this.animateCounter("recentUploads", recentUploads)
    this.animateCounter("sharedDocs", sharedDocs)
    document.getElementById("storageUsed").textContent = storageUsed
  }

  calculateTotalStorage() {
    const totalBytes = this.documentsData.reduce((total, doc) => {
      const size = Number.parseFloat(doc.fileSize)
      const unit = doc.fileSize.includes("MB") ? 1024 * 1024 : 1024
      return total + size * unit
    }, 0)

    const totalGB = (totalBytes / (1024 * 1024 * 1024)).toFixed(1)
    return `${totalGB}GB`
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
    setInterval(() => {
      this.simulateDocumentActivity()
    }, 60000)
  }

  simulateDocumentActivity() {
    if (Math.random() > 0.7) {
      const randomDoc = this.documentsData[Math.floor(Math.random() * this.documentsData.length)]
      randomDoc.downloads += 1
      randomDoc.lastAccessed = new Date().toISOString().split("T")[0]

      this.showNotification(`${randomDoc.title} was downloaded`, "info")
      this.updateOverviewCards()
    }
  }

  showUploadModal() {
    document.getElementById("uploadModal").classList.remove("hidden")
  }

  hideUploadModal() {
    document.getElementById("uploadModal").classList.add("hidden")
    document.getElementById("uploadForm").reset()
  }

  handleFileUpload() {
    const formData = new FormData(document.getElementById("uploadForm"))
    const file = formData.get("file")
    const title = formData.get("title")
    const type = formData.get("type")
    const description = formData.get("description")

    if (!file || !title || !type) {
      this.showNotification("Please fill in all required fields", "error")
      return
    }

    // Simulate upload process
    this.showNotification("Uploading document...", "info")

    setTimeout(() => {
      const newDoc = {
        id: `DOC${String(this.documentsData.length + 1).padStart(3, "0")}`,
        title,
        type,
        department: "hr", // Default to current user's department
        description: description || "No description provided",
        fileSize: this.formatFileSize(file.size),
        uploadedBy: "Manager",
        uploadDate: new Date().toISOString().split("T")[0],
        downloads: 0,
        lastAccessed: new Date().toISOString().split("T")[0],
        isShared: false,
        version: "v1.0",
        tags: ["new"],
        lastUpdated: new Date(),
      }

      this.documentsData.unshift(newDoc)
      this.applyFilters()
      this.updateOverviewCards()
      this.hideUploadModal()
      this.showNotification("Document uploaded successfully!", "success")
    }, 2000)
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
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
  downloadDocument(docId) {
    const doc = this.documentsData.find((d) => d.id === docId)
    if (doc) {
      doc.downloads += 1
      this.showNotification(`Downloading ${doc.title}...`, "info")
      setTimeout(() => {
        this.showNotification(`${doc.title} downloaded successfully!`, "success")
      }, 1500)
    }
  }

  shareDocument(docId) {
    const doc = this.documentsData.find((d) => d.id === docId)
    if (doc) {
      doc.isShared = true
      this.showNotification(`${doc.title} shared successfully!`, "success")
      this.updateOverviewCards()
    }
  }

  editDocument(docId) {
    const doc = this.documentsData.find((d) => d.id === docId)
    if (doc) {
      const newTitle = prompt(`Edit document title:\nCurrent: ${doc.title}`, doc.title)
      if (newTitle && newTitle !== doc.title) {
        doc.title = newTitle
        doc.lastUpdated = new Date()
        this.applyFilters()
        this.showNotification("Document updated successfully!", "success")
      }
    }
  }

  deleteDocument(docId) {
    const doc = this.documentsData.find((d) => d.id === docId)
    if (doc && confirm(`Are you sure you want to delete "${doc.title}"?`)) {
      this.documentsData = this.documentsData.filter((d) => d.id !== docId)
      this.applyFilters()
      this.updateOverviewCards()
      this.showNotification("Document deleted successfully!", "success")
    }
  }
}

// Global functions
window.uploadDocument = () => {
  window.documentsSystem.showUploadModal()
}

window.createFolder = () => {
  const folderName = prompt("Enter folder name:")
  if (folderName) {
    window.documentsSystem.showNotification(`Folder "${folderName}" created successfully!`, "success")
  }
}

// Update the global functions to make export button functional
window.exportDocumentReport = () => {
  window.documentsSystem.showNotification("Generating document report...", "info")

  setTimeout(() => {
    // Create and download a sample CSV report
    const csvContent = generateDocumentReportCSV()
    downloadCSV(csvContent, "document_report.csv")
    window.documentsSystem.showNotification("Document report downloaded successfully!", "success")
  }, 2000)
}

// Initialize the system
document.addEventListener("DOMContentLoaded", () => {
  window.documentsSystem = new ManagerDocumentsSystem()
})

// Add these helper functions at the end of the file
function generateDocumentReportCSV() {
  const headers = ["Document ID", "Title", "Type", "Department", "Upload Date", "File Size", "Downloads", "Uploaded By"]
  const csvRows = [headers.join(",")]

  window.documentsSystem.documentsData.forEach((doc) => {
    const row = [
      doc.id,
      `"${doc.title}"`,
      doc.type,
      doc.department,
      doc.uploadDate,
      doc.fileSize,
      doc.downloads,
      `"${doc.uploadedBy}"`,
    ]
    csvRows.push(row.join(","))
  })

  return csvRows.join("\n")
}

function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: "text/csv" })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.setAttribute("hidden", "")
  a.setAttribute("href", url)
  a.setAttribute("download", filename)
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
