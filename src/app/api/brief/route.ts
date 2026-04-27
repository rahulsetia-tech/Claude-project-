import { NextResponse } from "next/server";
import { computeSpentByCategory, currentMonthKey, type Budget } from "@/lib/budgets";
import { synthesiseBrief, type Brief } from "@/lib/brief";
import type { Transaction } from "@/lib/transactions";

export const runtime = "nodejs";

interface BriefRequest {
  transactions: Transaction[];
  budgets: Budget[];
}

interface ClaudeBriefShape {
  topLeaks: Array<{ category: string; amount: number }>;
  habitWin: string;
  nextMove: string;
}

const SYSTEM_PROMPT = `You are Pocket, a weekly financial coach for Indian college students (18-24).
You read this week's spending and budgets and write a short, useful brief.

Output VALID JSON ONLY. No prose, no code fences. Match this schema:
{
  "topLeaks": [{"category": string, "amount": number}, ...up to 3 entries, ranked highest first],
  "habitWin": string,
  "nextMove": string
}

Rules:
- Currency is INR (₹). Round to whole rupees.
- "habitWin": 1-2 sentences, encouraging, name a category that's well under budget OR a small leak being kept in check.
- "nextMove": 1-2 sentences, ONE concrete change for next week (e.g. "Skip the next 2 Swiggy orders this week"), tied to the biggest over-budget or closest-to-cap category.
- Tone: a smart older sibling, not a CFO. Indian student context (mess fees, hostel rent, UPI spends, ride-share).
- Never give regulated financial advice. Never mention tax, investing, or insurance.
- Keep each sentence under 28 words.`;

export async function POST(req: Request) {
  let body: BriefRequest;
  try {
    body = (await req.json()) as BriefRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { transactions = [], budgets = [] } = body;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(synthesiseBrief(transactions, budgets));
  }

  try {
    const brief = await callClaude(transactions, budgets, apiKey);
    return NextResponse.json(brief);
  } catch (err) {
    console.error("brief: claude call failed, falling back to local", err);
    const fallback = synthesiseBrief(transactions, budgets);
    return NextResponse.json(fallback);
  }
}

async function callClaude(
  transactions: Transaction[],
  budgets: Budget[],
  apiKey: string,
): Promise<Brief> {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey });

  const monthKey = currentMonthKey();
  const spent = computeSpentByCategory(transactions, monthKey);

  const userPayload = {
    monthKey,
    spentByCategory: spent,
    budgets,
    recentTransactions: transactions.slice(-40),
  };

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 800,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: JSON.stringify(userPayload),
      },
    ],
  });

  const raw = message.content
    .filter((c): c is Extract<typeof c, { type: "text" }> => c.type === "text")
    .map((c) => c.text)
    .join("")
    .trim();

  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  const parsed = JSON.parse(cleaned) as ClaudeBriefShape;

  return {
    generatedAt: new Date().toISOString(),
    monthKey,
    topLeaks: parsed.topLeaks ?? [],
    habitWin: parsed.habitWin ?? "",
    nextMove: parsed.nextMove ?? "",
    source: "claude",
  };
}
