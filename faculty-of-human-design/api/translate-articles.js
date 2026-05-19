// One-time backfill: translate existing Dutch articles to English.
// Call with: GET /api/translate-articles?secret=TRANSLATE_SECRET
// Remove or secure this endpoint after use.
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const secret = process.env.TRANSLATE_SECRET;
  if (!secret || req.query.secret !== secret) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

  if (!SUPABASE_URL || !KEY || !ANTHROPIC_KEY) {
    return res.status(500).json({ error: "Missing env vars" });
  }

  // Fetch articles without English body
  const listRes = await fetch(
    `${SUPABASE_URL}/rest/v1/articles?select=id,title,body&body_en=is.null&order=published_at.asc`,
    { headers: { apikey: KEY, Authorization: "Bearer " + KEY } }
  );
  const articles = await listRes.json();

  if (!Array.isArray(articles) || articles.length === 0) {
    return res.json({ message: "Nothing to translate", count: 0 });
  }

  const results = [];

  for (const article of articles) {
    try {
      // Generate English version
      const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 3000,
          system: `You are an expert translator and writer for the Faculty of Human Design on Ibiza.
Translate the following Dutch article about Human Design, Numerology or Astrology into fluent, natural English.
Preserve the tone, structure and paragraph breaks exactly.
Output only the translated article text — no title, no preamble.
Paragraphs separated by a blank line.`,
          messages: [{ role: "user", content: article.body }],
        }),
      });

      if (!aiRes.ok) {
        results.push({ id: article.id, title: article.title, status: "ai_error" });
        continue;
      }

      const aiData = await aiRes.json();
      const bodyEn = aiData.content?.find((b) => b.type === "text")?.text?.trim() || "";

      // Translate title
      const titleRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 100,
          system: "Translate this Dutch article title to English. Output only the translated title, nothing else.",
          messages: [{ role: "user", content: article.title }],
        }),
      });
      const titleData = await titleRes.json();
      const titleEn = titleData.content?.find((b) => b.type === "text")?.text?.trim() || article.title;

      // Extract excerpt from English body
      const firstPara = bodyEn.split("\n\n")[0] || "";
      const excerptEn = firstPara.length > 220 ? firstPara.slice(0, 217).trim() + "..." : firstPara.trim();

      // Update Supabase row
      const updateRes = await fetch(
        `${SUPABASE_URL}/rest/v1/articles?id=eq.${article.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: KEY,
            Authorization: "Bearer " + KEY,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({ title_en: titleEn, excerpt_en: excerptEn, body_en: bodyEn }),
        }
      );

      results.push({
        id: article.id,
        title: article.title,
        title_en: titleEn,
        status: updateRes.ok ? "ok" : "db_error",
      });
    } catch (e) {
      results.push({ id: article.id, title: article.title, status: "error", error: e.message });
    }
  }

  return res.json({ translated: results.length, results });
}
