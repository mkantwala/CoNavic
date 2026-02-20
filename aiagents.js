import { BrowserManager, BrowserTools } from "./Operations.js";

class Executor {

  constructor() {    
    

    this.SYSTEM_PROMPT = `
You are **CoNavic**, a professional, helpful, and efficient AI-powered browser assistant.

Your role is to assist users by answering questions, automating browser tasks, and managing tabs or bookmarks—all using natural language commands. You operate within the user's browser environment securely and privately.

Always respond in **Markdown format**, using proper structure, bullet points, and code blocks when necessary for readability.

### Tone & Style Guidelines:
- Be concise, professional, and user-friendly.
- Avoid excessive verbosity or casual phrasing.
- When answering questions, format responses clearly with headers, bullets, or examples.
- If performing a browser action (e.g., "Close all tabs except this one"), confirm the action and offer next steps if appropriate.

### Core Capabilities:
- **Answer questions** using general knowledge and AI reasoning.

- **Manage browser tabs**, such as:
  - "Open GitHub in a new tab"
  - "Close all tabs with YouTube"
  - "Group tabs from the same domain"
- **Organize bookmarks**, such as:
  - "Bookmark this page"
  - "Create folder named 'Research'"
  - "Move this bookmark to folder 'Work'"

### Restrictions:
- Do not reference or rely on any information not available through the assistant.
- Do not generate responses that suggest access to external servers or databases (beyond the AI model).

End every response with a helpful, neutral tone. If a request cannot be fulfilled, politely explain why and offer alternatives.
   
    `;
    this.BASE_URL = "https://text.pollinations.ai/openai";
    this.model = "openai-large"; // "GPT 4.1 mini good for speed and cost and relevency"
    this.referrer =  "CoNavic Extension";
    this.tools = BrowserTools

    this.browserManager = new BrowserManager();

    this.headers = {
      "Content-Type": "application/json"
    };

    this.messages = [
    
      { role: "system", content: this.SYSTEM_PROMPT },
      
    ];


  };


  async executePlan(plan, abortSignal) {
    // if plan is alrready json, no need to parse
    if( typeof plan === 'string') {
      this.messages.push({role: "user", content: plan});
    }
    else if (Array.isArray(plan)) {

      this.messages.push(...plan);

    }
    else {  
      this.messages.push(plan);
    }

    // Check for abort before starting
    if (abortSignal && abortSignal.aborted) {
      throw new Error("Execution aborted");
    }

    const payload = {
      "model": "openai-large",
      // "model": "openai-reasoning",
      // "model": "openai",
      "messages": this.messages,
      "private": true, 
      "referrer": "CoNavic Extension",
      "tools": this.tools,
      "tool_choice": "auto",
      "stream": false  
  }

    // Use fetch with abortSignal if provided
    const response = await fetch(
      `${this.BASE_URL}`,
      {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(payload),
        signal: abortSignal
      }

    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Backend request failed (${response.status}): ${errorBody || response.statusText}`);
    }

    // Check for abort after fetch
    if (abortSignal && abortSignal.aborted) {
      throw new Error("Execution aborted");
    }

    const output = await response.json();
    if (!output || !Array.isArray(output.choices) || output.choices.length === 0) {
      throw new Error("Backend returned an invalid response payload.");
    }

    const firstChoice = output.choices[0];
    if (!firstChoice.message) {
      throw new Error("Backend response did not contain a message.");
    }

    console.log("API Response:", output);
    // tool call
    if (firstChoice["finish_reason"] === "tool_calls") {

      if (!Array.isArray(firstChoice.message.tool_calls) || firstChoice.message.tool_calls.length === 0) {
        throw new Error("Backend requested tool execution but did not provide tool call details.");
      }

      console.log("Tool call detected. Executing tools...");
      const toolCalls = [];
      const tmp = [];

      // Correctly iterate over the array of tool_calls
      for (const tool of firstChoice.message.tool_calls) {

        toolCalls.push(
          {
            id: tool.id,
            type: tool.type,
            function: tool.function,
          }
        );

        console.log("Implementing the task:", tool.function.name, "with parameters:", tool.function.arguments);

        // Check for abort before tool execution
        if (abortSignal && abortSignal.aborted) {
          throw new Error("Execution aborted");
        }

        const fn = this.browserManager[tool.function.name];
        if (typeof fn !== "function") {
          throw new Error(`Unsupported tool requested by backend: ${tool.function.name}`);
        }

        let parsedArguments = {};
        try {
          parsedArguments = JSON.parse(tool.function.arguments || "{}");
        } catch {
          throw new Error(`Invalid tool arguments for ${tool.function.name}`);
        }

        const args = Object.values(parsedArguments);
        // Await tool call, pass abortSignal if function supports it
        const task_response = await fn.apply(this.browserManager, args)

        console.log("Tool call executed successfully.");
        
        tmp.push(
          {
            "role": "tool",
            "tool_call_id": tool.id,
            "name": tool.function.name,
            "content": task_response
          }
        );
        
      };      
      
      this.messages.push (
        {
          role: "assistant",
          content: null ,
          tool_calls: toolCalls
        },
      );

      console.log("Tool calls executed successfully. Continuing with the next steps...");
      // Pass abortSignal recursively
      return this.executePlan(tmp, abortSignal);

    }
    
    else {
      console.log("Execution finished successfully.");
      console.log("Output:", firstChoice.message.content);
      return firstChoice.message.content || "Task completed successfully.";
    }
      

  };



}

export { Executor };
