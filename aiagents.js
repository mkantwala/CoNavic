import { BrowserManager, BrowserTools } from "./Operations.js";

class Executor {

  constructor() {    
    
    this.BASE_URL = "https://text.pollinations.ai/openai";
    this.model = "openai-large"; // "GPT 4.1 mini good for speed and cost and relevency"
    this.referrer =  "BrowserBrain Extension";
    this.tools = BrowserTools

    this.browserManager = new BrowserManager();

    this.headers = {
      "Content-Type": "application/json"
    };

    this.messages = [
    
      { role: "system", content: "you are helpful assistant. Ensure your responses are always in markdown format with proper formatting." },
      
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
      // "model": "openai-large",
      // "model": "openai-reasoning",
      "model": "openai",
      "messages": this.messages,
      "private": true, 
      "referrer": "QuickGPT Extension",
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

    // Check for abort after fetch
    if (abortSignal && abortSignal.aborted) {
      throw new Error("Execution aborted");
    }

    const output = await response.json();
    console.log("API Response:", output);
    // tool call
    if (output.choices[0]["finish_reason"] === "tool_calls") {

      console.log("Tool call detected. Executing tools...");
      const toolCalls = [];
      const tmp = [];

      // Correctly iterate over the array of tool_calls
      for (const tool of output.choices[0].message.tool_calls) {

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
        const args = Object.values(JSON.parse(tool.function.arguments));
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
      console.log("Output:", output.choices[0].message.content);
      return output.choices[0].message.content;
    }
      

  };



}

export { Executor };