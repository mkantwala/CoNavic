# CoNavic: Free & Open Source AI-Powered Browser Assistant

**CoNavic** is a free, open-source browser extension that brings the power of ChatGPT and browser automation directly to your fingertips.  
Instantly access AI assistance, manage tabs, and organize bookmarks using natural language—all securely within your browser.

---

## Why CoNavic?

Imagine this: you're deep in research, juggling 30+ tabs across multiple windows.  
You're switching between docs, articles, dashboards, and emails. Bookmarks? A scattered mess lost in folders you forgot existed.  
Closing one tab feels like a gamble.

Sound familiar?

> “I just needed to find one tab... and somehow opened three more.”  
> — *Every browser user, ever*

This is where **CoNavic** comes in.

---

## 🚀 Features

- **Universal Chat Bar:** Open the assistant anywhere with <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>K</kbd>
- **ChatGPT Integration:** Ask questions and get markdown-formatted answers instantly
- **Browser Automation:** Open, close, group, move tabs and more—just by typing a command
- **Bookmark Management:** Create folders, organize bookmarks, and move items using natural language
- **No API Key Required:** Uses a free public LLM endpoint (Pollinations.AI) for AI responses

---

## 🛠️ Installation

# ADD FROM CHROME WEB STORE

https://chrome.google.com/webstore/devconsole/02f96fdd-8997-43fa-b315-cb3d877ffa73/onaeonbmbaifcinofnfpkapknadmndep
<br><br>
<b>OR</b>
<br><br>

1. **Clone or Download this Repository**
   ```sh
   git clone https://github.com/mkantwala/CoNavic.git
   ```
   Or download and extract the ZIP.

2. **Load as Unpacked Extension**
   - Open Chrome or any Chromium-based browser
   - Go to `chrome://extensions/`
   - Enable **Developer mode**
   - Click **Load unpacked** and select the `CoNavic` folder

3. **You're Ready!**
   - The CoNavic icon will appear in your browser toolbar

---


# Demos

<br/><br/>

[![CoNavic](https://github.com/mkantwala/CoNavic/blob/master/Demo-ezgif.com-video-to-gif-converter.gif)](https://youtu.be/H4EFP_7A3Yw)

<br/><br/>


## 💡 How to Use

1. **Open the Chat Bar**  
   Press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>K</kbd> on any page

2. **Ask Anything**  
   Examples:
   - `Open GitHub in a new tab`
   - `Group all tabs from YouTube`
   - `Summarize this article`
   - `Bookmark this page in Research`

3. **AI-Powered Responses**  
   - Get instant answers from ChatGPT
   - All responses are formatted in markdown for easy reading

4. **Control the Experience**
   - Use the stop button to halt long responses
   - Clear chat history as needed

---

## 🧩 Supported Commands

### 🗂️ Tab Management
- "Open [website] in a new tab"
- "Close all tabs except this one"
- "Group all tabs from GitHub"
- "Move tab to a new window"

### 🔖 Bookmark Management
- "Bookmark this page"
- "Create a folder named 'Work'"
- "Move bookmark X to folder Y"

### 💬 General Chat
- "Explain quantum computing in simple terms"
- "What is the difference between JavaScript and TypeScript?"

---

## 🔒 Privacy & Security

- **No tracking, no ads, no data collection**

---

## 👐 Contributing

CoNavic is open source and welcomes contributions!

- Fork this repo and submit pull requests
- Report bugs or request features via [GitHub Issues](https://github.com/mkantwala/CoNavic/issues)
- All code is MIT licensed

---

## 📦 Project Structure

```
CoNavic/
├── background.js      # Extension background logic
├── content.js         # Content script for chat UI
├── aiagents.js        # AI agent and executor logic
├── Operations.js      # Browser automation functions
├── popup.html         # Extension popup UI
├── popup.js           # Popup logic
├── content.css        # Styles for chat UI
├── manifest.json      # Extension manifest
├── icons/             # Extension icons
└── README.md          
```

---

## 📃 License

This project is licensed under the [MIT License](LICENSE).  
Free for personal and commercial use.

---

## 🌍 Community & Support

- [GitHub Repository](https://github.com/mkantwala/CoNavic)
- Open issues or discussions for help and suggestions
- Contact support@suchtech.ca for any queries.

---

**Enjoy using CoNavic! If you find it useful, star the repo and share it with others.**

<a href="https://www.producthunt.com/posts/conavic?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-conavic" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=960016&theme=light&t=1746106996007" alt="CoNavic - AI&#0045;Powered&#0032;Browser&#0032;Assistant | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>
