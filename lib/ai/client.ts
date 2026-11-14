import Groq from "groq-sdk";
import { wrapOpenAI } from "langsmith/wrappers/openai";

// The one place the AI client is constructed. A client built anywhere else
// would work and silently go untraced, so nothing else imports the AI client.

// Exact snapshots, never a moving alias: an alias changes the model under a
// cached answer without changing its key. Each model is part of its own
// tasks' cache keys, so re-pinning one invalidates only its own answers.
// Using Groq's fastest free production model: openai/gpt-oss-20b (~1000 tokens/sec,
// fast token rate-limit replenishment, and native JSON schema support).
export const MODELS = {
  explain: "openai/gpt-oss-20b",
  classify: "openai/gpt-oss-20b",
} as const;

export type TracingStatus = { on: true; project: string } | { on: false; reason: string };

// An absent key looks exactly like a working setup with no traffic, so the
// state is reported with every answer instead of being inferred.
export function tracingStatus(): TracingStatus {
  if (process.env.LANGSMITH_TRACING?.trim() !== "true") return { on: false, reason: "LANGSMITH_TRACING isn't \"true\"" };
  if (!process.env.LANGSMITH_API_KEY?.trim()) return { on: false, reason: "LANGSMITH_API_KEY isn't set" };
  return { on: true, project: process.env.LANGSMITH_PROJECT?.trim() || "default" };
}

// Client interface matching OpenAI chat completions structure expected by tasks.ts
export type AIClient = {
  chat: {
    completions: {
      create: (params: Record<string, unknown>, options?: unknown) => Promise<{
        choices: Array<{
          message: { content: string | null };
          finish_reason?: string | null;
        }>;
      }>;
    };
  };
};

let client: AIClient | null = null;

// Built on first use rather than at import, so a missing key fails the call
// that needed it with a message saying so, not the server's boot.
export function ai(): AIClient {
  if (client) return client;
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) throw new Error("GROQ_API_KEY isn't set in .env.local, so nothing can be explained");

  const groq = new Groq({ apiKey, maxRetries: 5 });

  // Ensure completions.create exists on the raw client for LangSmith wrapper compatibility
  if (!(groq.completions as unknown as { create?: unknown }).create) {
    (groq.completions as unknown as { create: () => void }).create = () => {};
  }

  // Intercept chat.completions.create to sanitize Groq-specific parameters and handle rate limits
  const rawCreate = groq.chat.completions.create.bind(groq.chat.completions);
  groq.chat.completions.create = (async (params: Record<string, unknown>, options?: unknown) => {
    // Strip OpenAI-only parameters like 'verbosity' that Groq rejects with 400
    const { verbosity: _verbosity, ...cleanParams } = params;

    // Execute with automatic rate-limit backoff and retry
    return withRateLimitRetry(() => rawCreate(cleanParams as unknown as Parameters<typeof rawCreate>[0], options as unknown as Parameters<typeof rawCreate>[1]));
  }) as unknown as typeof groq.chat.completions.create;

  // Instrument with LangSmith tracing
  client = wrapOpenAI(groq as unknown as Parameters<typeof wrapOpenAI>[0], {
    tracingEnabled: tracingStatus().on,
  }) as unknown as AIClient;

  return client;
}

/**
 * How every traced step is recorded. Whatever runs inside it, the cache read
 * included, is one run, so a cache hit shows up as a run with no model call
 * under it. With tracing off the function runs exactly the same, untraced.
 */
export function traceConfig(name: string) {
  return { name, run_type: "chain", tracingEnabled: tracingStatus().on } as const;
}

/**
 * Resilient rate-limiting retry wrapper with exponential backoff and jitter.
 * Automatically respects Groq's 429 headers (retry-after, x-ratelimit-reset-tokens)
 * and message suggestions so requests work smoothly.
 */
async function withRateLimitRetry<T>(fn: () => Promise<T>, maxRetries = 5): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (error: unknown) {
      const isRateLimit =
        error instanceof Groq.RateLimitError ||
        (typeof error === "object" && error !== null && "status" in error && (error as { status: number }).status === 429);
      if (!isRateLimit || attempt >= maxRetries) {
        throw error;
      }
      const delay = getRetryDelayMs(error, attempt);
      console.warn(`Groq rate limit (429) hit. Backing off for ${delay}ms (attempt ${attempt + 1}/${maxRetries})...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      attempt++;
    }
  }
}

function getRetryDelayMs(error: unknown, attempt: number): number {
  if (typeof error === "object" && error !== null) {
    const err = error as { status?: number; headers?: Record<string, string>; message?: string };
    if (err.headers?.["retry-after"]) {
      const sec = parseFloat(err.headers["retry-after"]);
      if (!isNaN(sec) && sec > 0) return Math.ceil(sec * 1000) + 200;
    }
    if (err.headers?.["x-ratelimit-reset-tokens"]) {
      const match = err.headers["x-ratelimit-reset-tokens"].match(/([0-9.]+)\s*(m?s)/i);
      if (match) {
        const val = parseFloat(match[1]);
        const ms = match[2].toLowerCase() === "ms" ? val : val * 1000;
        return Math.ceil(ms) + 200;
      }
    }
    if (typeof err.message === "string") {
      const match = err.message.match(/try again in ([0-9.]+)\s*(m?s)/i);
      if (match) {
        const val = parseFloat(match[1]);
        const ms = match[2].toLowerCase() === "ms" ? val : val * 1000;
        return Math.ceil(ms) + 200;
      }
    }
  }
  const base = Math.min(1500 * Math.pow(2, attempt), 10000);
  const jitter = Math.floor(Math.random() * 500);
  return base + jitter;
}
