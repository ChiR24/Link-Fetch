// Side panel script for Link Fetch extension
document.addEventListener('DOMContentLoaded', function() {
  // Get UI elements
  const fetchButton = document.getElementById('fetchLinks');
  const copyButton = document.getElementById('copyLinks');
  const clearButton = document.getElementById('clearLinks');
  const filterInput = document.getElementById('filterInput');
  const sortOption = document.getElementById('sortOption');
  const linksList = document.getElementById('linksList');
  const statusElement = document.getElementById('status');
  const statsBar = document.getElementById('statsBar');
  const linkCountElement = document.getElementById('linkCount');
  const domainCountElement = document.getElementById('domainCount');
  const themeToggle = document.getElementById('themeToggle');

  // Store links
  let links = [];
  
  // Check if dark mode is enabled
  function initTheme() {
    chrome.storage.local.get(['darkMode'], function(result) {
      if (result.darkMode) {
        document.body.classList.add('dark-theme');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        themeToggle.title = 'Switch to light mode';
      } else {
        document.body.classList.remove('dark-theme');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggle.title = 'Switch to dark mode';
      }
    });
  }
  
  // Initialize theme
  initTheme();
  
  // Toggle dark mode
  themeToggle.addEventListener('click', function() {
    const isDarkMode = document.body.classList.contains('dark-theme');
    
    if (isDarkMode) {
      document.body.classList.remove('dark-theme');
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      themeToggle.title = 'Switch to dark mode';
      chrome.storage.local.set({ 'darkMode': false });
    } else {
      document.body.classList.add('dark-theme');
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      themeToggle.title = 'Switch to light mode';
      chrome.storage.local.set({ 'darkMode': true });
    }
  });

  // Add check links button to verify if links are still working
  const checkLinksButton = document.createElement('button');
  checkLinksButton.innerHTML = '<i class="fas fa-check-circle"></i> Check Links';
  checkLinksButton.title = 'Check for broken links';
  checkLinksButton.id = 'checkLinks';
  checkLinksButton.style.marginTop = '12px';
  checkLinksButton.style.width = '100%';
  checkLinksButton.style.background = 'var(--success-color)';
  checkLinksButton.className = 'success-button';
  
  // Add the button after the stats bar
  statsBar.parentNode.insertBefore(checkLinksButton, statsBar.nextSibling);
  
  // Check links functionality
  checkLinksButton.addEventListener('click', function() {
    if (links.length === 0) {
      showStatus('No links to check', 'error');
      return;
    }
    
    // Show loading state with animation
    checkLinksButton.disabled = true;
    checkLinksButton.innerHTML = '<span class="loading-spinner"></span> Checking...';
    checkLinksButton.classList.add('pulse-animation');
    
    // We'll send the links to the background script to check them
    chrome.runtime.sendMessage({
      action: "checkLinks",
      links: links
    }, function(response) {
      // Reset button state
      checkLinksButton.disabled = false;
      checkLinksButton.innerHTML = '<i class="fas fa-check-circle"></i> Check Links';
      checkLinksButton.classList.remove('pulse-animation');
      
      if (response && response.results) {
        // Update the UI to reflect broken links
        markBrokenLinks(response.results);
        
        const brokenCount = Object.values(response.results).filter(status => !status).length;
        if (brokenCount > 0) {
          showStatus(`Found ${brokenCount} broken link${brokenCount !== 1 ? 's' : ''}`, 'warning');
          
          // Highlight the broken links with a pulse animation
          const brokenLinks = document.querySelectorAll('.broken-link');
          brokenLinks.forEach(link => {
            link.classList.add('pulse-animation');
            setTimeout(() => link.classList.remove('pulse-animation'), 1000);
          });
        } else {
          showStatus('All links are working!');
        }
      } else {
        showStatus('Failed to check links', 'error');
      }
    });
  });

  // Function to mark broken links in the UI
  function markBrokenLinks(results) {
    // Find all link items in the list
    const linkItems = document.querySelectorAll('#linksList li');
    
    linkItems.forEach(item => {
      // Get the URL from the link item's text content
      const linkText = item.querySelector('.link-item').textContent;
      
      // If we have a result for this link and it's broken
      if (results[linkText] === false) {
        // Add a broken link indicator
        item.classList.add('broken-link');
        
        // Add a warning icon
        const warningIcon = document.createElement('span');
        warningIcon.className = 'broken-link-icon';
        warningIcon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
        warningIcon.title = 'This link appears to be broken';
        
        // Add it after the favicon
        const linkItem = item.querySelector('.link-item');
        if (linkItem.querySelector('.favicon')) {
          linkItem.insertBefore(warningIcon, linkItem.querySelector('.favicon').nextSibling);
        } else {
          linkItem.insertBefore(warningIcon, linkItem.firstChild);
        }
      }
    });
  }

  // Load saved links
  function loadLinks() {
    chrome.storage.local.get(['links'], function(result) {
      if (result.links && result.links.length > 0) {
        links = result.links;
        displayLinks(links);
        updateStats(links);
      } else {
        showEmptyMessage();
      }
    });
  }
  
  // Initial load
  loadLinks();
  
  // Listen for storage changes
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'local' && changes.links) {
      // Update our links array with the new value
      links = changes.links.newValue || [];
      displayLinks(links);
      updateStats(links);
    }
  });

  // Fetch links from current tab
  fetchButton.addEventListener('click', function() {
    // Show loading state
    fetchButton.disabled = true;
    fetchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fetching...';
    
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const activeTab = tabs[0];
      chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        function: getAllLinks
      }, (results) => {
        // Reset button state
        fetchButton.disabled = false;
        fetchButton.innerHTML = '<i class="fas fa-download"></i> Fetch Links';
        
        if (chrome.runtime.lastError) {
          showStatus('Error: ' + chrome.runtime.lastError.message, 'error');
          return;
        }
        
        if (results && results[0] && results[0].result) {
          const newLinks = results[0].result;
          
          // Merge with existing links, avoiding duplicates
          const uniqueLinks = [...new Set([...links, ...newLinks])];
          links = uniqueLinks;
          
          // Save links
          chrome.storage.local.set({ 'links': links });
          
          // Show success message with count
          const newCount = uniqueLinks.length - links.length;
          if (newCount > 0) {
            showStatus(`Found ${newCount} new link${newCount !== 1 ? 's' : ''}`);
          } else {
            showStatus('No new links found');
          }
        }
      });
    });
  });

  // Copy all links
  copyButton.addEventListener('click', function() {
    if (links.length === 0) {
      showStatus('No links to copy', 'error');
      return;
    }
    
    // Get filtered links if filter is active
    const filterText = filterInput.value.toLowerCase();
    const linksToCopy = filterText ? 
      links.filter(link => link.toLowerCase().includes(filterText)) : 
      links;
    
    const textToCopy = linksToCopy.join('\n');
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        // Visual feedback
        copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
          copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy All';
        }, 1500);
        
        showStatus(`Copied ${linksToCopy.length} links to clipboard`);
      })
      .catch(err => {
        showStatus('Failed to copy: ' + err, 'error');
      });
  });

  // Clear all links
  clearButton.addEventListener('click', function() {
    if (links.length === 0) {
      showStatus('No links to clear', 'error');
      return;
    }
    
    // Add confirmation
    if (confirm(`Are you sure you want to clear all ${links.length} links?`)) {
      links = [];
      chrome.storage.local.set({ 'links': links });
      showEmptyMessage();
      statsBar.style.display = 'none';
      showStatus('All links cleared');
    }
  });

  // Filter links
  filterInput.addEventListener('input', function() {
    const filterText = this.value.toLowerCase();
    const filteredLinks = links.filter(link => 
      link.toLowerCase().includes(filterText)
    );
    displayLinks(filteredLinks);
    
    // Update the link count in stats bar to show filtered count
    if (filterText) {
      linkCountElement.textContent = `${filteredLinks.length} of ${links.length} links`;
    } else {
      updateStats(links);
    }
  });

  // Sort links
  sortOption.addEventListener('change', function() {
    displayLinks(links);
  });
  
  // Keyboard shortcuts
  window.addEventListener('keydown', function(event) {
    // Ctrl+F or Cmd+F to focus the filter input
    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
      event.preventDefault(); // Prevent browser's find function
      filterInput.focus();
    }
    
    // Escape to clear filter
    if (event.key === 'Escape' && document.activeElement === filterInput) {
      filterInput.value = '';
      displayLinks(links);
      updateStats(links);
    }
  });

  // Function to update stats bar
  function updateStats(linksArr) {
    if (linksArr.length === 0) {
      statsBar.style.display = 'none';
      return;
    }
    
    // Count unique domains
    const domains = new Set();
    linksArr.forEach(link => {
      try {
        const url = new URL(link);
        domains.add(url.hostname);
      } catch (e) {
        // Skip invalid URLs
      }
    });
    
    // Update stats display
    linkCountElement.textContent = `${linksArr.length} link${linksArr.length !== 1 ? 's' : ''}`;
    domainCountElement.textContent = `${domains.size} domain${domains.size !== 1 ? 's' : ''}`;
    statsBar.style.display = 'flex';
  }

  // Function to display links
  function displayLinks(linksToDisplay) {
    linksList.innerHTML = '';

    if (linksToDisplay.length === 0) {
      showEmptyMessage();
      return;
    }

    const sortType = sortOption.value;
    let sortedLinks = [...linksToDisplay];

    // Sort according to selection
    if (sortType === 'alphabetical') {
      sortedLinks.sort();
    } else if (sortType === 'domain') {
      // Group by domain
      const linksByDomain = {};
      
      sortedLinks.forEach(link => {
        try {
          const url = new URL(link);
          const domain = url.hostname;
          
          if (!linksByDomain[domain]) {
            linksByDomain[domain] = [];
          }
          
          linksByDomain[domain].push(link);
        } catch (e) {
          // Skip invalid URLs
        }
      });
      
      // Display domain groups
      Object.keys(linksByDomain).sort().forEach(domain => {
        const domainLinks = linksByDomain[domain];
        
        // Create domain header
        const domainGroup = document.createElement('div');
        domainGroup.className = 'domain-group';
        domainGroup.setAttribute('aria-label', `Domain group: ${domain} with ${domainLinks.length} links`);
        
        // Add favicon
        const favicon = document.createElement('img');
        favicon.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
        favicon.className = 'favicon';
        favicon.alt = '';
        domainGroup.appendChild(favicon);
        
        // Add domain text
        domainGroup.appendChild(document.createTextNode(' ' + domain + ' '));
        
        // Add count badge
        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.textContent = domainLinks.length;
        domainGroup.appendChild(badge);
        
        linksList.appendChild(domainGroup);
        
        // Add links for this domain
        domainLinks.forEach(link => {
          addLinkItem(link);
        });
      });
      
      return; // We've handled the display
    } else if (sortType === 'date') {
      // If we have stored timestamps, sort by those (newest first)
      chrome.storage.local.get(['linkTimestamps'], function(result) {
        const timestamps = result.linkTimestamps || {};
        
        sortedLinks.sort((a, b) => {
          const timeA = timestamps[a] || 0;
          const timeB = timestamps[b] || 0;
          return timeB - timeA; // Descending order (newest first)
        });
        
        // Display sorted links
        sortedLinks.forEach(link => {
          addLinkItem(link);
        });
      });
      
      return; // Async handling
    }
    
    // Default display (for default or alphabetical sort)
    sortedLinks.forEach(link => {
      addLinkItem(link);
    });
  }

  // Function to add a single link item to the list
  function addLinkItem(link) {
    // Create list item
    const li = document.createElement('li');
    li.tabIndex = 0; // Make focusable for keyboard navigation
    
    // Create link display area
    const linkItem = document.createElement('div');
    linkItem.className = 'link-item';
    
    // Try to extract domain for favicon
    let domain = '';
    try {
      const url = new URL(link);
      domain = url.hostname;
    } catch (e) {
      // If not a valid URL, skip favicon
    }
    
    // Add favicon if we have a domain
    if (domain) {
      const favicon = document.createElement('img');
      favicon.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
      favicon.className = 'favicon';
      favicon.alt = '';
      linkItem.appendChild(favicon);
    }
    
    // Add text content (the URL)
    linkItem.appendChild(document.createTextNode(link));
    
    // Add click handler to copy link
    linkItem.addEventListener('click', function() {
      navigator.clipboard.writeText(link).then(() => {
        showStatus(`Copied: ${link}`);
      });
    });
    
    li.appendChild(linkItem);
    
    // Create action buttons container
    const actions = document.createElement('div');
    actions.className = 'link-actions';
    
    // Copy button
    const copyBtn = document.createElement('button');
    copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
    copyBtn.title = 'Copy link';
    copyBtn.setAttribute('aria-label', 'Copy link');
    copyBtn.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent triggering the li click
      navigator.clipboard.writeText(link).then(() => {
        showStatus(`Copied: ${link}`);
      });
    });
    actions.appendChild(copyBtn);
    
    // Open button
    const openBtn = document.createElement('button');
    openBtn.innerHTML = '<i class="fas fa-external-link-alt"></i>';
    openBtn.title = 'Open link in new tab';
    openBtn.setAttribute('aria-label', 'Open link in new tab');
    openBtn.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent triggering the li click
      chrome.tabs.create({ url: link });
    });
    actions.appendChild(openBtn);
    
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
    deleteBtn.title = 'Remove link';
    deleteBtn.setAttribute('aria-label', 'Remove link');
    deleteBtn.addEventListener('click', function(e) {
      e.stopPropagation(); // Prevent triggering the li click
      
      // Remove from array
      const index = links.indexOf(link);
      if (index > -1) {
        links.splice(index, 1);
        
        // Update storage
        chrome.storage.local.set({ 'links': links }, function() {
          // Update UI
          li.classList.add('removing');
          
          // Animate removal
          setTimeout(() => {
            li.remove();
            
            // Update stats
            updateStats(links);
            
            if (links.length === 0) {
              showEmptyMessage();
            }
          }, 300);
          
          showStatus('Link removed');
        });
      }
    });
    actions.appendChild(deleteBtn);
    
    li.appendChild(actions);
    linksList.appendChild(li);
  }

  // Show empty message
  function showEmptyMessage() {
    linksList.innerHTML = '<div class="empty-message">No links found. Click "Fetch Links" to get started.</div>';
  }
  
  // Show status message
  function showStatus(message, type = 'success') {
    statusElement.textContent = message;
    statusElement.className = 'status ' + type;
    
    // Show the message
    statusElement.style.opacity = '1';
    
    // Hide after delay
    setTimeout(() => {
      statusElement.style.opacity = '0';
    }, 3000);
  }
  
  // Function that will be injected into the page to get links
  function getAllLinks() {
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
    
    // Also look for links in text content using regex
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
      // Skip if error
    }
    
    return links;
  }
}); 