const MAX_TOKENS_LIMIT = 4000;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  // ── Auth: verify internal secret ──────────────────────────────────────────
  const expectedSecret = process.env.INTERNAL_API_SECRET;
  const providedSecret = req.headers["x-internal-secret"];
  if (!expectedSecret || providedSecret !== expectedSecret) {
    console.warn("[generate-report] Unauthorized request blocked");
    return res.status(403).json({ error: "Forbidden" });
  }

  const { system, messages, max_tokens = 2400, model } = req.body;

  // ── Cap max_tokens to prevent abuse ───────────────────────────────────────
  const safMaxTokens = Math.min(Number(max_tokens) || 2400, MAX_TOKENS_LIMIT);

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model || "claude-sonnet-4-20250514",
        max_tokens: safMaxTokens,
        system,
        messages,
      }),
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
