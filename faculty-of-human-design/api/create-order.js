import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const {
    reportId,
    reportTitle,
    price,
    customerName,
    customerEmail,
    birthData,
    partnerBirthData,
    promptSections,   // array of section title strings
  } = req.body;

  if (!reportId || !customerEmail || !birthData || !promptSections) {
    return res.status(400).json({ error: "Vereiste velden ontbreken" });
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    return res.status(400).json({ error: "Ongeldig e-mailadres" });
  }

  const orderId = randomUUID();

  const { error } = await supabase.from("orders").insert({
    id: orderId,
    report_id: reportId,
    report_title: reportTitle,
    customer_name: customerName || null,
    customer_email: customerEmail.trim().toLowerCase(),
    birth_data: birthData,
    partner_birth_data: partnerBirthData || null,
    prompt_sections: promptSections,
    status: "pending",
  });

  if (error) {
    console.error("[create-order] Supabase error:", error.message);
    return res.status(500).json({ error: "Order aanmaken mislukt. Probeer opnieuw." });
  }

  return res.json({ orderId });
}
