/**
 * NoteMaster Options Script
 * Handles the settings/options page functionality including theme management
 * and export operations.
 */


class OptionsManager {
  constructor() {
    this.settings = {}
    this.init()
  }

  /**
   * Initialize the options page
   */
  async init() {
    await this.loadSettings()
    this.populateSettings()
    this.setupEventListeners()
    this.applyTheme()
  }

  /**
   * Load settings from Chrome storage
   */
  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(["settings"])
      this.settings = result.settings || {
        theme: "light",
        fontSize: 14,
        fontFamily: "system",
        autoSave: true,
        exportFormat: "json",
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }

  /**
   * Save settings to Chrome storage
   */
  async saveSettings() {
    try {
      await chrome.storage.sync.set({ settings: this.settings })
      this.showSaveStatus("Settings saved successfully!", "success")
    } catch (error) {
      console.error("Error saving settings:", error)
      this.showSaveStatus("Error saving settings", "error")
    }
  }

  /**
   * Populate form fields with current settings
   */
  populateSettings() {
    document.getElementById("themeSelect").value = this.settings.theme
    document.getElementById("fontSizeRange").value = this.settings.fontSize
    document.getElementById("fontSizeValue").textContent = `${this.settings.fontSize}px`
    document.getElementById("fontFamilySelect").value = this.settings.fontFamily
    document.getElementById("autoSave").checked = this.settings.autoSave
    document.getElementById("exportFormat").value = this.settings.exportFormat
  }

  /**
   * Setup event listeners for all form elements
   */
  setupEventListeners() {
    // Theme selection
    document.getElementById("themeSelect").addEventListener("change", (e) => {
      this.settings.theme = e.target.value
      this.applyTheme()
    })

    // Font size
    const fontSizeRange = document.getElementById("fontSizeRange")
    fontSizeRange.addEventListener("input", (e) => {
      this.settings.fontSize = Number.parseInt(e.target.value)
      document.getElementById("fontSizeValue").textContent = `${this.settings.fontSize}px`
      this.applyFontSize()
    })

    // Font family
    document.getElementById("fontFamilySelect").addEventListener("change", (e) => {
      this.settings.fontFamily = e.target.value
      this.applyFontFamily()
    })

    // Auto-save
    document.getElementById("autoSave").addEventListener("change", (e) => {
      this.settings.autoSave = e.target.checked
    })

    // Export format
    document.getElementById("exportFormat").addEventListener("change", (e) => {
      this.settings.exportFormat = e.target.value
    })

    // Save settings button
    document.getElementById("saveSettingsBtn").addEventListener("click", () => {
      this.saveSettings()
    })

    // Export all notes button
    document.getElementById("exportAllBtn").addEventListener("click", () => {
      this.exportAllNotes()
    })

    // Clear all notes button
    document.getElementById("clearAllBtn").addEventListener("click", () => {
      this.clearAllNotes()
    })
  }

  /**
   * Apply theme to the page
   */
  applyTheme() {
    const theme =
      this.settings.theme === "auto"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : this.settings.theme

    document.documentElement.setAttribute("data-theme", theme)
  }

  /**
   * Apply font size setting
   */
  applyFontSize() {
    document.body.style.fontSize = `${this.settings.fontSize}px`
  }

  /**
   * Apply font family setting
   */
  applyFontFamily() {
    if (this.settings.fontFamily === "system") {
      document.body.style.fontFamily = ""
    } else {
      document.body.style.fontFamily = this.settings.fontFamily
    }
  }

  /**
   * Export all notes
   */
  async exportAllNotes() {
    try {
      const result = await chrome.storage.local.get(["notes"])
      const notes = result.notes || []

      if (notes.length === 0) {
        this.showSaveStatus("No notes to export", "error")
        return
      }

      const format = this.settings.exportFormat
      let content = ""
      let filename = `notemaster_export_${new Date().toISOString().split("T")[0]}`

      switch (format) {
        case "json":
          content = JSON.stringify(notes, null, 2)
          filename += ".json"
          break
        case "txt":
          content = notes
            .map((note) => {
              return `Title: ${note.title}\nDate: ${note.modified}\n\n${this.stripHtml(note.content)}\n\n${"=".repeat(50)}\n\n`
            })
            .join("")
          filename += ".txt"
          break
        case "md":
          content = notes
            .map((note) => {
              return `# ${note.title}\n\n*Modified: ${this.formatDate(note.modified)}*\n\n${this.htmlToMarkdown(note.content)}\n\n---\n\n`
            })
            .join("")
          filename += ".md"
          break
        case "html":
          content = this.generateHtmlExport(notes)
          filename += ".html"
          break
      }

      this.downloadFile(content, filename)
      this.showSaveStatus(`Exported ${notes.length} notes successfully!`, "success")
    } catch (error) {
      console.error("Export error:", error)
      this.showSaveStatus("Error exporting notes", "error")
    }
  }

  /**
   * Generate HTML export
   */
  generateHtmlExport(notes) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>NoteMaster Export</title>
    <meta charset="UTF-8">
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
            line-height: 1.6;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #eee;
        }
        .note { 
            margin-bottom: 40px; 
            border-bottom: 1px solid #eee; 
            padding-bottom: 20px; 
        }
        .note-title { 
            font-size: 24px; 
            font-weight: bold; 
            margin-bottom: 10px;
            color: #2563eb;
        }
        .note-meta { 
            color: #666; 
            font-size: 14px; 
            margin-bottom: 15px;
        }
        .note-content { 
            line-height: 1.6;
            margin-top: 15px;
        }
        .export-info {
            color: #666;
            font-size: 14px;
        }
        @media (max-width: 600px) {
            body { padding: 15px; }
            .note-title { font-size: 20px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>NoteMaster Export</h1>
        <p class="export-info">Exported on ${new Date().toLocaleDateString()} | ${notes.length} notes</p>
    </div>
    ${notes
      .map(
        (note) => `
        <div class="note">
            <div class="note-title">${this.escapeHtml(note.title || "Untitled Note")}</div>
            <div class="note-meta">Modified: ${this.formatDate(note.modified)}</div>
            <div class="note-content">${note.content || "<em>No content</em>"}</div>
        </div>
    `,
      )
      .join("")}
</body>
</html>`
  }

  /**
   * Clear all notes
   */
  async clearAllNotes() {
    const confirmation = prompt('This will permanently delete ALL notes. Type "DELETE" to confirm:')

    if (confirmation === "DELETE") {
      try {
        await chrome.storage.local.set({ notes: [] })
        this.showSaveStatus("All notes have been deleted", "success")
      } catch (error) {
        console.error("Error clearing notes:", error)
        this.showSaveStatus("Error clearing notes", "error")
      }
    }
  }

  /**
   * Download file
   */
  downloadFile(content, filename) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
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
   * Show save status message
   */
  showSaveStatus(message, type) {
    const statusElement = document.getElementById("saveStatus")
    statusElement.textContent = message
    statusElement.className = `save-status ${type}`

    setTimeout(() => {
      statusElement.textContent = ""
      statusElement.className = "save-status"
    }, 3000)
  }

  /**
   * Utility functions
   */
  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString()
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
      .replace(/<[^>]*>/g, "")
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new OptionsManager()
})
