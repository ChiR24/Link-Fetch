// This script runs in the context of web pages

// Listen for messages from the extension
chrome.runtime.onMessage.addListener(function(request, _sender, sendResponse) {
  if (request.action === "getLinks") {
    const links = getAllPageLinks();
    sendResponse({ links });
  } else if (request.action === "getLinksFromSelection") {
    const links = getLinksFromSelection();
    sendResponse({ links });
  }
  // Return true keeps the message channel open if callers decide to respond async
  return true;
});

// Shared URL matching regex and cleanup
const URL_REGEX = /(https?:\/\/[^\s\"\'\)\<\>]+)/g;
function cleanupUrl(raw) {
  let s = raw;
  while (
    s.endsWith('.') ||
    s.endsWith(',') ||
    s.endsWith(';') ||
    s.endsWith(')') ||
    s.endsWith('"') ||
    s.endsWith("'")
  ) {
    s = s.slice(0, -1);
  }
  return s;
}


// Function to get all links on the page with additional metadata
function getAllPageLinks() {
  const linkElements = document.querySelectorAll('a');
  const links = [];
  const seenUrls = new Set(); // For tracking duplicates

  linkElements.forEach(link => {
    const href = link.href;

    // Skip if not a valid http/https link or already seen
    if (!href || !href.startsWith('http') || seenUrls.has(href)) {
      return;
    }

    // Add to seen set and links array
    seenUrls.add(href);
    links.push(href);
  });

  // Also look for links in text content using regex (for markdown-style links, etc.)
  // This can find links not in <a> tags
  try {
    const bodyText = document.body.innerText;
    const matches = bodyText.match(URL_REGEX);

    if (matches) {
      matches.forEach(url => {
        // Clean up URL - remove trailing punctuation
        const cleanUrl = cleanupUrl(url);

        if (cleanUrl.startsWith('http') && !seenUrls.has(cleanUrl)) {
          seenUrls.add(cleanUrl);
          links.push(cleanUrl);
        }
      });
    }
  } catch (e) {
    console.error('Error extracting text links:', e);
  }

  return links;
}

// Function to extract links from selected text on the page
function getLinksFromSelection() {
  const selection = window.getSelection().toString();
  const links = [];
  const seenUrls = new Set(); // For tracking duplicates

  // Simple regex for http/https URLs
  const matches = selection.match(URL_REGEX);

  if (matches) {
    matches.forEach(url => {
      // Clean up URL - remove trailing punctuation commonly included when selecting text
      const cleanUrl = cleanupUrl(url);

      if (!seenUrls.has(cleanUrl)) {
        seenUrls.add(cleanUrl);
        links.push(cleanUrl);
      }
    });
  }

  return links;
}