# Easy Note - Chrome Extension for Note-Taking


## 🚀 Features

### Core Functionality
- **Rich Text Editor**: Full-featured editor with bold, italic, underline, and list formatting
- **Search**: Quickly find notes
- **Export**: Support for multiple formats (JSON, TXT, MD, HTML)

### User Experience
- **Customizable Interface**: Multiple themes (light, dark, auto) and font size options
- **Keyboard Shortcuts**: Efficient navigation and formatting shortcuts
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
5. The Easy Note icon should appear in your Chrome toolbar

### Configuration
1. Click the Easy Note icon to open the popup
2. Click the settings gear icon to access preferences
3. Customize themes, fonts, and sync settings as desired


## 🛠️ Technical Architecture

### Key Components

#### Popup Interface (`popup.js`)
- **Easy Note Class**: Main application controller
- **Rich Text Editor**: ContentEditable with formatting toolbar
- **Note Management**: CRUD operations with local storage
- **Search**: Real-time note search
- **Theme System**: Dynamic theme switching

#### Settings Management (`options.js`)
- **OptionsManager Class**: Settings configuration handler
- **Export**: Multi-format note export
- **Theme Customization**: Appearance and font settings

#### Background Service (`background.js`)
- **Context Menus**: Right-click web page integration
- **Keyboard Commands**: Global shortcut handling
- **Installation Handler**: First-run setup and updates

### Data Storage
- **Local Storage**: Chrome's `chrome.storage.local` for notes data
- **Sync Storage**: Chrome's `chrome.storage.sync` for user settings
---

**Easy Note** - Elevate your note-taking experience with powerful organization and intuitive design.