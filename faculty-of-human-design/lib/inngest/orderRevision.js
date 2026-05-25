// ─── ORDER REVISION WORKFLOW ──────────────────────────────────────────────────
// Triggered by "app/order.revision_requested" when an admin rejects a report
// and provides feedback. Regenerates all sections with the feedback injected
// into every section prompt, renders a new PDF, uploads it, and sends a fresh
// review email so the admin can approve the revised version.

import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { inngest } from "./client.js";
import { generateScoredSection } from "./orderDelivery.js";
import { generatePDF } from "../pdf/index.js";
import { sendAdminReviewEmail } from "../email/index.js";

// ─── SUPABASE ─────────────────────────────────────────────────────────────────
class _NoopWS {
  constructor() { this.readyState = 3; }
  send() {} close() {} addEventListener() {} removeEventListener() {}
}
_NoopWS.CONNECTING = 0; _NoopWS.OPEN = 1; _NoopWS.CLOSING = 2; _NoopWS.CLOSED = 3;

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { realtime: { transport: _NoopWS } }
  );
}

// ─── INNGEST FUNCTION ─────────────────────────────────────────────────────────
export const orderRevision = inngest.createFunction(
  {
    id: "order-revision",
    name: "Order Revision Workflow",
    retries: 2,
  },
  { event: "app/order.revision_requested" },

  async ({ event, step }) => {
    const { orderId, feedback } = event.data;

    // ── Step 1: Load order ────────────────────────────────────────────────
    const order = await step.run("load-order-for-revision", async () => {
      const db = getSupabase();
      const { data, error } = await db
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (error || !data) {
        throw new Error(`Order not found: ${orderId}`);
      }

      // Guard against double-firing
      if (data.status !== "regenerating") {
        console.log(`[order-revision] Skipping ${orderId} — status is "${data.status}", expected "regenerating"`);
        return null;
      }

      return data;
    });

    if (!order) return { skipped: true };

    // Attach the editor's feedback so generateScoredSection injects it into
    // every section prompt (see revisionBlock in orderDelivery.js)
    const enrichedOrder = { ...order, revisionFeedback: feedback };

    // ── Steps 2…N: Regenerate all sections with feedback ─────────────────
    const sections = [];
    const sectionTitles = enrichedOrder.prompt_sections || [];

    for (let i = 0; i < sectionTitles.length; i++) {
      const title = sectionTitles[i];
      const previous = sections.map((s) => ({ title: s.title, ...s }));
      const sectionData = await step.run(`revise-section-${i}`, async () => {
        return generateScoredSection(title, enrichedOrder, previous);
      });
      sections.push({ title, ...(sectionData || {}) });
    }

    // ── Step N+1: Render revised PDF ──────────────────────────────────────
    const pdfBytes = await step.run("render-revised-pdf", async () => {
      const buffer = await generatePDF({ order: enrichedOrder, sections });
      return Buffer.from(buffer).toString("base64");
    });

    // ── Step N+2: Upload revised PDF to Vercel Blob ───────────────────────
    // We use a new UUID suffix so the original blob is preserved for audit.
    const newBlobUrl = await step.run("upload-revised-pdf", async () => {
      const pdfBuffer = Buffer.from(pdfBytes, "base64");
      const filename  = `reports/${orderId}-rev-${Date.now()}.pdf`;

      const { url } = await put(filename, pdfBuffer, {
        access: "public",
        contentType: "application/pdf",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      return url;
    });

    // ── Step N+3: Update DB + generate new review token ───────────────────
    const newReviewToken = await step.run("update-order-after-revision", async () => {
      const db = getSupabase();
      const token = randomUUID();

      const { error } = await db
        .from("orders")
        .update({
          status: "review_pending",
          pdf_blob_url: newBlobUrl,
          review_token: token,
          generated_sections: sections,
          // Append to revision history for audit
          revision_notes: feedback,
        })
        .eq("id", orderId);

      if (error) throw new Error(`DB update failed: ${error.message}`);
      return token;
    });

    // ── Step N+3.5: Persist feedback as a reusable prompt lesson ─────────
    // Every revision becomes a structural lesson for all future reports.
    await step.run("save-prompt-lesson", async () => {
      const db = getSupabase();
      const { error } = await db
        .from("prompt_lessons")
        .insert({
          lesson: feedback.trim(),
          source_order_id: orderId,
        });
      if (error) {
        // Non-fatal — log but don't fail the revision workflow
        console.warn(`[order-revision] Could not save prompt lesson: ${error.message}`);
      } else {
        console.log(`[order-revision] Prompt lesson saved for order ${orderId}`);
      }
    });

    // ── Step N+4: Send new review email ───────────────────────────────────
    await step.run("send-revised-review-email", async () => {
      await sendAdminReviewEmail({
        order:       { ...enrichedOrder, report_title: `[REVISIE] ${enrichedOrder.report_title}` },
        pdfUrl:      newBlobUrl,
        reviewToken: newReviewToken,
        orderId,
      });
    });

    return { orderId, revised: true, newBlobUrl };
  }
);
