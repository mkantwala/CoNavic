// Create and inject a chat UI with streaming support
function createChatBar() {
  // Check if chat bar already exists
  if (document.getElementById('quickgpt-shadow-host')) {
    return document.getElementById('quickgpt-shadow-host');
  }

  // Create a wrapper element that will host the shadow DOM
  const wrapperElement = document.createElement('div');
  wrapperElement.id = 'quickgpt-shadow-host';
  document.body.appendChild(wrapperElement);

  // Create shadow DOM
  const shadowRoot = wrapperElement.attachShadow({ mode: 'open' });

  // Inject CSS into shadow DOM
  const style = document.createElement('style');
  
  // Fetch the content.css file and inject it into the shadow DOM
  fetch(chrome.runtime.getURL('content.css'))
    .then(response => response.text())
    .then(css => {
      style.textContent = css;
      shadowRoot.appendChild(style);
    })
    .catch(error => console.error('Failed to load CSS:', error));
  
  // Create chat container
  const chatContainer = document.createElement('div');
  chatContainer.id = 'quickgpt-chat-container';

  // Create chat history box
  const chatHistory = document.createElement('div');
  chatHistory.classList.add('quickgpt-chat-history');

  // Create input container for full width text input
  const inputContainer = document.createElement('div');
  inputContainer.classList.add('quickgpt-input-container');
  inputContainer.style.display = 'flex';
  inputContainer.style.alignItems = 'center';
  inputContainer.style.position = 'relative';
  inputContainer.style.gap = '0';
  inputContainer.style.margin = '0';

  // Create input area
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Ask ChatGPT anything...';
  input.classList.add('quickgpt-input');
  input.style.flex = '1';
  input.style.paddingRight = '34px';

  // Create send button (icon)
  const sendButton = document.createElement('button');
  sendButton.classList.add('quickgpt-send-button');
  sendButton.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="#b0b0b0"/>
      <path d="M10 6V14" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
      <path d="M7 9L10 6L13 9" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
  sendButton.style.position = 'absolute';
  sendButton.style.right = '6px';
  sendButton.style.top = '50%';
  sendButton.style.transform = 'translateY(-50%)';
  sendButton.style.height = '28px';
  sendButton.style.width = '28px';
  sendButton.style.minWidth = '28px';
  sendButton.style.minHeight = '28px';
  sendButton.style.display = 'flex';
  sendButton.style.alignItems = 'center';
  sendButton.style.justifyContent = 'center';
  sendButton.style.margin = '0';

  // Add input and send button to its container
  inputContainer.appendChild(input);
  inputContainer.appendChild(sendButton);

  // Remove chat bar and controls, append inputContainer directly
  chatContainer.appendChild(chatHistory);
  chatContainer.appendChild(inputContainer);
  shadowRoot.appendChild(chatContainer);

  // At the end of createChatBar, ensure chat bar is visible and input is focused
  setTimeout(() => {
    chatContainer.classList.remove('quickgpt-hidden');
    const input = shadowRoot.querySelector('.quickgpt-input');
    if (input) input.focus();
    document.body.classList.add('quickgpt-blur-active');
  }, 0);

  // Handle send button click
  sendButton.addEventListener('click', () => {
    if (sendButton.classList.contains('quickgpt-stop-state')) {
      stopGeneration();
      return;
    }
    if (input.value.trim()) {
      sendToExecutor(input.value);
      input.value = '';
    }
  });

  // Handle Enter key
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
      sendToExecutor(input.value);
      input.value = '';
    }
  });

  return chatContainer;
}

// Store current active request ID
let activeRequestId = null;
let currentResponseElement = null;
let typewriterAbort = false; // Track if typewriter should abort

// Stop ongoing generation
function stopGeneration() {
  typewriterAbort = true; // Abort typewriter effect
  // Do not append rest of message, just leave as-is
  if (activeRequestId) {
    chrome.runtime.sendMessage(
      { action: "stop_generation", requestId: activeRequestId },
      () => {
        console.log('Generation stopped by user');
        resetChatInterface();
      }
    );
  }
}

// Reset the chat interface after completion or stopping
function resetChatInterface() {
  const wrapperElement = document.getElementById('quickgpt-shadow-host');
  if (!wrapperElement) return;
  
  const shadowRoot = wrapperElement.shadowRoot;
  const chatContainer = shadowRoot.getElementById('quickgpt-chat-container');
  if (!chatContainer) return;
  
  const input = shadowRoot.querySelector('.quickgpt-input');
  const sendButton = shadowRoot.querySelector('.quickgpt-send-button');
  
  // Restore send button to gray state with arrow
  sendButton.classList.remove('quickgpt-stop-state');
  sendButton.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="#b0b0b0"/>
      <path d="M10 6V14" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
      <path d="M7 9L10 6L13 9" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
  input.disabled = false;
  input.focus();
  
  // Clear current response tracking
  activeRequestId = null;
  currentResponseElement = null;
  typewriterAbort = false;
  hideLLMLoadingIndicator();
}

// Add a message to the chat history
function addMessageToChat(message, isUser = false) {
  const wrapperElement = document.getElementById('quickgpt-shadow-host');
  const shadowRoot = wrapperElement.shadowRoot;
  const chatContainer = shadowRoot.getElementById('quickgpt-chat-container');
  const chatHistory = shadowRoot.querySelector('.quickgpt-chat-history');
  
  const messageEl = document.createElement('div');
  messageEl.classList.add('quickgpt-message');
  messageEl.classList.add(isUser ? 'quickgpt-user-message' : 'quickgpt-ai-message');
  
  const content = document.createElement('div');
  content.classList.add('quickgpt-message-content');
  
  if (isUser) {
    content.textContent = message;
  } else {
    // Render markdown for AI messages
    content.innerHTML = parseMarkdown(message || '');
    content.dataset.requestId = activeRequestId;
  }
  
  messageEl.appendChild(content);
  chatHistory.appendChild(messageEl);
  
  // Scroll to bottom
  chatHistory.scrollTop = chatHistory.scrollHeight;
  
  return content;
}

// Remove marked.js injection and use a minimal markdown parser instead

// Helper to parse markdown to HTML (supports code blocks, bold, italics, strikethrough, lists, blockquotes, tables, links, headers)
function parseMarkdown(md) {
  // Escape HTML special chars first
  md = md.replace(/[&<>]/g, function(tag) {
    const chars = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
    return chars[tag] || tag;
  });

  // Code blocks: ```code```
  md = md.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  // Inline code: `code`
  md = md.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headers: ###, ##, #
  md = md.replace(/^###### (.*)$/gm, '<h6>$1</h6>');
  md = md.replace(/^##### (.*)$/gm, '<h5>$1</h5>');
  md = md.replace(/^#### (.*)$/gm, '<h4>$1</h4>');
  md = md.replace(/^### (.*)$/gm, '<h3>$1</h3>');
  md = md.replace(/^## (.*)$/gm, '<h2>$1</h2>');
  md = md.replace(/^# (.*)$/gm, '<h1>$1</h1>');

  // Blockquotes: > text
  md = md.replace(/^> (.*)$/gm, '<blockquote>$1</blockquote>');

  // Tables (simple): | h1 | h2 |\n|---|---|\n| v1 | v2 |
  md = md.replace(/((?:\|.+\|\n)+)/g, function(table) {
    const rows = table.trim().split('\n');
    if (rows.length < 2) return table;
    let header = rows[0], align = rows[1], body = rows.slice(2);
    if (!/^\|[\s\-|:]+\|$/.test(align)) return table;
    let ths = header.split('|').slice(1, -1).map(h => `<th>${h.trim()}</th>`).join('');
    let trs = body.map(row => {
      let tds = row.split('|').slice(1, -1).map(d => `<td>${d.trim()}</td>`).join('');
      return `<tr>${tds}</tr>`;
    }).join('');
    return `<table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
  });

  // Unordered lists: - item, * item, + item
  md = md.replace(/(^|\n)((?:\s*[-*+]\s.*\n?)+)/g, function(_, pre, list) {
    const items = list.trim().split(/\n/).map(i => i.replace(/^\s*[-*+]\s/, '')).map(i => `<li>${i}</li>`).join('');
    return `${pre}<ul>${items}</ul>`;
  });

  // Ordered lists: 1. item
  md = md.replace(/(^|\n)((?:\s*\d+\.\s.*\n?)+)/g, function(_, pre, list) {
    const items = list.trim().split(/\n/).map(i => i.replace(/^\s*\d+\.\s/, '')).map(i => `<li>${i}</li>`).join('');
    return `${pre}<ol>${items}</ol>`;
  });

  // Bold-italic: ***text*** or ___text___
  md = md.replace(/(\*\*\*|___)(.*?)\1/g, '<strong><em>$2</em></strong>');
  // Bold: **text** or __text__
  md = md.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');
  // Italic: *text* or _text_
  md = md.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');
  // Strikethrough: ~~text~~
  md = md.replace(/~~(.*?)~~/g, '<del>$1</del>');

  // Links: [text](url)
  md = md.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Line breaks (preserve inside paragraphs, but not inside <pre> or <code> or after block elements)
  // Only add <br> for lines that do not end with a block-level tag
  md = md.replace(/([^\n>])\n(?!\s*<\/?(?:h[1-6]|ul|ol|li|pre|code|blockquote|table|thead|tbody|tr|th|td)[^>]*>)/g, '$1<br>');

  return md;
}

// Typewriter effect for AI responses (character-by-character, 0.5ms per char)
async function typewriterEffect(element, text, speed = 0.5) {
  typewriterAbort = false;
  let i = 0;
  let current = '';
  while (i < text.length && !typewriterAbort) {
    current += text[i];
    element.innerHTML = parseMarkdown(current);
    // Scroll to bottom
    const chatHistory = element.closest('.quickgpt-chat-history');
    if (chatHistory) chatHistory.scrollTop = chatHistory.scrollHeight;
    await new Promise(r => setTimeout(r, speed));
    i++;
  }
  // If not aborted, show the full text (parsed as markdown)
  if (!typewriterAbort) {
    element.innerHTML = parseMarkdown(text);
  }
}

// New: Send message to executor (plan agent) and display result in chat
function sendToExecutor(message) {
  addMessageToChat(message, true);
  const wrapperElement = document.getElementById('quickgpt-shadow-host');
  const shadowRoot = wrapperElement.shadowRoot;
  const input = shadowRoot.querySelector('.quickgpt-input');
  const sendButton = shadowRoot.querySelector('.quickgpt-send-button');
  
  input.disabled = true;
  // Change send button to red "stop" state
  sendButton.classList.add('quickgpt-stop-state');
  sendButton.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" fill="#e74c3c"/>
      <rect x="7" y="7" width="6" height="6" rx="2" fill="#fff"/>
    </svg>
  `;

  // Show LLM loading indicator
  showLLMLoadingIndicator();

  chrome.runtime.sendMessage(
    { action: "get_plan", plan: message },
    (response) => {
      // Hide LLM loading indicator when response is received
      hideLLMLoadingIndicator();

      if (response && response.requestId) {
        activeRequestId = response.requestId;
      }
      // Only add the plan result if it is not empty/null/undefined
      if (response && response.plan && String(response.plan).trim() !== "") {
        // Use typewriter effect for AI response
        const el = addMessageToChat('', false);
        currentResponseElement = el;
        typewriterEffect(el, formatPlanForChat(response.plan), 0.5).then(() => {
          resetChatInterface();
        });
      } else if (response && response.error) {
        const el = addMessageToChat('Error: ' + response.error, false);
        currentResponseElement = el;
        resetChatInterface();
      } else {
        resetChatInterface();
      }
    }
  );
}

// Helper to format plan result for chat display (ensure markdown)
function formatPlanForChat(plan) {
  if (typeof plan === 'object') {
    let md = `**Plan Actions:**\n`;
    md += "```json\n" + JSON.stringify(plan, null, 2) + "\n```";
    return md;
  }
  return String(plan);
}

// Replace updateResponseText with a simplified version to avoid bouncing
function updateResponseText(element, text) {
  // For streaming, append the new chunk to the existing content
  element.appendChild(document.createTextNode(text));
  const chatHistory = element.closest('.quickgpt-chat-history');
  if (chatHistory) {
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }
}

// Toggle chat bar visibility
function toggleChatBar() {
  const wrapperElement = document.getElementById('quickgpt-shadow-host');
  if (!wrapperElement) {
    // Create and show the chat bar immediately
    createChatBar();
    return;
  }
  
  const shadowRoot = wrapperElement.shadowRoot;
  const chatContainer = shadowRoot.getElementById('quickgpt-chat-container');
  
  if (!chatContainer) {
    createChatBar();
    return;
  }
  
  chatContainer.classList.toggle('quickgpt-hidden');
  
  // Blur background when chat is visible, remove blur when hidden
  if (!chatContainer.classList.contains('quickgpt-hidden')) {
    document.body.classList.add('quickgpt-blur-active');
    shadowRoot.querySelector('.quickgpt-input').focus();
  } else {
    document.body.classList.remove('quickgpt-blur-active');
  }
}

// New: Helper to extract error message from error object or string
function extractErrorMessage(error) {
  if (!error) return "Unknown error";
  if (typeof error === "string") return error;
  if (typeof error === "object") {
    if (error.error && typeof error.error === "string") return error.error;
    if (error.error && error.error.message) return error.error.message;
    if (error.details && error.details.error && error.details.error.message) return error.details.error.message;
    if (error.message) return error.message;
    if (error.status && error.details && error.details.error && error.details.error.message) {
      // Special handling for Azure OpenAI 429
      return `Rate limit exceeded: ${error.details.error.message}`;
    }
    try {
      return JSON.stringify(error);
    } catch {
      return "Unknown error";
    }
  }
  return String(error);
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggle_chatbar") {
    toggleChatBar();
  } else if (request.action === "stream_update" && request.requestId === activeRequestId) {
    if (currentResponseElement) {
      // Use the chunk from the request so that each new piece is appended
      updateResponseText(currentResponseElement, request.chunk);
    }
  } else if (request.action === "stream_complete" && request.requestId === activeRequestId) {
    hideLLMLoadingIndicator();
    if (currentResponseElement) {
      // Use typewriter effect for the final response
      const resp = request.response || '';
      typewriterEffect(currentResponseElement, resp, 0.5).then(() => {
        resetChatInterface();
      });
    } else {
      resetChatInterface();
    }
  } else if (request.action === "stream_error" && request.requestId === activeRequestId) {
    hideLLMLoadingIndicator();
    if (currentResponseElement) {
      // Handle error object or string
      let errorMsg = extractErrorMessage(request.error);
      currentResponseElement.textContent += "\nError: " + errorMsg;
      // Optionally, show a status message for rate limit
      if (errorMsg.toLowerCase().includes("rate limit")) {
        showStatusMessage(errorMsg, true);
      }
    }
    resetChatInterface();
  } else if (request.action === "tabs_info") {
    // Display tab information in the page console
    console.log("Tabs information received:", request.tabs);
    // Optionally show a status message with tab count
    showStatusMessage(`Received info for ${request.tabs.length} tabs`, false);
  } else if (request.action === "plan_result") {
    hideLLMLoadingIndicator();
    // Remove duplicate chat message creation here.
    // Only reset the chat interface if needed.
    resetChatInterface();
  } else if (request.action === "plan_error") {
    hideLLMLoadingIndicator();
    console.error("Plan error:", request.error);
    
    // Display error in the chat interface
    const wrapperElement = document.getElementById('quickgpt-shadow-host');
    if (wrapperElement) {
      const shadowRoot = wrapperElement.shadowRoot;
      const chatHistory = shadowRoot.querySelector('.quickgpt-chat-history');
      
      if (chatHistory) {
        const messageEl = document.createElement('div');
        messageEl.classList.add('quickgpt-message', 'quickgpt-ai-message');
        
        const content = document.createElement('div');
        content.classList.add('quickgpt-message-content', 'quickgpt-error');
        content.textContent = "Error creating plan: " + extractErrorMessage(request.error);
        
        messageEl.appendChild(content);
        chatHistory.appendChild(messageEl);
        chatHistory.scrollTop = chatHistory.scrollHeight;
      }
    }
    
    resetChatInterface();
  }
  return false;
});

// Add this helper function for showing status messages
function showStatusMessage(message, isError = false) {
  const wrapperElement = document.getElementById('quickgpt-shadow-host');
  if (!wrapperElement) return;
  
  const shadowRoot = wrapperElement.shadowRoot;
  const chatContainer = shadowRoot.getElementById('quickgpt-chat-container');
  if (!chatContainer) return;
  
  const existingStatus = shadowRoot.querySelector('.quickgpt-status-message');
  if (existingStatus) existingStatus.remove();
  
  const statusEl = document.createElement('div');
  statusEl.classList.add('quickgpt-status-message');
  statusEl.textContent = message;
  statusEl.style.position = 'absolute';
  statusEl.style.bottom = '60px';
  statusEl.style.left = '0';
  statusEl.style.width = '100%';
  statusEl.style.padding = '10px';
  statusEl.style.backgroundColor = isError ? '#ffebee' : '#e8f5e9';
  statusEl.style.color = isError ? '#c62828' : '#2e7d32';
  statusEl.style.borderRadius = '8px';
  statusEl.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
  statusEl.style.zIndex = '1000001';
  statusEl.style.textAlign = 'center';
  
  chatContainer.appendChild(statusEl);
  
  setTimeout(() => {
    statusEl.style.opacity = '0';
    statusEl.style.transition = 'opacity 0.5s';
    setTimeout(() => statusEl.remove(), 500);
  }, 4000);
}

// Add loading indicator as a message in chat history
function showLLMLoadingIndicator() {
  const wrapperElement = document.getElementById('quickgpt-shadow-host');
  if (!wrapperElement) return;
  const shadowRoot = wrapperElement.shadowRoot;
  const chatHistory = shadowRoot.querySelector('.quickgpt-chat-history');
  if (!chatHistory) return;

  // Remove any existing indicator message
  const existing = chatHistory.querySelector('.quickgpt-llm-loading-message');
  if (existing) existing.remove();

  // Create indicator message
  const messageEl = document.createElement('div');
  messageEl.classList.add('quickgpt-message', 'quickgpt-ai-message', 'quickgpt-llm-loading-message');

  const content = document.createElement('div');
  content.classList.add('quickgpt-message-content');
  content.style.display = 'flex';
  content.style.alignItems = 'center';
  content.style.gap = '10px';

  // Use the animated circle class for the growing/shrinking effect
  content.innerHTML = `
    <span class="quickgpt-loading-circle"></span>
    <span style="font-size:14px;color:#10a37f;font-weight:500;">THINKING</span>
  `;

  messageEl.appendChild(content);
  chatHistory.appendChild(messageEl);
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Remove loading indicator message from chat history
function hideLLMLoadingIndicator() {
  const wrapperElement = document.getElementById('quickgpt-shadow-host');
  if (!wrapperElement) return;
  const shadowRoot = wrapperElement.shadowRoot;
  const chatHistory = shadowRoot.querySelector('.quickgpt-chat-history');
  if (!chatHistory) return;
  const indicator = chatHistory.querySelector('.quickgpt-llm-loading-message');
  if (indicator) indicator.remove();
}
