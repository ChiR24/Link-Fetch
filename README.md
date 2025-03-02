# 🔍 Link Fetch 

<div align="center">

![Link Fetch Logo](icons/icon128.png)

[![Version](https://img.shields.io/badge/version-1.1-blue.svg)](https://github.com/ChiR24/Link-Fetch/releases/tag/v1.1)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-v1.1-orange.svg)](https://github.com/ChiR24/Link-Fetch/releases/tag/v1.1)

**Link Fetch is a powerful Chrome extension that helps you collect, organize, and validate links from any webpage with just a click.**

[✨ Features](#features) • 
[🚀 Installation](#installation) • 
[📖 Usage](#usage) • 
[🛠️ Development](#development) • 
[📜 License](#license)

</div>

## ✨ Features

<table>
  <tr>
    <td width="50%">
      <h3>🔎 Effortless Link Collection</h3>
      <ul>
        <li>Extract all links from any webpage with one click</li>
        <li>Smart duplicate detection ensures each link is saved only once</li>
        <li>Easily filter and search through collected links</li>
      </ul>
    </td>
    <td width="50%">
      <h3>🔄 Advanced Organization</h3>
      <ul>
        <li>Sort links by domain, alphabetical order, or date added</li>
        <li>Group links by domain for better organization</li>
        <li>Filter links using the search function</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>✅ Link Validation</h3>
      <ul>
        <li>Check for broken links with the validation tool</li>
        <li>Visual indicators highlight broken links</li>
        <li>Instantly see which links are working or broken</li>
      </ul>
    </td>
    <td width="50%">
      <h3>🌙 Dark Mode Support</h3>
      <ul>
        <li>Toggle between light and dark themes</li>
        <li>Automatically remembers your preference</li>
        <li>Reduces eye strain during nighttime use</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>📋 Easy Copying & Sharing</h3>
      <ul>
        <li>Copy individual links with a single click</li>
        <li>Copy all or filtered links at once</li>
        <li>Open links in new tabs directly from the extension</li>
      </ul>
    </td>
    <td width="50%">
      <h3>🔍 Context Menu Integration</h3>
      <ul>
        <li>Right-click on any link to add it directly to Link Fetch</li>
        <li>Extract all links from a page via the context menu</li>
        <li>Extract links from selected text on a webpage</li>
      </ul>
    </td>
  </tr>
</table>

## 🚀 Installation

### From Chrome Web Store (Coming Soon)
1. Visit the [Chrome Web Store page](#) for Link Fetch
2. Click the "Add to Chrome" button
3. Confirm the installation when prompted

### Manual Installation
1. Download the latest release from the [Releases page](https://github.com/ChiR24/Link-Fetch/releases)
2. Unzip the downloaded file
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" using the toggle in the top-right corner
5. Click "Load unpacked" and select the unzipped folder
6. Link Fetch is now installed and ready to use!

<details>
<summary><b>⌨️ Keyboard Shortcuts</b></summary>

Configure keyboard shortcuts to make Link Fetch even more convenient:
1. Go to `chrome://extensions/shortcuts`
2. Find "Link Fetch" in the list
3. Set shortcuts for:
   - Opening the popup
   - Fetching links from the current page

</details>

## 📖 Usage

<details open>
<summary><b>Collecting Links</b></summary>

* **Fetch All Links**: Click the extension icon, then click "Fetch Links" to collect all links from the current page
* **Context Menu**: Right-click on a link to add it, or right-click anywhere on a page to extract all links
* **Filter Links**: Type in the search box to filter links by URL or domain

</details>

<details>
<summary><b>Managing Links</b></summary>

* **Sort Links**: Change the sorting order using the dropdown menu
* **Delete Links**: Remove individual links using the delete button
* **Clear All**: Use the "Clear" button to remove all saved links
* **Copy Links**: Copy individual links by clicking on them, or use "Copy All" to copy all links

</details>

<details>
<summary><b>Validating Links</b></summary>

* Click the "Check Links" button to validate if links are still active
* Broken links will be highlighted with a warning indicator
* The validation process runs in the background without interrupting your browsing

</details>

## 🛠️ Development

Link Fetch is built with vanilla JavaScript, HTML, and CSS, making it lightweight and fast.

### Project Structure
```
Link-Fetch/
├── icons/              # Extension icons
├── background.js       # Background script for the extension
├── content.js          # Content script injected into pages
├── manifest.json       # Extension manifest
├── popup.html          # Popup interface HTML
├── popup.js            # Popup functionality
└── styles.css          # Shared styles for the extension
```

### Building from Source
1. Clone the repository:
   ```bash
   git clone https://github.com/ChiR24/Link-Fetch.git
   ```
2. Make your modifications
3. Load the unpacked extension in Chrome for testing
4. Run the packaging script to create a distributable ZIP:
   ```bash
   powershell -ExecutionPolicy Bypass -File .\package.ps1
   ```

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Did you find Link Fetch useful? Consider giving it a ⭐ on GitHub!</p>
  
  <a href="https://github.com/ChiR24/Link-Fetch">
    <img src="https://img.shields.io/github/stars/ChiR24/Link-Fetch?style=social" alt="GitHub stars">
  </a>
  
  <p>Made with ❤️ by <a href="https://github.com/ChiR24">ChiR24</a></p>
</div> 