const TAVILY_BASE = "https://api.tavily.com";

function getKey() {
  const key = process.env.TAVILY_API_KEY;
  if (!key) throw new Error("TAVILY_API_KEY is not configured");
  return key;
}

/**
 * Extract clean text content from one or more URLs.
 * Returns an array of { url, rawContent } objects.
 */
export async function tavilyExtract(urls) {
  const apiKey = getKey();
  const urlList = Array.isArray(urls) ? urls : [urls];

  const res = await fetch(`${TAVILY_BASE}/extract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      urls: urlList,
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Tavily extract ${res.status}: ${text}`);
  }

  const json = await res.json();
  return json.results ?? [];
}

/**
 * Search the web for a query. Returns structured results with
 * title, url, content snippet, and optionally raw page content.
 *
 * @param {string} query - Search query
 * @param {object} opts
 * @param {number} opts.maxResults - Number of results (default 5)
 * @param {boolean} opts.includeRawContent - Include full page text (default false)
 * @param {string} opts.topic - "general" or "news" (default "news")
 */
export async function tavilySearch(query, opts = {}) {
  const apiKey = getKey();
  const {
    maxResults = 5,
    includeRawContent = false,
    topic = "news",
  } = opts;

  const res = await fetch(`${TAVILY_BASE}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      max_results: maxResults,
      include_raw_content: includeRawContent,
      topic,
      search_depth: "basic",
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Tavily search ${res.status}: ${text}`);
  }

  const json = await res.json();
  return {
    results: (json.results ?? []).map((r) => ({
      title: r.title,
      url: r.url,
      content: r.content,
      rawContent: r.raw_content ?? null,
      score: r.score,
    })),
    query: json.query,
  };
}
