// This script runs in the context of web pages

// Listen for messages from the extension
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "getLinks") {
      const links = getAllPageLinks();
      sendResponse({ links: links });
    }
    return true; // Required for async sendResponse
  }
);

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
    const urlRegex = /(https?:\/\/[^\s\"\'\)\<\>]+)/g;
    const matches = bodyText.match(urlRegex);
    
    if (matches) {
      matches.forEach(url => {
        // Clean up URL - remove trailing punctuation
        let cleanUrl = url;
        while (cleanUrl.endsWith('.') || cleanUrl.endsWith(',') || 
               cleanUrl.endsWith(';') || cleanUrl.endsWith(')') || 
               cleanUrl.endsWith('"') || cleanUrl.endsWith("'")) {
          cleanUrl = cleanUrl.slice(0, -1);
        }
        
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

// Add a context menu handler for right-click events
document.addEventListener('contextmenu', function(event) {
  // Check if the right-clicked element is a link
  let targetElement = event.target;
  
  // If clicked on text inside a link, go up to the link element
  while (targetElement && targetElement.tagName !== 'A' && targetElement !== document.body) {
    targetElement = targetElement.parentElement;
  }
  
  // If we found a link, we can handle it in the context menu
  if (targetElement && targetElement.tagName === 'A' && targetElement.href) {
    // We don't need to do anything here as the Chrome context menu API 
    // automatically handles this. This is just for documentation/future extension.
  }
}); 