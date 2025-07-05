/**
 * NoteMaster Background Script (Service Worker)
 * Handles background tasks, context menus, keyboard shortcuts,
 * and cloud synchronization scheduling.
 */



class BackgroundManager {
  constructor() {
    this.init()
  }

  /**
   * Initialize background functionality
   */
  init() {
    this.setupContextMenus()
    this.setupCommandHandlers()
    this.setupStorageListeners()
    this.setupInstallHandler()
  }

  /**
   * Setup context menus for right-click functionality
   */
  setupContextMenus() {
    chrome.runtime.onInstalled.addListener(() => {
      // Create context menu for selected text
      chrome.contextMenus.create({
        id: "saveSelectedText",
        title: "Save to NoteMaster",
        contexts: ["selection"],
      })

      // Create context menu for pages
      chrome.contextMenus.create({
        id: "savePageInfo",
        title: "Save page info to NoteMaster",
        contexts: ["page"],
      })
    })

    // Handle context menu clicks
    chrome.contextMenus.onClicked.addListener((info, tab) => {
      this.handleContextMenuClick(info, tab)
    })
  }

  /**
   * Handle context menu clicks
   */
  async handleContextMenuClick(info, tab) {
    try {
      switch (info.menuItemId) {
        case "saveSelectedText":
          await this.saveSelectedText(info, tab)
          break
        case "savePageInfo":
          await this.savePageInfo(info, tab)
          break
      }
    } catch (error) {
      console.error("Context menu error:", error)
    }
  }

  /**
   * Save selected text as a new note
   */
  async saveSelectedText(info, tab) {
    const selectedText = info.selectionText
    if (!selectedText) return

    const note = {
      id: this.generateId(),
      title: `Selection from ${tab.title}`,
      content: `<p>${this.escapeHtml(selectedText)}</p><br><p><em>Source: <a href="${tab.url}">${tab.title}</a></em></p>`,
      tags: ["web-clip"],
      category: "web",
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    }

    await this.saveNote(note)
    this.showNotification("Text saved to NoteMaster!")
  }

  /**
   * Save page information as a new note
   */
  async savePageInfo(info, tab) {
    const note = {
      id: this.generateId(),
      title: tab.title,
      content: `<p><strong>URL:</strong> <a href="${tab.url}">${tab.url}</a></p><p><strong>Saved:</strong> ${new Date().toLocaleString()}</p>`,
      tags: ["bookmark", "web-clip"],
      category: "web",
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    }

    await this.saveNote(note)
    this.showNotification("Page saved to NoteMaster!")
  }

  /**
   * Save a note to storage
   */
  async saveNote(note) {
    try {
      const result = await chrome.storage.local.get(["notes"])
      const notes = result.notes || []
      notes.unshift(note)
      await chrome.storage.local.set({ notes })
    } catch (error) {
      console.error("Error saving note:", error)
    }
  }

  /**
   * Setup keyboard command handlers
   */
  setupCommandHandlers() {
    chrome.commands.onCommand.addListener((command) => {
      this.handleCommand(command)
    })
  }

  /**
   * Handle keyboard commands
   */
  async handleCommand(command) {
    try {
      switch (command) {
        case "open-quick-note":
          await this.openQuickNote()
          break
        case "search-notes":
          await this.openSearchInterface()
          break
      }
    } catch (error) {
      console.error("Command error:", error)
    }
  }

  /**
   * Open quick note interface
   */
  async openQuickNote() {
    // Open popup with focus on new note
    chrome.action.openPopup()
  }

  /**
   * Open search interface
   */
  async openSearchInterface() {
    // Open popup with focus on search
    chrome.action.openPopup()
  }

  /**
   * Setup storage change listeners
   */
  setupStorageListeners() {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      this.handleStorageChange(changes, namespace)
    })
  }

  /**
   * Handle storage changes for sync purposes
   */
  handleStorageChange(changes, namespace) {
    if (namespace === "local" && changes.notes) {
      console.log("Notes updated locally")
    }

    if (namespace === "sync" && changes.settings) {
      console.log("Settings updated")
    }
  }

  /**
   * Setup installation handler
   */
  setupInstallHandler() {
    chrome.runtime.onInstalled.addListener((details) => {
      if (details.reason === "install") {
        this.handleFirstInstall()
      } else if (details.reason === "update") {
        this.handleUpdate(details.previousVersion)
      }
    })
  }

  /**
   * Handle first installation
   */
  async handleFirstInstall() {
    // Set default settings
    const defaultSettings = {
      theme: "light",
      fontSize: 14,
      fontFamily: "system",
      autoSave: true,
      exportFormat: "json",
      backupFrequency: "weekly",
    }

    await chrome.storage.sync.set({ settings: defaultSettings })

    // Create welcome note
    const welcomeNote = {
      id: this.generateId(),
      title: "Welcome to NoteMaster!",
      content: `
        <h2>Welcome to NoteMaster!</h2>
        <p>Thank you for installing NoteMaster, your comprehensive note-taking companion.</p>
        
        <h3>Getting Started:</h3>
        <ul>
          <li><strong>Create Notes:</strong> Click the "New Note" button to start writing</li>
          <li><strong>Rich Formatting:</strong> Use the toolbar for bold, italic, and lists</li>
          <li><strong>Organization:</strong> Add tags and categories to organize your notes</li>
          <li><strong>Search:</strong> Quickly find notes using the search bar</li>
        </ul>
        
        <h3>Keyboard Shortcuts:</h3>
        <ul>
          <li><strong>Ctrl+Shift+N:</strong> Open quick note</li>
          <li><strong>Ctrl+Shift+F:</strong> Search notes</li>
          <li><strong>Ctrl+S:</strong> Save current note</li>
          <li><strong>Ctrl+B/I/U:</strong> Bold/Italic/Underline text</li>
        </ul>
        
        <h3>Features:</h3>
        <ul>
          <li>Rich text formatting with toolbar</li>
          <li>Note categorization and tagging</li>
          <li>Advanced search and filtering</li>
          <li>Import/Export in multiple formats</li>
          <li>Customizable themes and appearance</li>
          <li>Cloud synchronization (coming soon)</li>
        </ul>
        
        <p><em>Right-click on any webpage to save selected text or page information directly to NoteMaster!</em></p>
        
        <p>Visit the settings page to customize your experience and explore all available options.</p>
      `,
      tags: ["welcome", "guide"],
      category: "system",
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    }

    await this.saveNote(welcomeNote)

    // Show welcome notification
    this.showNotification("Welcome to NoteMaster! Check out your first note to get started.")
  }

  /**
   * Handle extension update
   */
  async handleUpdate(previousVersion) {
    console.log(`Updated from version ${previousVersion}`)

    // Perform any necessary data migrations here
    // For example, if note structure changed between versions

    this.showNotification("NoteMaster has been updated with new features!")
  }

  /**
   * Show notification to user
   */
  showNotification(message) {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "NoteMaster",
      message: message,
    })
  }

  /**
   * Utility functions
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }
}

// Initialize background manager
new BackgroundManager()

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // This is handled by the popup, but we can add additional logic here if needed
})

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle any inter-script communication here
  if (request.action === "syncNotes") {
    // Trigger sync
    new BackgroundManager().performSync()
    sendResponse({ success: true })
  }
})
