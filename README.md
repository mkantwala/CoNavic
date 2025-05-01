**CoNavic** is a free, open-source browser extension that brings the power of ChatGPT and browser automation directly to your fingertips. Instantly access AI assistance, manage tabs, and organize bookmarks using natural language—all securely within your browser.

---

## 🚀 Features

- **Universal Chat Bar:** Open the chat bar anywhere with <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>K</kbd>
- **ChatGPT Integration:** Ask questions and get instant, markdown-formatted answers
- **Browser Automation:** Open/close tabs, group tabs, move tabs, and more using natural language
- **Bookmark Management:** Organize bookmarks and folders with AI commands
- **Secure & Private:** All actions are performed locally in your browser; no data is sent to third parties except for LLM queries
- **No API Key Required:** Uses a free, public LLM endpoint for AI responses

---

## 🛠️ Installation

1. **Clone or Download this Repository**
   ```sh
   git clone https://github.com/mkantwala/CoNavic.git
   ```
   Or download and extract the ZIP.

2. **Load as Unpacked Extension**
   - Open your browser (Chrome or Chromium-based)
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `CoNavic` folder

3. **You're Ready!**
   - The CoNavic icon will appear in your browser toolbar.

---

## 💡 How to Use

1. **Open the Chat Bar:**  
   Press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>K</kbd> on any page.

2. **Ask Anything:**  
   Type your question or command (e.g., `Open GitHub in a new tab`).

3. **AI-Powered Actions:**  
   - Get instant answers from ChatGPT
   - Automate tab and bookmark management
   - All responses are formatted in markdown for readability

4. **Stop or Clear:**  
   - Use the stop button to halt long responses
   - Clear chat history as needed

---

## 🧩 Supported Commands

- **Tab Management:**  
  - "Open [website] in a new tab"
  - "Close all tabs except this one"
  - "Group all tabs from GitHub"
  - "Move tab to a new window"
- **Bookmark Management:**  
  - "Bookmark this page"
  - "Create a folder named 'Work'"
  - "Move bookmark X to folder Y"
- **General Chat:**  
  - "Summarize this article"
  - "Explain quantum computing in simple terms"

---

## 🔒 Privacy & Security

- All browser actions (tabs, bookmarks) are performed locally
- Only your chat queries are sent to the LLM endpoint for AI responses
- No tracking, no ads, no data collection

---

## 👐 Contributing

CoNavic is open source and welcomes contributions!

- **Fork this repo** and submit pull requests
- **Report bugs** or request features via [GitHub Issues](https://github.com/mkantwala/CoNavic/issues)
- All code is MIT licensed

---

## 📦 Project Structure

```
quickgpt/
├── background.js      # Extension background logic
├── content.js         # Content script for chat UI
├── aiagents.js        # AI agent and executor logic
├── Operations.js      # Browser automation functions
├── popup.html         # Extension popup UI
├── popup.js           # Popup logic
├── content.css        # Styles for chat UI
├── manifest.json      # Extension manifest
├── icons/             # Extension icons
└── README.md          # This file
```

---

## 📃 License

This project is licensed under the [MIT License](LICENSE).  
Free for personal and commercial use.

---

## 🌍 Community & Support

- [GitHub Repository](https://github.com/mkantwala/CoNavic)
- Open issues or discussions for help and suggestions

---

**Enjoy using CoNavic! If you find it useful, star the repo and share with others.**
