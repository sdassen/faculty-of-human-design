import { inngest } from "../../lib/inngest/client.js";

function isAuthorized(req) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  return req.query.secret === secret;
}

/**
 * Manually trigger article generation (bypasses the biweekly cron).
 *
 * Usage: GET /api/admin/trigger-article?secret=XXX
 *        &topic=0          (optional: index from TOPICS array, default: auto-pick)
 */
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: "Unauthorized. Add ?secret=<ADMIN_SECRET>" });
  }

  try {
    await inngest.send({
      name: "article/generate",
      data: {
        topicIndex: req.query.topic != null ? parseInt(req.query.topic) : null,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Artikel generatie gestart. Controleer Inngest dashboard voor voortgang.",
    });
  } catch (e) {
    console.error("[trigger-article]", e.message);
    return res.status(500).json({ error: e.message });
  }
}
