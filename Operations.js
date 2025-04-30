// JSON tool definitions for registering your extension’s API surface:
const BrowserTools = [
    {
      type: "function",
      function: {
        name: "createNewTab",
        description: "Opens a new tab with the given URL, optionally in the background.",
        parameters: {
          type: "object",
          properties: {
            url: { type: "string" },
            background: { type: "boolean", default: true }
          },
          required: ["url"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "closeTabs",
        description: "Closes the tab(s) with the specified ID(s).",
        parameters: {
          type: "object",
          properties: {
            tabIds: {
              type: "array",
              items: { type: "number" }
            }
          },
          required: ["tabIds"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "getAllTabDetails",
        description: "Retrieves detailed information about all currently open tabs.",
        parameters: {
          type: "object",
          properties: {}
        }
      }
    },
    {
      type: "function",
      function: {
        name: "createTabGroup",
        description: "Groups the specified tab(s) into a new tab group, optionally setting title and color.",
        parameters: {
          type: "object",
          properties: {
            tabIds: {
              type: "array",
              items: { type: "number" }
            },
            groupOptions: {
              type: "object",
              properties: {
                title: { type: "string" },
                color: { type: "string" }
              }
            }
          },
          required: ["tabIds"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "editTabGroup",
        description: "Edits the properties (title, color) of an existing tab group.",
        parameters: {
          type: "object",
          properties: {
            groupId: { type: "number" },
            groupOptions: {
              type: "object",
              properties: {
                title: { type: "string" },
                color: { type: "string" }
              },
              required: ["title", "color"]
            }
          },
          required: ["groupId", "groupOptions"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "addTabsToGroup",
        description: "Adds the specified tab(s) to an existing tab group.",
        parameters: {
          type: "object",
          properties: {
            tabIds: {
              type: "array",
              items: { type: "number" }
            },
            groupId: { type: "number" }
          },
          required: ["tabIds", "groupId"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "ungroupTabs",
        description: "Removes the specified tab(s) from whatever group they’re in.",
        parameters: {
          type: "object",
          properties: {
            tabIds: {
              type: "array",
              items: { type: "number" }
            }
          },
          required: ["tabIds"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "queryTabGroups",
        description: "Retrieves info for all tab groups, or a single group if groupId is provided.",
        parameters: {
          type: "object",
          properties: {
            groupId: { type: "number" }
          }
        }
      }
    },
    {
      type: "function",
      function: {
        name: "moveTabs",
        description: "Moves one or more tabs to a new window or index position.",
        parameters: {
          type: "object",
          properties: {
            tabIds: {
              type: "array",
              items: { type: "number" }
            },
            moveProps: {
              type: "object",
              properties: {
                windowId: { type: "number" },
                index: {
                  oneOf: [
                    { type: "number" },
                    { type: "string", enum: ["first", "last"] }
                  ]
                }
              }
            }
          },
          required: ["tabIds"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "updateTabs",
        description: "Batch-update multiple tabs; returns a status string for each update.",
        parameters: {
          type: "object",
          properties: {
            updates: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  tabId: { type: "number" },
                  updateProps: {
                    type: "object",
                    properties: {
                      url:             { type: "string" },
                      active:          { type: "boolean" },
                      highlighted:     { type: "boolean" },
                      pinned:          { type: "boolean" },
                      muted:           { type: "boolean" },
                      autoDiscardable: { type: "boolean" },
                      openerTabId:     { type: "number" },
                      selected:        { type: "boolean" }
                    },
                    additionalProperties: false
                  }
                },
                required: ["tabId", "updateProps"]
              }
            }
          },
          required: ["updates"]
        }
      }
    },

    {
        type: "function",
        function: {
          name: "createBookmark",
          description: "Creates a new bookmark (with URL) or a folder (without URL) under an optional parent folder.",
          parameters: {
            type: "object",
            properties: {
              title:    { type: "string", description: "Title of the bookmark or folder" },
              url:      { type: "string", description: "URL for bookmark; omit to create a folder" },
              parentId: { type: "string", description: "Parent folder ID (defaults to root)" }
            },
            required: ["title"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "deleteBookmarks",
          description: "Deletes the bookmark(s) with the specified ID(s).",
          parameters: {
            type: "object",
            properties: {
              bookmarkIds: { type: "array", items: { type: "string" } }
            },
            required: ["bookmarkIds"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "getAllFolders",
          description: "Retrieves all bookmark folders and returns their details as JSON.",
          parameters: { type: "object", properties: {}, additionalProperties: false }
        }
      },
      {
        type: "function",
        function: {
          name: "getAllBookmarks",
          description: "Retrieves all bookmarks (leaf nodes) and returns their details as JSON.",
          parameters: { type: "object", properties: {}, additionalProperties: false }
        }
      },
      {
        type: "function",
        function: {
          name: "getBookmarkById",
          description: "Fetches bookmark(s) by ID and returns their details as JSON.",
          parameters: {
            type: "object",
            properties: { bookmarkIds: { type: "array", items: { type: "string" } } },
            required: ["bookmarkIds"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "updateBookmark",
          description: "Updates a bookmark's title or URL and returns the updated record.",
          parameters: {
            type: "object",
            properties: {
              bookmarkId: { type: "string" },
              changes: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  url:   { type: "string" }
                },
                additionalProperties: false
              }
            },
            required: ["bookmarkId","changes"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "moveBookmark",
          description: "Moves a bookmark to a new parent folder and/or index and returns the moved record.",
          parameters: {
            type: "object",
            properties: {
              bookmarkId: { type: "string" },
              parentId:   { type: "string" },
              index:      { type: "number" }
            },
            required: ["bookmarkId"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "searchBookmarks",
          description: "Searches bookmarks by query or URL and returns matching records as JSON.",
          parameters: {
            type: "object",
            properties: { query: { type: "string" } },
            required: ["query"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "getBookmarkChildren",
          description: "Retrieves the direct children of a bookmark folder and returns them as JSON.",
          parameters: {
            type: "object",
            properties: { bookmarkId: { type: "string" } },
            required: ["bookmarkId"],
            additionalProperties: false
          }
        }
      }




  ];
  
  class BrowserManager {

    // TABS OPERATIONS
    createNewTab(url, background = true) {
      try {
        let tabUrl = url || "about:blank";
        if (typeof tabUrl !== "string") tabUrl = String(tabUrl);
        if (!/^https?:\/\//.test(tabUrl)) tabUrl = "https://" + tabUrl;
        chrome.tabs.create({ url: tabUrl, active: !background });
        return `Tab opened with URL: ${tabUrl}`;
      } catch (err) {
        return `Error opening tab: ${err.message || err}`;
      }
    }
  
    closeTabs(tabIds) {
      try {
        if (!Array.isArray(tabIds)) tabIds = [tabIds];
        tabIds = tabIds.map(id => Number(id));
        chrome.tabs.remove(tabIds);
        return `Tabs closed with IDs: ${tabIds.join(", ")}`;
      } catch (err) {
        return `Error closing tabs: ${err.message || err}`;
      }
    }
  
    getAllTabDetails() {
      try {
        return chrome.tabs
          .query({})
          .then(tabs =>
            JSON.stringify(
              tabs.map(tab => ({
                id: tab.id,
                title: tab.title,
                url: tab.url,
                status: tab.status,
                pinned: tab.pinned,
                groupId: tab.groupId,
                index: tab.index
              }))
            )
          )
          .catch(err => {
            return `Failed to get tab details: ${err.message || err}`;
          });
      } catch (err) {
        return Promise.resolve(`Error: ${err.message || err}`);
      }
    }
  
    createTabGroup(tabIds, groupOptions = {}) {
      try {
        if (!Array.isArray(tabIds)) tabIds = [tabIds];
        tabIds = tabIds.map(id => Number(id));
        return new Promise((resolve, reject) => {
          try {
            chrome.tabs.group({ tabIds }, groupId => {
              if (chrome.runtime.lastError) return resolve(`Error: ${chrome.runtime.lastError.message || chrome.runtime.lastError}`);
              if (groupOptions.title || groupOptions.color) {
                chrome.tabGroups.update(groupId, groupOptions, group => {
                  resolve(
                    `Tab group created with ID: ${groupId}, options: ${JSON.stringify(
                      groupOptions
                    )}`
                  );
                });
              } else {
                resolve(`Tab group created with ID: ${groupId}`);
              }
            });
          } catch (err) {
            resolve(`Error creating tab group: ${err.message || err}`);
          }
        });
      } catch (err) {
        return Promise.resolve(`Error: ${err.message || err}`);
      }
    }
  
    editTabGroup(groupId, groupOptions = {}) {
      try {
        if (typeof groupId !== "number" || isNaN(groupId)) {
          return Promise.resolve("Error: Invalid groupId");
        }
        return new Promise((resolve, reject) => {
          try {
            chrome.tabGroups.update(groupId, groupOptions, group => {
              if (chrome.runtime.lastError) return resolve(`Error: ${chrome.runtime.lastError.message || chrome.runtime.lastError}`);
              resolve(
                `Tab group ${groupId} edited with options: ${JSON.stringify(
                  groupOptions
                )}`
              );
            });
          } catch (err) {
            resolve(`Error editing tab group: ${err.message || err}`);
          }
        });
      } catch (err) {
        return Promise.resolve(`Error: ${err.message || err}`);
      }
    }
  
    addTabsToGroup(tabIds, groupId) {
      try {
        if (!Array.isArray(tabIds)) tabIds = [tabIds];
        tabIds = tabIds.map(id => Number(id));
        return new Promise((resolve, reject) => {
          try {
            chrome.tabs.group({ tabIds, groupId }, newGroupId => {
              if (chrome.runtime.lastError) return resolve(`Error: ${chrome.runtime.lastError.message || chrome.runtime.lastError}`);
              resolve(`Tabs added to group ID: ${newGroupId}`);
            });
          } catch (err) {
            resolve(`Error adding tabs to group: ${err.message || err}`);
          }
        });
      } catch (err) {
        return Promise.resolve(`Error: ${err.message || err}`);
      }
    }
  
    ungroupTabs(tabIds) {
      try {
        if (!Array.isArray(tabIds)) tabIds = [tabIds];
        tabIds = tabIds.map(id => Number(id));
        return new Promise((resolve, reject) => {
          try {
            chrome.tabs.ungroup(tabIds, () => {
              if (chrome.runtime.lastError) return resolve(`Error: ${chrome.runtime.lastError.message || chrome.runtime.lastError}`);
              resolve(`Tabs ungrouped: ${tabIds.join(", ")}`);
            });
          } catch (err) {
            resolve(`Error ungrouping tabs: ${err.message || err}`);
          }
        });
      } catch (err) {
        return Promise.resolve(`Error: ${err.message || err}`);
      }
    }
  
    queryTabGroups(groupId = null) {
      try {
        return new Promise((resolve, reject) => {
          try {
            if (groupId != null) {
              chrome.tabGroups.get(groupId, group => {
                if (chrome.runtime.lastError) {
                  resolve(`No tab group with ID: ${groupId}`);
                } else {
                  resolve(`Group ${groupId}: ${JSON.stringify(group)}`);
                }
              });
            } else {
              chrome.tabGroups.query({}, groups => {
                if (chrome.runtime.lastError) {
                  resolve("No tab groups found");
                } else {
                  resolve(`All tab groups: ${JSON.stringify(groups)}`);
                }
              });
            }
          } catch (err) {
            resolve(`Error querying tab groups: ${err.message || err}`);
          }
        });
      } catch (err) {
        return Promise.resolve(`Error: ${err.message || err}`);
      }
    }
  
    moveTabs(tabIds, moveProps = {}) {
      try {
        if (!Array.isArray(tabIds)) tabIds = [tabIds];
        tabIds = tabIds.map(id => Number(id));
        return new Promise((resolve, reject) => {
          try {
            chrome.tabs.move(tabIds, moveProps, movedTabs => {
              if (chrome.runtime.lastError) return resolve(`Error: ${chrome.runtime.lastError.message || chrome.runtime.lastError}`);
              const moved = Array.isArray(movedTabs) ? movedTabs : [movedTabs];
              const ids = moved.map(tab => tab.id).join(", ");
              resolve(`Tabs moved with IDs: ${ids}`);
            });
          } catch (err) {
            resolve(`Error moving tabs: ${err.message || err}`);
          }
        });
      } catch (err) {
        return Promise.resolve(`Error: ${err.message || err}`);
      }
    }
  
    _validateUpdateProps(updateProps) {
      try {
        const schema = {
          url: "string",
          active: "boolean",
          highlighted: "boolean",
          pinned: "boolean",
          muted: "boolean",
          autoDiscardable: "boolean",
          openerTabId: "number",
          selected: "boolean"
        };
        for (const [key, val] of Object.entries(updateProps)) {
          if (!(key in schema)) {
            throw new TypeError(`Invalid update property “${key}”`);
          }
          if (typeof val !== schema[key]) {
            throw new TypeError(
              `Property “${key}” must be a ${schema[key]}, got ${typeof val}`
            );
          }
        }
      } catch (err) {
        throw err;
      }
    }
  
    updateTabs(updates) {
      try {
        if (!Array.isArray(updates) || updates.length === 0) {
          return Promise.resolve("Error: Must pass a non-empty array of {tabId, updateProps}");
        }
        const calls = updates.map(({ tabId, updateProps }) =>
          new Promise((res, rej) => {
            try {
              this._validateUpdateProps(updateProps);
            } catch (e) {
              return res(`Error: ${e.message || e}`);
            }
            try {
              chrome.tabs.update(Number(tabId), updateProps, tab => {
                if (chrome.runtime.lastError) {
                  return res(`Error: ${chrome.runtime.lastError.message || chrome.runtime.lastError}`);
                }
                res(`Tab ${tab.id} updated with ${JSON.stringify(updateProps)}`);
              });
            } catch (err) {
              res(`Error updating tab: ${err.message || err}`);
            }
          })
        );
        return Promise.all(calls).then(msgs => msgs.join("; "));
      } catch (err) {
        return Promise.resolve(`Error: ${err.message || err}`);
      }
    }


    // BOOKMARKS OPERATIONS

    createBookmark(title, url, parentId) {
      try {
        const details = { title };
        if (url) details.url = url;
        if (parentId) details.parentId = parentId;
        return new Promise((resolve, reject) => {
          try {
            chrome.bookmarks.create(details, node => {
              if (chrome.runtime.lastError) return resolve(`Error: ${chrome.runtime.lastError.message || chrome.runtime.lastError}`);
              const type = node.url ? 'Bookmark' : 'Folder';
              resolve(`${type} created: ${JSON.stringify(node)}`);
            });
          } catch (err) {
            resolve(`Error creating bookmark: ${err.message || err}`);
          }
        });
      } catch (err) {
        return Promise.resolve(`Error: ${err.message || err}`);
      }
    }
  
    deleteBookmarks(bookmarkIds) {
      try {
        if (!Array.isArray(bookmarkIds)) bookmarkIds = [bookmarkIds];
        bookmarkIds = bookmarkIds.map(String);
        const ops = bookmarkIds.map(id => new Promise((res, rej) => {
          try {
            chrome.bookmarks.remove(id, () => {
              if (chrome.runtime.lastError) return res(`Error: ${chrome.runtime.lastError.message || chrome.runtime.lastError}`);
              res(`Deleted: ${id}`);
            });
          } catch (err) {
            res(`Error deleting bookmark: ${err.message || err}`);
          }
        }));
        return Promise.all(ops).then(msgs => msgs.join('; '));
      } catch (err) {
        return Promise.resolve(`Error: ${err.message || err}`);
      }
    }
  
    getAllFolders() {
      try {
        return new Promise((resolve, reject) => {
          try {
            chrome.bookmarks.getTree(tree => {
              if (chrome.runtime.lastError) return resolve(`Error: ${chrome.runtime.lastError.message || chrome.runtime.lastError}`);
              const folders = [];
              const traverse = nodes => {
                for (const n of nodes) {
                  if (!n.url) {
                    folders.push({
                      id: n.id,
                      index: n.index,
                      parentId: n.parentId,
                      title: n.title,
                      dateAdded: n.dateAdded,
                      dateGroupModified: n.dateGroupModified
                    });
                  }
                  if (n.children) traverse(n.children);
                }
              };
              traverse(tree[0].children || []);
              resolve(`Folders: ${JSON.stringify(folders)}`);
            });
          } catch (err) {
            resolve(`Error getting folders: ${err.message || err}`);
          }
        });
      } catch (err) {
        return Promise.resolve(`Error: ${err.message || err}`);
      }
    }
  
    getAllBookmarks() {
      try {
        return new Promise((resolve, reject) => {
          try {
            chrome.bookmarks.getTree(tree => {
              if (chrome.runtime.lastError) return resolve(`Error: ${chrome.runtime.lastError.message || chrome.runtime.lastError}`);
              const bookmarks = [];
              const traverse = nodes => {
                for (const n of nodes) {
                  if (n.url) {
                    bookmarks.push({
                      id: n.id,
                      index: n.index,
                      parentId: n.parentId,
                      title: n.title,
                      url: n.url,
                      dateAdded: n.dateAdded
                    });
                  }
                  if (n.children) traverse(n.children);
                }
              };
              traverse(tree[0].children || []);
              resolve(`Bookmarks: ${JSON.stringify(bookmarks)}`);
            });
          } catch (err) {
            resolve(`Error getting bookmarks: ${err.message || err}`);
          }
        });
      } catch (err) {
        return Promise.resolve(`Error: ${err.message || err}`);
      }
    }
  
    getBookmarkById(bookmarkIds) {
      try {
        if (!Array.isArray(bookmarkIds)) bookmarkIds = [bookmarkIds];
        bookmarkIds = bookmarkIds.map(String);
        return new Promise((resolve, reject) => {
          try {
            chrome.bookmarks.get(bookmarkIds, results => {
              if (chrome.runtime.lastError) return resolve(`Error: ${chrome.runtime.lastError.message || chrome.runtime.lastError}`);
              resolve(`Found: ${JSON.stringify(results)}`);
            });
          } catch (err) {
            resolve(`Error getting bookmark by ID: ${err.message || err}`);
          }
        });
      } catch (err) {
        return Promise.resolve(`Error: ${err.message || err}`);
      }
    }
  
    updateBookmark(bookmarkId, changes) {
      try {
        return new Promise((resolve, reject) => {
          try {
            chrome.bookmarks.update(bookmarkId, changes, node => {
              if (chrome.runtime.lastError) return resolve(`Error: ${chrome.runtime.lastError.message || chrome.runtime.lastError}`);
              resolve(`Bookmark updated: ${JSON.stringify(node)}`);
            });
          } catch (err) {
            resolve(`Error updating bookmark: ${err.message || err}`);
          }
        });
      } catch (err) {
        return Promise.resolve(`Error: ${err.message || err}`);
      }
    }
  
    moveBookmark({ bookmarkId, parentId, index }) {
      try {
        return new Promise((resolve, reject) => {
          try {
            const destination = {};
            if (parentId !== undefined) destination.parentId = parentId;
            if (index !== undefined) destination.index = index;
            chrome.bookmarks.move(bookmarkId, destination, node => {
              if (chrome.runtime.lastError) return resolve(`Error: ${chrome.runtime.lastError.message || chrome.runtime.lastError}`);
              resolve(`Bookmark moved: ${JSON.stringify(node)}`);
            });
          } catch (err) {
            resolve(`Error moving bookmark: ${err.message || err}`);
          }
        });
      } catch (err) {
        return Promise.resolve(`Error: ${err.message || err}`);
      }
    }
  
    searchBookmarks(query) {
      try {
        return new Promise((resolve, reject) => {
          try {
            chrome.bookmarks.search({ query }, nodes => {
              if (chrome.runtime.lastError) return resolve(`Error: ${chrome.runtime.lastError.message || chrome.runtime.lastError}`);
              resolve(`Search results: ${JSON.stringify(nodes)}`);
            });
          } catch (err) {
            resolve(`Error searching bookmarks: ${err.message || err}`);
          }
        });
      } catch (err) {
        return Promise.resolve(`Error: ${err.message || err}`);
      }
    }
  
    getBookmarkChildren(bookmarkId) {
      try {
        return new Promise((resolve, reject) => {
          try {
            chrome.bookmarks.getChildren(bookmarkId, nodes => {
              if (chrome.runtime.lastError) return resolve(`Error: ${chrome.runtime.lastError.message || chrome.runtime.lastError}`);
              resolve(`Children: ${JSON.stringify(nodes)}`);
            });
          } catch (err) {
            resolve(`Error getting bookmark children: ${err.message || err}`);
          }
        });
      } catch (err) {
        return Promise.resolve(`Error: ${err.message || err}`);
      }
    }
  }
  
  // Export for use elsewhere
  export { BrowserManager, BrowserTools };
