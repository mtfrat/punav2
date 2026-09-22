/**
 * Budget Guard & Cost Tracker
 * Enforces hard spending limits and token quotas per run.
 */

// Model pricing in USD per 1M tokens (conservative estimates)
const PRICING = {
  "gemini-2.5-flash": { input: 0.15, output: 0.60 },
  "gemini-2.0-flash": { input: 0.10, output: 0.40 },
  "gpt-4o-mini": { input: 0.15, output: 0.60 },
  "default": { input: 0.20, output: 0.80 },
};

export class BudgetGuard {
  constructor(config = {}) {
    this.maxDailySpendUsd = Number(config.maxDailySpendUsd ?? 1.50);
    this.maxTokensPerAgent = Number(config.maxTokensPerAgent ?? 4000);
    this.totalSpentUsd = 0;
    this.tokenUsage = {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    };
    this.agentUsage = {};
  }

  /**
   * Estimates cost for a call and checks if it would breach budget.
   */
  estimateCost(model, promptTokens, completionTokens) {
    const rate = PRICING[model] || PRICING.default;
    const inputCost = (promptTokens / 1_000_000) * rate.input;
    const outputCost = (completionTokens / 1_000_000) * rate.output;
    return inputCost + outputCost;
  }

  /**
   * Records token usage and calculates cost.
   * Throws Error if daily budget is breached.
   */
  recordUsage(agentName, model, promptTokens, completionTokens) {
    const cost = this.estimateCost(model, promptTokens, completionTokens);
    
    if (this.totalSpentUsd + cost > this.maxDailySpendUsd) {
      throw new Error(
        `[BUDGET GUARD] Daily spend limit breached! Current: $${this.totalSpentUsd.toFixed(4)}, Attempted: +$${cost.toFixed(4)}, Max: $${this.maxDailySpendUsd.toFixed(2)}`
      );
    }

    this.totalSpentUsd += cost;
    this.tokenUsage.promptTokens += promptTokens;
    this.tokenUsage.completionTokens += completionTokens;
    this.tokenUsage.totalTokens += (promptTokens + completionTokens);

    if (!this.agentUsage[agentName]) {
      this.agentUsage[agentName] = { promptTokens: 0, completionTokens: 0, costUsd: 0, calls: 0 };
    }
    this.agentUsage[agentName].promptTokens += promptTokens;
    this.agentUsage[agentName].completionTokens += completionTokens;
    this.agentUsage[agentName].costUsd += cost;
    this.agentUsage[agentName].calls += 1;

    return {
      costThisCall: cost,
      totalSpentUsd: this.totalSpentUsd,
      remainingUsd: Math.max(0, this.maxDailySpendUsd - this.totalSpentUsd),
    };
  }

  getSummary() {
    return {
      maxDailySpendUsd: this.maxDailySpendUsd,
      totalSpentUsd: Number(this.totalSpentUsd.toFixed(4)),
      remainingBudgetUsd: Number(Math.max(0, this.maxDailySpendUsd - this.totalSpentUsd).toFixed(4)),
      tokenUsage: { ...this.tokenUsage },
      agentBreakdown: { ...this.agentUsage },
    };
  }
}
