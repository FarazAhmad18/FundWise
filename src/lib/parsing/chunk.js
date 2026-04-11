/**
 * Split text into chunks of roughly `targetWords` words each, breaking
 * on sentence boundaries when possible so chunks remain semantically whole.
 *
 * Used by the ingestion pipeline before embeddings are generated. Chunk
 * size is tuned for small MiniLM-style embedding models (384 dim) which
 * do best on short-to-medium passages.
 */
export function chunkText(text, targetWords = 180) {
  if (!text || typeof text !== "string") return [];

  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];

  const sentences = clean
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks = [];
  let buffer = [];
  let wordCount = 0;

  for (const sentence of sentences) {
    const words = sentence.split(/\s+/).length;

    if (wordCount + words > targetWords && buffer.length > 0) {
      chunks.push(buffer.join(" "));
      buffer = [];
      wordCount = 0;
    }

    buffer.push(sentence);
    wordCount += words;
  }

  if (buffer.length > 0) chunks.push(buffer.join(" "));

  return chunks;
}

/**
 * Extract readable text from an HTML string. Very simple: strips tags,
 * script/style blocks, and collapses whitespace. For production-grade
 * article extraction we'd swap this for a Readability-style library.
 */
export function htmlToText(html) {
  if (!html) return "";

  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/?(br|p|div|li|h[1-6]|tr)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
