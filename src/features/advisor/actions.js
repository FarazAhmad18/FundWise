"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { chatCompletion } from "@/lib/ai/groq";
import { tavilySearch } from "@/lib/external/tavily";
import { getProfile } from "@/features/profile/queries";
import { getPortfolioSummary } from "@/features/transactions/queries";
import { listGoals } from "@/features/goals/queries";
import { getMarketConfig, formatCurrency } from "@/constants/markets";

function buildAdvisorPrompt(profile, marketConfig, portfolio, goals) {
  const currency = profile?.currency || "USD";

  let portfolioSection = "No investments yet.";
  if (portfolio.holdings.length > 0) {
    const holdingsList = portfolio.holdings
      .map(
        (h) =>
          `  - ${h.name} (${h.ticker.split(".")[0]}): ${h.shares} shares, value ${formatCurrency(h.currentValue, currency)}, P&L ${h.pnl >= 0 ? "+" : ""}${formatCurrency(h.pnl, currency)} (${h.pnlPct >= 0 ? "+" : ""}${h.pnlPct.toFixed(1)}%)`
      )
      .join("\n");
    portfolioSection = `Total value: ${formatCurrency(portfolio.totalValue, currency)}\nTotal P&L: ${portfolio.totalPnl >= 0 ? "+" : ""}${formatCurrency(portfolio.totalPnl, currency)} (${portfolio.totalPnlPct >= 0 ? "+" : ""}${portfolio.totalPnlPct.toFixed(1)}%)\nHoldings:\n${holdingsList}`;
  }

  let goalsSection = "No goals set.";
  if (goals.length > 0) {
    goalsSection = goals
      .map(
        (g) =>
          `  - ${g.name} (${g.category}): ${formatCurrency(g.current_saved, currency)} / ${formatCurrency(g.target_amount, currency)} (${g.progress.toFixed(0)}%), status: ${g.projectionStatus || "unknown"}`
      )
      .join("\n");
  }

  return `You are P1 Advisor — a friendly, plain-spoken personal financial guide for everyday people.

USER PROFILE:
- Country: ${marketConfig.name}
- Currency: ${currency}
- Risk tolerance: ${profile?.risk_level || "moderate"}
- Experience: ${profile?.investment_experience || "beginner"}
- Monthly income: ${profile?.monthly_income ? formatCurrency(profile.monthly_income, currency) : "Not shared"}
- Monthly expenses: ${profile?.monthly_expenses ? formatCurrency(profile.monthly_expenses, currency) : "Not shared"}

PORTFOLIO:
${portfolioSection}

GOALS:
${goalsSection}

RESPONSE FORMAT (STRICT):
Respond with ONLY valid JSON. No prose before or after. Schema:
{
  "summary": "One short sentence answering the question directly.",
  "key_points": ["2-5 bullet points, each a plain sentence, specific to the user's actual data."],
  "risks": ["0-3 honest risks or trade-offs to watch for."],
  "next_actions": [
    { "label": "Short action title (under 8 words)", "detail": "One sentence explaining why / how." }
  ]
}

RULES:
1. Plain language. No jargon without a one-phrase explanation.
2. Reference the user's actual numbers, tickers, and goals — do not speak generically.
3. Never give specific buy/sell orders. Help them reason.
4. Use ${currency} for amounts. Focus on ${marketConfig.exchangeName} when stocks come up.
5. Be honest — if you don't know, say so in "summary".
6. If the user's question isn't finance-related, gently redirect in "summary" with empty arrays.`;
}

function tryParseJson(text) {
  if (!text) return null;
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {}
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch {}
  }
  return null;
}

function normalizeResponse(raw, fallbackText) {
  const parsed = tryParseJson(raw);
  if (parsed && typeof parsed === "object") {
    return {
      summary: typeof parsed.summary === "string" ? parsed.summary : fallbackText,
      key_points: Array.isArray(parsed.key_points) ? parsed.key_points.slice(0, 6) : [],
      risks: Array.isArray(parsed.risks) ? parsed.risks.slice(0, 4) : [],
      next_actions: Array.isArray(parsed.next_actions)
        ? parsed.next_actions
            .filter((a) => a && typeof a === "object" && a.label)
            .slice(0, 4)
        : [],
    };
  }
  return {
    summary: fallbackText || "",
    key_points: [],
    risks: [],
    next_actions: [],
  };
}

export async function sendAdvisorMessage(conversationId, messageText) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };
  if (!messageText?.trim()) return { error: "Message cannot be empty" };
  if (messageText.length > 2000) return { error: "Message too long (max 2000 characters)" };

  const { error: msgError } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    role: "user",
    content: messageText.trim(),
  });

  if (msgError) return { error: msgError.message };

  const [profile, portfolio, goals] = await Promise.all([
    getProfile(),
    getPortfolioSummary(),
    listGoals(),
  ]);

  const marketConfig = getMarketConfig(profile?.country_code);
  const systemPrompt = buildAdvisorPrompt(profile, marketConfig, portfolio, goals);

  const { data: recentMessages } = await supabase
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(20);

  const messages = [
    { role: "system", content: systemPrompt },
    ...(recentMessages || []).map((m) => ({ role: m.role, content: m.content })),
  ];

  const lowerMsg = messageText.toLowerCase();
  const needsSearch =
    lowerMsg.includes("current") ||
    lowerMsg.includes("latest") ||
    lowerMsg.includes("today") ||
    lowerMsg.includes("news") ||
    lowerMsg.includes("recent");

  let searchContext = "";
  if (needsSearch) {
    try {
      const searchQuery = `${messageText} ${marketConfig.name} stock market`;
      const { results } = await tavilySearch(searchQuery, {
        maxResults: 3,
        topic: "news",
      });
      if (results?.length) {
        searchContext =
          "\n\nRECENT WEB SEARCH RESULTS (use to inform answer, cite source names in key_points if relevant):\n" +
          results.map((r, i) => `[${i + 1}] ${r.title}\n${r.content}`).join("\n\n");
      }
    } catch {}
  }

  if (searchContext) {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role === "user") lastMsg.content += searchContext;
  }

  try {
    const result = await chatCompletion({
      messages,
      temperature: 0.3,
      maxTokens: 1500,
    });

    const structured = normalizeResponse(result.content, result.content);

    const { error: saveError } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      role: "assistant",
      content: JSON.stringify(structured),
    });

    if (saveError) console.error("Failed to save assistant message:", saveError);

    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    revalidatePath("/advisor");
    return { success: true, structured };
  } catch (err) {
    return { error: "AI advisor is temporarily unavailable. Please try again." };
  }
}

export async function createConversation(firstMessage) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const title =
    (firstMessage?.slice(0, 60) + (firstMessage?.length > 60 ? "..." : "")) ||
    "New Conversation";

  const { data: conversation, error } = await supabase
    .from("conversations")
    .insert({ user_id: user.id, title })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/advisor");
  return { success: true, conversationId: conversation.id };
}

export async function deleteConversation(conversationId) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", conversationId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/advisor");
  return { success: true };
}
