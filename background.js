import {Executor} from "./aiagents.js";

// Listen for the keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-chatbar") {
    // Send a message to the content script to toggle the chat bar
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "toggle_chatbar" })
          .catch(error => console.log("Error sending message:", error));
      }
    });
  }
});

// Keep track of active streams for stop functionality
const activeStreams = new Map();

// Track Executor instances by requestId for aborting
const activeExecutors = new Map();

// Handle messages from content script (for API calls)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "query_openai") {
    // Generate a unique ID for this request
    const requestId = Date.now().toString();
    
    // Create an AbortController to allow stopping the stream
    const controller = new AbortController();
    activeStreams.set(requestId, controller);
    
    // Send the initial response with the request ID
    sendResponse({ requestId });

    // Handle callback functions for stream processing
    const onUpdate = (requestId, chunk, fullResponse) => {
      chrome.tabs.sendMessage(sender.tab.id, { 
        action: "stream_update", 
        requestId,
        chunk: chunk,
        fullResponse: fullResponse 
      });
    };
    
    const onComplete = (requestId, response) => {
      chrome.tabs.sendMessage(sender.tab.id, { 
        action: "stream_complete", 
        requestId,
        response: response 
      });
      
      // Clean up
      activeStreams.delete(requestId);
    };
    
    const onError = (requestId, error) => {
      chrome.tabs.sendMessage(sender.tab.id, { 
        action: "stream_error", 
        requestId,
        error: error 
      });
      
      // Clean up
      activeStreams.delete(requestId);
    };


    queryOpenAI(sender.tab.id, request.message, request.model, controller)
      .then(response => {
        return processStream(
          response, 
          sender.tab.id, 
          requestId, 
          onUpdate, 
          onComplete, 
          onError, 
          controller.signal
        );
      })
      .catch(error => {
        console.error("API error:", error);
        
        // Only send error if it's not an abort error
        if (error.name !== "AbortError") {
          chrome.tabs.sendMessage(sender.tab.id, { 
            action: "stream_error", 
            requestId,
            error: error.toString() 
          });
        }
        
        // Clean up
        activeStreams.delete(requestId);
      });
    
    return false; // Keep the message channel open for async response
  }
  
  
  // Handle clearing chat history
  else if (request.action === "clear_history") {
    const tabId = sender.tab.id;
    const cleared = clearMessageHistory(tabId);
    sendResponse({ cleared });
    return false;
  }
  
 
  // New: Handle get_plan request from content script (from chat input)
  else if (request.action === "get_plan") {
    try {
      const executor = new Executor();
      const planInput = request.plan || "";
      const controller = new AbortController();
      const requestId = Date.now().toString();
      activeExecutors.set(requestId, controller);
      executor.executePlan(planInput, controller.signal)
        .then(planResult => {
          // Send result back to content script for chat display
          if (sender.tab && sender.tab.id) {
            chrome.tabs.sendMessage(sender.tab.id, { action: "plan_result", plan: planResult });
          }
          sendResponse({ plan: planResult, requestId });
          activeExecutors.delete(requestId);
        })
        .catch(error => {
          if (sender.tab && sender.tab.id) {
            chrome.tabs.sendMessage(sender.tab.id, { action: "plan_error", error: error?.toString?.() || "Unknown error" });
          }
          sendResponse({ error: error?.toString?.() || "Unknown error", requestId });
          activeExecutors.delete(requestId);
        });
      return true; // Keep the message channel open for async response
    } catch (err) {
      sendResponse({ error: err?.toString?.() || "Unknown error" });
      return false;
    }
  }
  
  // Handle stop request
  else if (request.action === "stop_generation") {
    const { requestId } = request;
    
    if (activeStreams.has(requestId)) {
      // Abort the fetch request
      activeStreams.get(requestId).abort();
      activeStreams.delete(requestId);
    }
    // Abort Executor actions
    if (activeExecutors.has(requestId)) {
      activeExecutors.get(requestId).abort();
      activeExecutors.delete(requestId);
    }
    sendResponse({ stopped: true });
    return false; 
  }
  
});

