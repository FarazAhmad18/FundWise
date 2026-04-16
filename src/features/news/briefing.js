import { chatCompletion } from "@/lib/ai/groq";

/**
 * Generate an AI-powered morning briefing based on top news headlines
 * and the user's holdings. Returns a short 3-4 sentence summary.
 */
export async function generateBriefing({
  articles = [],
  holdings = [],
  marketName = "the market",
  userName = "there",
}) {
  if (!articles.length) return null;

  // Keep just top 5 articles, trim content
  const top = articles.slice(0, 5).map((a, i) => ({
    idx: i + 1,
    title: a.title,
    excerpt: (a.content || "").slice(0, 250),
  }));

  const holdingsText = holdings.length
    ? `You own positions in: ${holdings.map((h) => h.ticker.split(".")[0]).join(", ")}.`
    : "You don't own any stocks yet.";

  const headlines = top
    .map((a) => `[${a.idx}] ${a.title}\n    ${a.excerpt}`)
    .join("\n\n");

  const prompt = `You are a friendly financial briefer. Write a 3-sentence morning briefing for ${userName}.

${holdingsText}

Market: ${marketName}

Today's top headlines:
${headlines}

Rules:
- 3 sentences maximum.
- Plain language — no jargon like "bps", "guidance", "consensus".
- If any headline directly relates to the user's holdings, mention it.
- Don't cite sources or article numbers.
- Don't use markdown, bullet points, or quotes.
- Start naturally, not with "Good morning" or the user's name.`;

  try {
    const { content } = await chatCompletion({
      messages: [
        { role: "system", content: "You are a concise financial briefer." },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
      maxTokens: 220,
    });

    return content.trim();
  } catch (err) {
    console.error("generateBriefing error:", err.message);
    return null;
  }
}
