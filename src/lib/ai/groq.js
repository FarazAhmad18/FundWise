const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

function getKeys() {
  const keys = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_FALLBACK,
  ].filter(Boolean);

  if (keys.length === 0) {
    throw new Error("No Groq API keys configured");
  }
  return keys;
}

function getModel() {
  return process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
}

/**
 * Call Groq chat completions with automatic fallback across keys on
 * 401/429 errors. Returns the assistant message content.
 */
export async function chatCompletion({
  messages,
  temperature = 0.3,
  maxTokens = 1024,
}) {
  const keys = getKeys();
  const model = getModel();

  let lastError = null;

  for (const key of keys) {
    try {
      const res = await fetch(GROQ_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
        signal: AbortSignal.timeout(45000),
      });

      if (res.ok) {
        const json = await res.json();
        const content = json.choices?.[0]?.message?.content ?? "";
        return { content, model, usage: json.usage };
      }

      // Fallback-worthy errors: auth + rate limit
      if (res.status === 401 || res.status === 429) {
        const errText = await res.text();
        lastError = new Error(`Groq ${res.status}: ${errText}`);
        continue;
      }

      const errText = await res.text();
      throw new Error(`Groq ${res.status}: ${errText}`);
    } catch (err) {
      lastError = err;
      // Network errors also fall through to try next key
      if (err.name === "TimeoutError" || err.name === "AbortError") continue;
      if (err.message?.startsWith("Groq ")) continue;
      throw err;
    }
  }

  throw lastError ?? new Error("All Groq keys failed");
}
