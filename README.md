# Link Fetch

A Chrome extension for fetching, organizing, and managing links from web pages with a modern, accessible interface.

![Link Fetch Screenshot - Light Mode](screenshots/light-mode.png)
![Link Fetch Screenshot - Dark Mode](screenshots/dark-mode.png)

## Features

- Fetch all links from the current page with a single click
- Extract links from selected text
- Save links for later reference across browser sessions
- Group links by domain for better organization
- Filter links to quickly find what you need
- Sort links by domain, URL, or date added
- Copy links to clipboard with one click
- Open links in new tabs
- Remove individual links or clear all at once
- Check for broken links with visual indicators
- Side panel support for easier access while browsing
- Context menu for quick access to extension features
- Dark mode support to reduce eye strain
- Keyboard shortcuts for faster navigation
- Accessibility features for all users

## Accessibility Features

Link Fetch is designed to be accessible to all users, including those who rely on assistive technologies:

- Keyboard navigation and shortcuts:
  - `Ctrl+F` to focus on the filter input
  - `Esc` to clear the filter
  - `Alt+L` to open the popup (customizable in Chrome extension settings)
  - `Alt+Shift+L` to toggle the side panel
- Screen reader support with proper ARIA attributes
- High contrast focus states for better visibility
- Improved color contrast ratios that meet WCAG guidelines
- Fully responsive layout that adapts to different screen sizes

## Dark Mode

Link Fetch includes a built-in dark mode to reduce eye strain and save battery life. Users can toggle between light and dark themes by clicking the theme toggle button in the top-right corner of the popup.

## Side Panel

The extension supports Chrome's side panel feature, allowing you to access your links without leaving the current tab. This is particularly useful when you need to reference multiple links while staying on the same page.

## Broken Link Detection

Link Fetch can check your saved links to identify any that are broken or no longer accessible. Broken links are visually marked, making it easy to identify and remove outdated resources.

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the directory containing this extension
5. The Link Fetch extension icon will appear in your browser toolbar

## Usage

- Click the Link Fetch icon in your browser toolbar to open the popup
- Click "Fetch Links" to extract all links from the current page
- Use the filter to search for specific links
- Click the copy icon to copy a link to your clipboard
- Click the open icon to open a link in a new tab
- Click the delete icon to remove a link from your list
- Use "Check Links" to validate all saved links
- Click the side panel icon to open Link Fetch in a side panel

## Privacy

Link Fetch operates entirely on your local machine. No data is sent to external servers except when checking if links are broken, which only involves standard HTTP requests to the linked resources.

## License

MIT License 