/**
 * Unified LLM Client for Nightshift AI.
 * Uses native Node 22+ fetch to call Gemini or OpenAI, or returns deterministic
 * rich mocks when running in dry-run mode or when no API keys are present.
 */

export class LLMClient {
  constructor({ budgetGuard, dryRun = false, preferredModel = "gemini-2.5-flash" } = {}) {
    this.budgetGuard = budgetGuard;
    this.dryRun = dryRun;
    this.preferredModel = preferredModel;
  }

  /**
   * Main completion method.
   * @param {Object} options
   * @param {string} options.agentName - Identifier of caller agent
   * @param {string} options.systemPrompt - High level instructions
   * @param {string} options.userPrompt - Task input
   * @param {Object} [options.mockGenerator] - Function generating mock response if dry-run
   * @param {boolean} [options.jsonMode=true] - Whether output should be JSON
   */
  async generate({ agentName, systemPrompt, userPrompt, mockGenerator, jsonMode = true }) {
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    // Use mock if explicit dry-run or if neither key is available
    if (this.dryRun || (!geminiKey && !openaiKey)) {
      const mockResult = mockGenerator ? mockGenerator() : { status: "success", simulated: true };
      
      // Record simulated tokens (conservative estimate: ~800 prompt, ~1200 completion)
      this.budgetGuard.recordUsage(agentName, "mock-mode", 800, 1200);
      return {
        text: typeof mockResult === "string" ? mockResult : JSON.stringify(mockResult, null, 2),
        data: typeof mockResult === "object" ? mockResult : null,
        isSimulated: true,
      };
    }

    // Real API execution: Prefer Gemini if key present, otherwise OpenAI
    if (geminiKey) {
      return await this._callGemini({ agentName, systemPrompt, userPrompt, apiKey: geminiKey, jsonMode });
    } else {
      return await this._callOpenAI({ agentName, systemPrompt, userPrompt, apiKey: openaiKey, jsonMode });
    }
  }

  async _callGemini({ agentName, systemPrompt, userPrompt, apiKey, jsonMode }) {
    const candidateModels = Array.from(new Set([
      this.preferredModel || "gemini-flash-lite-latest",
      "gemini-flash-lite-latest",
      "gemini-flash-latest"
    ]));

    let lastError = null;

    for (const model of candidateModels) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const body = {
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\n---\nTask:\n${userPrompt}` }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: this.budgetGuard.maxTokensPerAgent,
          responseMimeType: jsonMode ? "application/json" : "text/plain",
        },
      };

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorText = await response.text();
          // If 503 (high demand) or 429, try next model
          if (response.status === 503 || response.status === 429) {
            lastError = new Error(`[Gemini API Error ${response.status}] ${errorText}`);
            continue;
          }
          throw new Error(`[Gemini API Error ${response.status}] ${errorText}`);
        }

        const json = await response.json();
        const candidate = json.candidates?.[0];
        const textOutput = candidate?.content?.parts?.[0]?.text || "";
        
        const usage = json.usageMetadata || {};
        const promptTokens = usage.promptTokenCount || 500;
        const completionTokens = usage.candidatesTokenCount || 500;

        this.budgetGuard.recordUsage(agentName, model, promptTokens, completionTokens);

        let parsedData = null;
        if (jsonMode) {
          try {
            parsedData = JSON.parse(textOutput);
          } catch (e) {
            // Partial JSON fallback if needed
          }
        }

        return {
          text: textOutput,
          data: parsedData,
          isSimulated: false,
          modelUsed: model,
        };
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error("All Gemini candidate models failed.");
  }

  async _callOpenAI({ agentName, systemPrompt, userPrompt, apiKey, jsonMode }) {
    const model = "gpt-4o-mini";
    const url = "https://api.openai.com/v1/chat/completions";

    const body = {
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens: this.budgetGuard.maxTokensPerAgent,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`[OpenAI API Error ${response.status}] ${errorText}`);
    }

    const json = await response.json();
    const choice = json.choices?.[0];
    const textOutput = choice?.message?.content || "";
    
    const usage = json.usage || {};
    const promptTokens = usage.prompt_tokens || 500;
    const completionTokens = usage.completion_tokens || 500;

    this.budgetGuard.recordUsage(agentName, model, promptTokens, completionTokens);

    let parsedData = null;
    if (jsonMode) {
      try {
        parsedData = JSON.parse(textOutput);
      } catch (e) {
        // Fallback
      }
    }

    return {
      text: textOutput,
      data: parsedData,
      isSimulated: false,
    };
  }
}
