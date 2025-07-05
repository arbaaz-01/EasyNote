# EasyNote - Chrome Extension for Note-Taking


## 🚀 Features

### Core Functionality
- **Rich Text Editor**: Full-featured editor with bold, italic, underline, and list formatting
- **Search**: Quickly find notes
- **Export**: Support for multiple formats (JSON, TXT, MD, HTML)

### User Experience
- **Customizable Interface**: Multiple themes (light, dark, auto) and font size options
- **Keyboard Shortcuts**: Efficient navigation and formatting shortcuts
- **Context Menu Integration**: Save selected text or page info directly from web pages
- **Auto-save**: Automatic saving while typing to prevent data loss

### Storage Features
- **Local Storage**: All notes stored securely in Chrome's local storage
- **Data Persistence**: Notes persist across browser sessions

## 📦 Installation

### From Source
1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The EasyNote icon should appear in your Chrome toolbar

### Configuration
1. Click the EasyNote icon to open the popup
2. Click the settings gear icon to access preferences
3. Customize themes, fonts, and sync settings as desired

## 🎯 Usage

### Creating Notes
- Click the EasyNote icon in the toolbar
- Click "New Note" to create a new note
- Use the rich text toolbar for formatting
- Notes auto-save as you type

### Keyboard Shortcuts
- `Ctrl+Shift+N`: Open quick note
- `Ctrl+Shift+F`: Search notes
- `Ctrl+S`: Save current note
- `Ctrl+B`: Bold text
- `Ctrl+I`: Italic text
- `Ctrl+U`: Underline text


### Search and Organization
- Use the search bar to find notes by content
- Filter by category using the dropdown
- Sort by date created, modified, or title
- Click on any note to edit

## 🛠️ Technical Architecture

### Key Components

#### Popup Interface (`popup.js`)
- **EasyNote Class**: Main application controller
- **Rich Text Editor**: ContentEditable with formatting toolbar
- **Note Management**: CRUD operations with local storage
- **Search & Filter**: Real-time note filtering and search
- **Theme System**: Dynamic theme switching

#### Settings Management (`options.js`)
- **OptionsManager Class**: Settings configuration handler
- **Import/Export**: Multi-format note import/export
- **Theme Customization**: Appearance and font settings
- **Sync Configuration**: Cloud sync setup and management

#### Background Service (`background.js`)
- **Context Menus**: Right-click web page integration
- **Keyboard Commands**: Global shortcut handling
- **Sync Scheduler**: Automated cloud synchronization
- **Installation Handler**: First-run setup and updates

### Data Storage
- **Local Storage**: Chrome's `chrome.storage.local` for notes data
- **Sync Storage**: Chrome's `chrome.storage.sync` for user settings
- **Export/Import**: Manual backup and restore functionality

### Security Features
- Content Security Policy (CSP) compliant
- HTML sanitization for user input
- Secure cloud authentication flow
- Local data encryption ready

## 🔧 Development

### Prerequisites
- Chrome browser with Developer mode enabled
- Basic knowledge of HTML, CSS, and JavaScript
- Firebase account (optional, for cloud sync)

### Setup Development Environment
1. Clone the repository
2. Make changes to the source files
3. Reload the extension in `chrome://extensions/`
4. Test functionality in the popup and options pages

### Code Style Guidelines
- Use ES6+ features and modern JavaScript
- Follow Chrome Extension best practices
- Maintain comprehensive error handling
- Include JSDoc comments for all functions
- Use semantic HTML and accessible design

### Testing
- Test all keyboard shortcuts
- Verify import/export functionality
- Test theme switching
- Validate search and filter operations
- Check context menu integration


## 📱 Browser Compatibility
- Chrome 88+ (Manifest V3 support)
- Chromium-based browsers (Edge, Brave, etc.)
- Full offline functionality
- Responsive design for various screen sizes

## 🔒 Privacy & Security
- All data stored locally by default
- No tracking or analytics
- Open source and auditable code

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes with proper documentation
4. Test thoroughly across different scenarios
5. Submit a pull request with detailed description

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support
- Check the welcome note created on first install
- Review keyboard shortcuts in the settings page
- For issues, create a GitHub issue with detailed reproduction steps

## 🚀 Future Enhancements
- Real-time collaborative editing
- Advanced markdown support
- Note templates and snippets
- Integration with popular productivity tools
- Mobile companion app
- Advanced search with filters
- Note sharing and publishing
- Plugin system for extensibility

---

**EasyNote** - Elevate your note-taking experience with powerful organization and intuitive design.
