import { calcHDServer } from "../../lib/hd/calculator.js";

function isAuthorized(req) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  return req.query.secret === secret;
}

/**
 * Compute a server-side HD chart for given birth data and return it as JSON.
 * Use this to verify the server calculation against known references.
 *
 * Usage:
 *   GET /api/admin/verify-chart?secret=XXX
 *      &day=15&month=3&year=1988
 *      &hour=14&minute=30
 *      &tz=1
 */
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const {
    day, month, year,
    hour = "12", minute = "0",
    tz = "1",
  } = req.query;

  if (!day || !month || !year) {
    return res.status(400).json({
      error: "Required: day, month, year. Optional: hour, minute, tz.",
      example: "/api/admin/verify-chart?secret=XXX&day=15&month=3&year=1988&hour=14&minute=30&tz=1",
    });
  }

  try {
    const chart = calcHDServer({
      day:    parseInt(day),
      month:  parseInt(month),
      year:   parseInt(year),
      hour:   parseInt(hour),
      minute: parseInt(minute),
      tz:     parseFloat(tz),
    });

    return res.status(200).json({
      input: { day, month, year, hour, minute, tz },
      chart,
      summary: {
        type:    chart.type,
        profile: chart.profile,
        auth:    chart.auth,
        cross:   chart.cross,
        defined: chart.definedCenters,
        channels: chart.channels.length,
        gates:    chart.allGates.length,
      },
    });
  } catch (e) {
    console.error("[verify-chart]", e);
    return res.status(500).json({ error: e.message, stack: e.stack });
  }
}
