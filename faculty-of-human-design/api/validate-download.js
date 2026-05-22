import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token } = req.body;

  if (!token || typeof token !== "string") {
    return res.status(400).json({ error: "Missing or invalid token" });
  }

  // Validate token format (should be UUID)
  const uuidRegex = /^[a-f0-9-]{36}$/i;
  if (!uuidRegex.test(token)) {
    return res.status(400).json({ error: "Invalid token format" });
  }

  try {
    // Look up order by download token
    const { data: order, error } = await supabase
      .from("orders")
      .select("id, pdf_blob_url, delivered_at, status")
      .eq("download_token", token)
      .single();

    if (error || !order) {
      return res.status(404).json({ error: "Download link not found" });
    }

    // Check if order status is "delivered"
    if (order.status !== "delivered") {
      return res.status(400).json({ error: "Order not ready for download" });
    }

    // Check if link has expired (30 days)
    if (order.delivered_at) {
      const deliveredDate = new Date(order.delivered_at);
      const expiryDate = new Date(deliveredDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      const now = new Date();

      if (now > expiryDate) {
        return res.status(410).json({ error: "Download link has expired" });
      }
    }

    // Return the PDF blob URL
    if (!order.pdf_blob_url) {
      return res.status(500).json({ error: "PDF not yet available" });
    }

    return res.status(200).json({ pdfUrl: order.pdf_blob_url });
  } catch (e) {
    console.error("[validate-download]", e);
    return res.status(500).json({ error: "Server error validating download" });
  }
}
