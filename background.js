import {Executor} from "./aiagents.js";

// Listen for the keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-chatbar") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "toggle_chatbar" })
          .catch(error => console.log("Error sending message:", error));
      }
    });
  }
});

const activeStreams = new Map();
const activeExecutors = new Map();

function normalizeError(error) {
  if (!error) return "Unknown error";
  if (typeof error === "string") return error;
  return error.message || error.toString?.() || "Unknown error";
}

function sendTabMessage(tabId, payload) {
  if (!tabId) return;
  chrome.tabs.sendMessage(tabId, payload).catch(() => {
    // Ignore failures when the tab has navigated or content script is unavailable.
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const tabId = sender?.tab?.id;

  if (request.action === "query_openai") {
    const requestId = Date.now().toString();
    const controller = new AbortController();
    activeStreams.set(requestId, controller);

    sendResponse({ requestId });

    queryOpenAI(tabId, request.message, request.model, controller)
      .then(response => {
        return processStream(
          response,
          tabId,
          requestId,
          (id, chunk, fullResponse) => {
            sendTabMessage(tabId, {
              action: "stream_update",
              requestId: id,
              chunk,
              fullResponse
            });
          },
          (id, responseText) => {
            sendTabMessage(tabId, {
              action: "stream_complete",
              requestId: id,
              response: responseText
            });
            activeStreams.delete(id);
          },
          (id, error) => {
            sendTabMessage(tabId, {
              action: "stream_error",
              requestId: id,
              error: normalizeError(error)
            });
            activeStreams.delete(id);
          },
          controller.signal
        );
      })
      .catch(error => {
        if (error.name !== "AbortError") {
          sendTabMessage(tabId, {
            action: "stream_error",
            requestId,
            error: normalizeError(error)
          });
        }
        activeStreams.delete(requestId);
      });

    return false;
  }

  if (request.action === "clear_history") {
    const cleared = clearMessageHistory(tabId);
    sendResponse({ cleared });
    return false;
  }

  if (request.action === "get_plan") {
    try {
      const executor = new Executor();
      const planInput = request.plan || "";
      const controller = new AbortController();
      const requestId = Date.now().toString();
      activeExecutors.set(requestId, controller);

      executor.executePlan(planInput, controller.signal)
        .then(planResult => {
          sendTabMessage(tabId, { action: "plan_result", plan: planResult, requestId });
          sendResponse({ plan: planResult, requestId });
          activeExecutors.delete(requestId);
        })
        .catch(error => {
          const normalizedError = normalizeError(error);
          sendTabMessage(tabId, { action: "plan_error", error: normalizedError, requestId });
          sendResponse({ error: normalizedError, requestId });
          activeExecutors.delete(requestId);
        });

      return true;
    } catch (error) {
      sendResponse({ error: normalizeError(error) });
      return false;
    }
  }

  if (request.action === "stop_generation") {
    const { requestId } = request;

    if (activeStreams.has(requestId)) {
      activeStreams.get(requestId).abort();
      activeStreams.delete(requestId);
    }

    if (activeExecutors.has(requestId)) {
      activeExecutors.get(requestId).abort();
      activeExecutors.delete(requestId);
    }

    sendResponse({ stopped: true });
    return false;
  }
});
