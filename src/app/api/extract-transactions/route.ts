import { NextResponse } from "next/server";
import { Buffer } from "buffer";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;

const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

interface ExtractedTx {
  date: string | null;
  description: string;
  amount: number;
}

const SYSTEM_PROMPT = `You extract spending transactions from images (UPI app screenshots, bank statement screenshots, receipts) and PDFs.

Output VALID JSON ONLY (no prose, no code fences). Match this schema EXACTLY:
{
  "transactions": [
    {
      "date": "YYYY-MM-DD" or null,
      "description": string,
      "amount": number
    }
  ]
}

Rules:
- Currency: INR. Strip the ₹ symbol; output amount as a plain number.
- Only OUTGOING money — debits, payments sent, withdrawals, "paid to X", "sent to X", purchases.
  SKIP: income, salary credits, refunds, "received from X", "credited", incoming transfers, top-ups received.
- date: ISO 8601 "YYYY-MM-DD" if a year is visible. If only "DD MMM" is visible (e.g. "12 Apr"), infer year as 2026 unless something on the screen says otherwise. If no date is visible at all, use null.
- description: short merchant or payee name, ~5 words max. Strip prefixes like "Paid to", "Sent to", "UPI/", phone numbers, transaction IDs.
- amount: positive number, money spent. Strip commas.
- If a transaction has both a total and a cashback/discount/refund, output the net amount paid.
- Order: most recent first.
- Limit output to the 50 most recent transactions visible.
- If the image is unreadable or has no outgoing transactions, return {"transactions": []}.`;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Image extraction needs ANTHROPIC_API_KEY in .env.local. CSV import works without one.",
      },
      { status: 400 },
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid multipart body" },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too big (${Math.round(file.size / 1024)} KB). Max 5 MB.` },
      { status: 400 },
    );
  }

  const mediaType = file.type;
  const isPdf = mediaType === "application/pdf";
  const isImage = SUPPORTED_IMAGE_TYPES.has(mediaType);

  if (!isPdf && !isImage) {
    return NextResponse.json(
      {
        error: `Unsupported file type "${mediaType}". Use JPG, PNG, WebP, GIF, or PDF.`,
      },
      { status: 400 },
    );
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });

    const contentBlock = isPdf
      ? ({
          type: "document",
          source: {
            type: "base64",
            media_type: "application/pdf",
            data: base64,
          },
        } as const)
      : ({
          type: "image",
          source: {
            type: "base64",
            media_type: mediaType as
              | "image/jpeg"
              | "image/png"
              | "image/gif"
              | "image/webp",
            data: base64,
          },
        } as const);

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
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
          content: [
            contentBlock,
            {
              type: "text",
              text: "Extract every outgoing transaction visible in this image or document.",
            },
          ],
        },
      ],
    });

    const raw = message.content
      .filter(
        (c): c is Extract<typeof c, { type: "text" }> => c.type === "text",
      )
      .map((c) => c.text)
      .join("")
      .trim();

    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    const parsed = JSON.parse(cleaned) as { transactions: ExtractedTx[] };

    return NextResponse.json({
      transactions: parsed.transactions ?? [],
    });
  } catch (err) {
    console.error("extract-transactions failed", err);
    return NextResponse.json(
      {
        error:
          "Could not extract transactions. The image may be unreadable, or the API call failed.",
      },
      { status: 500 },
    );
  }
}
