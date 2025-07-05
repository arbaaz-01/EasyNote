/**
 * NoteMaster Popup Script
 * Handles the main popup interface functionality including note management,
 * search, filtering, and rich text editing capabilities.
 */


class NoteMaster {
  constructor() {
    this.notes = []
    this.currentNote = null
    this.isEditing = false
    this.settings = {}

    this.init()
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      console.log("NoteMaster initializing...")
      await this.loadSettings()
      await this.loadNotes()
      this.setupEventListeners()
      this.setupKeyboardShortcuts()
      this.applyTheme()
      this.renderNotes()
      this.updateSyncStatus()
      console.log("NoteMaster initialized successfully")
    } catch (error) {
      console.error("Error initializing NoteMaster:", error)
    }
  }

  /**
   * Load user settings from Chrome storage
   */
  async loadSettings() {
    try {
      console.log("Loading settings...")
      const result = await chrome.storage.sync.get(["settings"])
      this.settings = result.settings || {
        theme: "light",
        fontSize: 14,
        fontFamily: "system",
        autoSave: true,
        exportFormat: "json",
      }
      console.log("Settings loaded:", this.settings)
    } catch (error) {
      console.error("Error loading settings:", error)
      // Use default settings if Chrome storage fails
      this.settings = {
        theme: "light",
        fontSize: 14,
        fontFamily: "system",
        autoSave: true,
        exportFormat: "json",
      }
    }
  }

  /**
   * Load notes from Chrome storage
   */
  async loadNotes() {
    try {
      console.log("Loading notes...")
      const result = await chrome.storage.local.get(["notes"])
      this.notes = result.notes || []
      console.log("Notes loaded:", this.notes.length, "notes")

      // Sort notes by last modified date
      this.notes.sort((a, b) => new Date(b.modified) - new Date(a.modified))
    } catch (error) {
      console.error("Error loading notes:", error)
      this.notes = []
    }
  }

  /**
   * Save notes to Chrome storage (local only)
   */
  async saveNotes() {
    try {
      await chrome.storage.local.set({ notes: this.notes })
      console.log("Notes saved locally")
    } catch (error) {
      console.error("Error saving notes:", error)
    }
  }

  /**
   * Setup event listeners for UI interactions
   */
  setupEventListeners() {
    console.log("Setting up event listeners...")

    // New note button
    const newNoteBtn = document.getElementById("newNoteBtn")
    if (newNoteBtn) {
      newNoteBtn.addEventListener("click", () => {
        console.log("New note button clicked")
        this.createNewNote()
      })
    }

    // Search functionality
    const searchInput = document.getElementById("searchInput")
    const searchBtn = document.getElementById("searchBtn")

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchNotes(e.target.value)
      })
    }

    if (searchBtn) {
      searchBtn.addEventListener("click", () => {
        this.searchNotes(searchInput.value)
      })
    }

    // Sort
    const sortBy = document.getElementById("sortBy")
    if (sortBy) {
      sortBy.addEventListener("change", (e) => {
        this.sortNotes(e.target.value)
      })
    }

    // Settings and export buttons
    const settingsBtn = document.getElementById("settingsBtn")
    const exportBtn = document.getElementById("exportBtn")

    if (settingsBtn) {
      settingsBtn.addEventListener("click", () => {
        chrome.runtime.openOptionsPage()
      })
    }

    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        this.exportAllNotes()
      })
    }

    // Modal controls
    const closeModalBtn = document.getElementById("closeModalBtn")
    const saveNoteBtn = document.getElementById("saveNoteBtn")

    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", () => {
        this.closeNoteModal()
      })
    }

    if (saveNoteBtn) {
      saveNoteBtn.addEventListener("click", () => {
        this.saveCurrentNote()
      })
    }

    // Rich text toolbar
    this.setupRichTextToolbar()

    // Auto-save functionality
    if (this.settings.autoSave) {
      this.setupAutoSave()
    }

    // Click outside modal to close
    const noteModal = document.getElementById("noteModal")
    if (noteModal) {
      noteModal.addEventListener("click", (e) => {
        if (e.target.id === "noteModal") {
          this.closeNoteModal()
        }
      })
    }

    console.log("Event listeners setup complete")
  }

  /**
   * Setup keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      // Ctrl+S to save note
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault()
        if (this.isEditing) {
          this.saveCurrentNote()
        }
      }

      // Escape to close modal
      if (e.key === "Escape" && this.isEditing) {
        this.closeNoteModal()
      }

      // Rich text shortcuts in editor
      if (this.isEditing) {
        this.handleRichTextShortcuts(e)
      }
    })
  }

  /**
   * Handle rich text formatting shortcuts
   */
  handleRichTextShortcuts(e) {
    if (e.ctrlKey) {
      switch (e.key) {
        case "b":
          e.preventDefault()
          this.formatText("bold")
          break
        case "i":
          e.preventDefault()
          this.formatText("italic")
          break
        case "u":
          e.preventDefault()
          this.formatText("underline")
          break
      }
    }
  }

  /**
   * Setup rich text toolbar functionality
   */
  setupRichTextToolbar() {
    const toolbar = {
      bold: document.getElementById("boldBtn"),
      italic: document.getElementById("italicBtn"),
      underline: document.getElementById("underlineBtn"),
      bulletList: document.getElementById("bulletListBtn"),
      numberedList: document.getElementById("numberedListBtn"),
    }

    Object.entries(toolbar).forEach(([command, button]) => {
      if (button) {
        button.addEventListener("click", (e) => {
          e.preventDefault()
          this.formatText(
            command === "bulletList"
              ? "insertUnorderedList"
              : command === "numberedList"
                ? "insertOrderedList"
                : command,
          )
        })
      }
    })

    // Update toolbar state on selection change
    const noteEditor = document.getElementById("noteEditor")
    if (noteEditor) {
      noteEditor.addEventListener("selectionchange", () => {
        this.updateToolbarState()
      })
    }
  }

  /**
   * Format selected text in the editor
   */
  formatText(command) {
    document.execCommand(command, false, null)
    this.updateToolbarState()
  }

  /**
   * Update toolbar button states based on current selection
   */
  updateToolbarState() {
    const commands = ["bold", "italic", "underline"]
    commands.forEach((command) => {
      const button = document.getElementById(`${command}Btn`)
      if (button) {
        const isActive = document.queryCommandState(command)
        button.classList.toggle("active", isActive)
      }
    })
  }

  /**
   * Setup auto-save functionality
   */
  setupAutoSave() {
    let autoSaveTimeout
    const editor = document.getElementById("noteEditor")
    const titleInput = document.getElementById("noteTitle")

    const autoSave = () => {
      clearTimeout(autoSaveTimeout)
      autoSaveTimeout = setTimeout(() => {
        if (this.isEditing && this.currentNote) {
          this.saveCurrentNote(false) // Silent save
        }
      }, 2000) // Auto-save after 2 seconds of inactivity
    }

    if (editor) editor.addEventListener("input", autoSave)
    if (titleInput) titleInput.addEventListener("input", autoSave)
  }

  /**
   * Apply theme based on settings
   */
  applyTheme() {
    const theme =
      this.settings.theme === "auto"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : this.settings.theme

    document.documentElement.setAttribute("data-theme", theme)
    document.body.style.fontSize = `${this.settings.fontSize}px`

    if (this.settings.fontFamily !== "system") {
      document.body.style.fontFamily = this.settings.fontFamily
    }
  }

  /**
   * Create a new note
   */
  createNewNote() {
    console.log("Creating new note...")
    const newNote = {
      id: this.generateId(),
      title: "",
      content: "",
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    }

    this.currentNote = newNote
    this.openNoteModal(newNote)
  }

  /**
   * Open note in modal for editing
   */
  openNoteModal(note) {
    console.log("Opening note modal for:", note)
    this.currentNote = note
    this.isEditing = true

    // Populate modal fields
    const noteTitle = document.getElementById("noteTitle")
    const noteEditor = document.getElementById("noteEditor")

    if (noteTitle) noteTitle.value = note.title || ""
    if (noteEditor) noteEditor.innerHTML = note.content || ""

    // Show modal
    const modal = document.getElementById("noteModal")
    if (modal) {
      modal.style.display = "flex"
      console.log("Modal should be visible now")
    }

    // Focus on title if new note, otherwise content
    if (!note.title && noteTitle) {
      noteTitle.focus()
    } else if (noteEditor) {
      noteEditor.focus()
    }
  }

  /**
   * Close note modal
   */
  closeNoteModal() {
    if (this.isEditing && this.hasUnsavedChanges()) {
      if (confirm("You have unsaved changes. Do you want to save before closing?")) {
        this.saveCurrentNote()
        return
      }
    }

    const modal = document.getElementById("noteModal")
    if (modal) {
      modal.style.display = "none"
    }
    this.isEditing = false
    this.currentNote = null
  }

  /**
   * Check if there are unsaved changes
   */
  hasUnsavedChanges() {
    if (!this.currentNote) return false

    const titleInput = document.getElementById("noteTitle")
    const editorInput = document.getElementById("noteEditor")

    if (!titleInput || !editorInput) return false

    const title = titleInput.value
    const content = editorInput.innerHTML

    return title !== (this.currentNote.title || "") || content !== (this.currentNote.content || "")
  }

  /**
   * Save the current note
   */
  async saveCurrentNote(showFeedback = true) {
    if (!this.currentNote) return

    const titleInput = document.getElementById("noteTitle")
    const editorInput = document.getElementById("noteEditor")

    if (!titleInput || !editorInput) return

    const title = titleInput.value.trim()
    const content = editorInput.innerHTML.trim()

    // Don't save empty notes
    if (!title && !content) {
      if (showFeedback) {
        alert("Please add a title or content to save the note.")
      }
      return
    }

    // Update note data
    this.currentNote.title = title || "Untitled Note"
    this.currentNote.content = content
    this.currentNote.modified = new Date().toISOString()

    // Add to notes array if it's a new note
    const existingIndex = this.notes.findIndex((n) => n.id === this.currentNote.id)
    if (existingIndex === -1) {
      this.notes.unshift(this.currentNote)
    } else {
      this.notes[existingIndex] = this.currentNote
    }

    // Save to storage
    await this.saveNotes()

    // Update UI
    this.renderNotes()

    if (showFeedback) {
      this.showSaveStatus("Note saved successfully!")
      this.closeNoteModal()
    }
  }

  /**
   * Copy note content to clipboard
   */
  async copyNote(noteId) {
    const note = this.notes.find((n) => n.id === noteId)
    if (!note) return

    const content = `${note.title}\n\n${this.stripHtml(note.content)}`

    try {
      await navigator.clipboard.writeText(content)
      this.showSaveStatus("Note copied to clipboard!")
    } catch (error) {
      console.error("Failed to copy note:", error)
      this.showSaveStatus("Failed to copy note", "error")
    }
  }

  /**
   * Download individual note as .txt file
   */
  downloadNote(noteId) {
    const note = this.notes.find((n) => n.id === noteId)
    if (!note) return

    const content = `${note.title}\n\nCreated: ${this.formatDate(note.created)}\nModified: ${this.formatDate(note.modified)}\n\n${this.stripHtml(note.content)}`
    const filename = `${note.title || "Untitled Note"}.txt`

    this.downloadFile(content, filename)
    this.showSaveStatus("Note downloaded!")
  }

  /**
   * Delete a note
   */
  async deleteNote(noteId) {
    if (confirm("Are you sure you want to delete this note?")) {
      this.notes = this.notes.filter((note) => note.id !== noteId)
      await this.saveNotes()
      this.renderNotes()
      this.showSaveStatus("Note deleted")
    }
  }

  /**
   * Search notes by title and content
   */
  searchNotes(query) {
    const searchTerm = query.toLowerCase().trim()

    if (!searchTerm) {
      this.renderNotes()
      return
    }

    const filteredNotes = this.notes.filter((note) => {
      return note.title.toLowerCase().includes(searchTerm) || note.content.toLowerCase().includes(searchTerm)
    })

    this.renderNotes(filteredNotes)
  }

  /**
   * Sort notes by different criteria
   */
  sortNotes(sortBy) {
    const sortedNotes = [...this.notes]

    switch (sortBy) {
      case "created":
        sortedNotes.sort((a, b) => new Date(b.created) - new Date(a.created))
        break
      case "title":
        sortedNotes.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "modified":
      default:
        sortedNotes.sort((a, b) => new Date(b.modified) - new Date(a.modified))
        break
    }

    this.renderNotes(sortedNotes)
  }

  /**
   * Render notes list in the UI
   */
  renderNotes(notesToRender = this.notes) {
    const notesList = document.getElementById("notesList")
    const emptyState = document.getElementById("emptyState")

    if (!notesList || !emptyState) return

    if (notesToRender.length === 0) {
      notesList.style.display = "none"
      emptyState.style.display = "flex"
      return
    }

    notesList.style.display = "block"
    emptyState.style.display = "none"

    notesList.innerHTML = notesToRender.map((note) => this.createNoteElement(note)).join("")

    // Add event listeners to note items and action buttons
    notesList.querySelectorAll(".note-item").forEach((item) => {
      const noteId = item.dataset.noteId
      const note = this.notes.find((n) => n.id === noteId)

      // Click on note to edit (but not on action buttons)
      item.addEventListener("click", (e) => {
        if (!e.target.closest(".note-actions")) {
          this.openNoteModal(note)
        }
      })

      // Action buttons
      const copyBtn = item.querySelector(".copy-btn")
      const downloadBtn = item.querySelector(".download-btn")
      const deleteBtn = item.querySelector(".delete-btn")

      if (copyBtn) {
        copyBtn.addEventListener("click", (e) => {
          e.stopPropagation()
          this.copyNote(noteId)
        })
      }

      if (downloadBtn) {
        downloadBtn.addEventListener("click", (e) => {
          e.stopPropagation()
          this.downloadNote(noteId)
        })
      }

      if (deleteBtn) {
        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation()
          this.deleteNote(noteId)
        })
      }
    })
  }

  /**
   * Create HTML element for a note
   */
  createNoteElement(note) {
    const preview = this.stripHtml(note.content).substring(0, 100)
    const formattedDate = this.formatDate(note.modified)

    return `
      <div class="note-item" data-note-id="${note.id}">
        <div class="note-header">
          <div class="note-title">${this.escapeHtml(note.title || "Untitled Note")}</div>
          <div class="note-date">${formattedDate}</div>
        </div>
        ${preview ? `<div class="note-preview">${this.escapeHtml(preview)}${note.content.length > 100 ? "..." : ""}</div>` : ""}
        <div class="note-actions">
          <button class="note-action-btn copy copy-btn" title="Copy Note">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <button class="note-action-btn download download-btn" title="Download as TXT">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7,10 12,15 17,10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>
          <button class="note-action-btn delete delete-btn" title="Delete Note">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-2"></path>
            </svg>
          </button>
        </div>
      </div>
    `
  }

  /**
   * Export all notes in various formats
   */
  async exportAllNotes() {
    const format = this.settings.exportFormat || "json"
    let content = ""
    let filename = `notes_${new Date().toISOString().split("T")[0]}`

    switch (format) {
      case "json":
        content = JSON.stringify(this.notes, null, 2)
        filename += ".json"
        break
      case "txt":
        content = this.notes
          .map((note) => {
            return `Title: ${note.title}\nDate: ${note.modified}\n\n${this.stripHtml(note.content)}\n\n${"=".repeat(50)}\n\n`
          })
          .join("")
        filename += ".txt"
        break
      case "md":
        content = this.notes
          .map((note) => {
            return `# ${note.title}\n\n*Modified: ${this.formatDate(note.modified)}*\n\n${this.htmlToMarkdown(note.content)}\n\n---\n\n`
          })
          .join("")
        filename += ".md"
        break
      case "html":
        content = `
<!DOCTYPE html>
<html>
<head>
    <title>NoteMaster Export</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .note { margin-bottom: 40px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
        .note-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .note-meta { color: #666; font-size: 14px; margin-bottom: 15px; }
        .note-content { line-height: 1.6; }
    </style>
</head>
<body>
    <h1>NoteMaster Export</h1>
    <p>Exported on ${new Date().toLocaleDateString()}</p>
    ${this.notes
      .map(
        (note) => `
        <div class="note">
            <div class="note-title">${this.escapeHtml(note.title)}</div>
            <div class="note-meta">Modified: ${this.formatDate(note.modified)}</div>
            <div class="note-content">${note.content}</div>
        </div>
    `,
      )
      .join("")}
</body>
</html>`
        filename += ".html"
        break
    }

    this.downloadFile(content, filename)
    this.showSaveStatus("All notes exported!")
  }

  /**
   * Download file with given content
   */
  downloadFile(content, filename) {
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /**
   * Update sync status indicator (local storage only)
   */
  updateSyncStatus() {
    const indicator = document.getElementById("syncIndicator")
    const text = document.getElementById("syncText")

    if (indicator && text) {
      indicator.className = "sync-indicator online"
      text.textContent = "Local Storage"
    }
  }

  /**
   * Show save status message
   */
  showSaveStatus(message, type = "success") {
    // Create temporary status element
    const status = document.createElement("div")
    status.textContent = message
    const bgColor = type === "error" ? "var(--error-color)" : "var(--success-color)"
    status.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${bgColor};
      color: white;
      padding: 12px 16px;
      border-radius: 6px;
      font-size: 14px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `

    document.body.appendChild(status)

    setTimeout(() => {
      status.remove()
    }, 3000)
  }

  /**
   * Utility functions
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  formatDate(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      return "Today"
    } else if (diffDays === 2) {
      return "Yesterday"
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  stripHtml(html) {
    const tmp = document.createElement("div")
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ""
  }

  escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }

  htmlToMarkdown(html) {
    // Basic HTML to Markdown conversion
    return html
      .replace(/<strong>(.*?)<\/strong>/g, "**$1**")
      .replace(/<b>(.*?)<\/b>/g, "**$1**")
      .replace(/<em>(.*?)<\/em>/g, "*$1*")
      .replace(/<i>(.*?)<\/i>/g, "*$1*")
      .replace(/<u>(.*?)<\/u>/g, "_$1_")
      .replace(/<ul>/g, "")
      .replace(/<\/ul>/g, "")
      .replace(/<ol>/g, "")
      .replace(/<\/ol>/g, "")
      .replace(/<li>(.*?)<\/li>/g, "- $1")
      .replace(/<br\s*\/?>/g, "\n")
      .replace(/<p>(.*?)<\/p>/g, "$1\n\n")
      .replace(/<[^>]*>/g, "") // Remove remaining HTML tags
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing NoteMaster...")
  try {
    window.noteMaster = new NoteMaster()
  } catch (error) {
    console.error("Failed to initialize NoteMaster:", error)
  }
})

// Also try immediate initialization in case DOMContentLoaded already fired
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded (delayed), initializing NoteMaster...")
    if (!window.noteMaster) {
      window.noteMaster = new NoteMaster()
    }
  })
} else {
  console.log("DOM already loaded, initializing NoteMaster immediately...")
  window.noteMaster = new NoteMaster()
}

// Add CSS animation for save status
const style = document.createElement("style")
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`
document.head.appendChild(style)
