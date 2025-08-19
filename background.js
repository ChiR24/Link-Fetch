// Background script for Link Fetch extension

// Set up context menu
chrome.runtime.onInstalled.addListener(() => {
  // Create main context menu item
  chrome.contextMenus.create({
    id: "fetchLinkUnderCursor",
    title: "Add to Link Fetch",
    contexts: ["link"]
  });
  
  // Create context menu for the page
  chrome.contextMenus.create({
    id: "fetchAllLinks",
    title: "Fetch All Links on This Page",
    contexts: ["page"]
  });
  
  // Create sub-menu for selection
  chrome.contextMenus.create({
    id: "fetchLinkInSelection",
    title: "Extract Links from Selection",
    contexts: ["selection"]
  });
  
  // Show the number of stored links in the badge
  updateBadge();
  

});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "fetchLinkUnderCursor" && info.linkUrl) {
    // Store the link in local storage
    addLink(info.linkUrl);
    
    // Show visual feedback - blink the badge
    blinkBadge();
  }
  else if (info.menuItemId === "fetchAllLinks") {
    // Ask content script to get all links via messaging (avoids duplicate logic)
    chrome.tabs.sendMessage(tab.id, { action: "getLinks" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        return;
      }

      const links = (response && response.links) ? response.links : [];

      if (links.length > 0) {
        // Add all links to storage
        addLinks(links);

        // Show visual feedback - blink the badge
        blinkBadge();

        // Show notification with count
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: 'Link Fetch',
          message: `Added ${links.length} links from the page`
        });
      }
    });
  }
  else if (info.menuItemId === "fetchLinkInSelection") {
    // Ask content script to extract links from selection via messaging
    chrome.tabs.sendMessage(tab.id, { action: "getLinksFromSelection" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        return;
      }

      const links = (response && response.links) ? response.links : [];

      if (links.length > 0) {
        // Add all links to storage
        addLinks(links);

        // Show visual feedback - blink the badge
        blinkBadge();
      }
    });
  }
  // Remove side panel context menu handler
});

// Function to add a single link
function addLink(url) {
  chrome.storage.local.get(['links', 'linkTimestamps'], function(result) {
    let links = result.links || [];
    let timestamps = result.linkTimestamps || {};
    
    // Only add if it doesn't already exist
    if (!links.includes(url)) {
      links.push(url);
      
      // Store timestamp for sorting by date
      timestamps[url] = Date.now();
      
      chrome.storage.local.set({ 
        'links': links,
        'linkTimestamps': timestamps
      }, function() {
        updateBadge();
      });
    }
  });
}

// Function to add multiple links
function addLinks(newLinks) {
  if (!newLinks || newLinks.length === 0) return;
  
  chrome.storage.local.get(['links', 'linkTimestamps'], function(result) {
    let links = result.links || [];
    let timestamps = result.linkTimestamps || {};
    
    // Merge with existing links, avoiding duplicates
    let addedCount = 0;
    const now = Date.now();
    
    newLinks.forEach(url => {
      if (!links.includes(url)) {
        links.push(url);
        timestamps[url] = now;
        addedCount++;
      }
    });
    
    if (addedCount > 0) {
      chrome.storage.local.set({ 
        'links': links,
        'linkTimestamps': timestamps
      }, function() {
        updateBadge();
      });
    }
  });
}

// Update badge with count of links
function updateBadge() {
  chrome.storage.local.get(['links'], function(result) {
    const links = result.links || [];
    const count = links.length.toString();
    
    if (links.length > 0) {
      chrome.action.setBadgeText({ text: count });
      chrome.action.setBadgeBackgroundColor({ color: '#1a73e8' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  });
}

// Blink the badge for visual feedback
function blinkBadge() {
  chrome.action.setBadgeBackgroundColor({ color: '#34a853' });
  
  setTimeout(() => {
    chrome.action.setBadgeBackgroundColor({ color: '#1a73e8' });
  }, 1000);
}

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener(
  function(request, _sender, sendResponse) {
    if (request.action === "fetchLinks") {
      // Send message to content script to get links
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "getLinks" },
          function(response) {
            if (chrome.runtime.lastError) {
              sendResponse({ success: false, error: chrome.runtime.lastError.message });
              return;
            }
            
            if (response && response.links) {
              sendResponse({ success: true, links: response.links });
            } else {
              sendResponse({ success: false, error: "No links received" });
            }
          }
        );
      });
      return true; // Keep the message channel open for async response
    }
    else if (request.action === "updateBadge") {
      updateBadge();
      sendResponse({ success: true });
    }
    // Remove openSidePanel message handler
    else if (request.action === "checkLinks") {
      // Check if the links are valid/broken
      if (request.links && request.links.length > 0) {
        checkLinks(request.links)
          .then(results => {
            sendResponse({ success: true, results: results });
          })
          .catch(error => {
            console.error('Error checking links:', error);
            sendResponse({ success: false, error: error.message });
          });
        return true; // Keep the message channel open for async response
      }
    }
  }
);

// Function to check if links are working or broken
async function checkLinks(links) {
  const results = {};
  
  // Check links in batches to avoid overwhelming the browser
  const batchSize = 5;
  const batches = [];
  
  // Split the links array into batches
  for (let i = 0; i < links.length; i += batchSize) {
    batches.push(links.slice(i, i + batchSize));
  }
  
  // Process each batch sequentially
  for (const batch of batches) {
    // Process links in this batch in parallel
    await Promise.all(
      batch.map(async (link) => {
        try {
          // Use fetch with a timeout to check if the link is valid
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
          
          // Try HEAD first with proper host permissions; fall back to GET if needed
          const response = await fetch(link, {
            method: 'HEAD',
            cache: 'no-store',
            redirect: 'follow',
            signal: controller.signal
          }).catch(() => null);

          let ok = !!(response && response.ok);

          if (!ok) {
            const response2 = await fetch(link, {
              method: 'GET',
              cache: 'no-store',
              redirect: 'follow',
              signal: controller.signal
            }).catch(() => null);
            ok = !!(response2 && response2.ok);
          }

          clearTimeout(timeoutId);

          results[link] = ok;
        } catch (error) {
          // If there's an error (network, CORS, timeout), consider the link broken
          results[link] = false;
        }
      })
    );
  }
  
  return results;
}

