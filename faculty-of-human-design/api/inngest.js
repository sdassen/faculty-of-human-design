// Lazy-initialized Inngest serve handler.
// Sequential imports with explicit logging — lets us identify exactly which
// module in the chain throws during evaluation (previously truncated to
// "file:///var/task/faculty-of..." in Vercel runtime logs).

let _handler = null;
let _initError = null;

async function getHandler() {
  if (_handler) return _handler;
  if (_initError) throw _initError;

  let serve, inngest, orderDelivery, orderRevision, articleGeneration;

  try {
    console.log("[inngest-init] importing inngest/next...");
    ({ serve } = await import("inngest/next"));
    console.log("[inngest-init] inngest/next OK");
  } catch (err) {
    console.error("[inngest-init] FAILED at inngest/next:", err.message, err.stack);
    _initError = err;
    throw err;
  }

  try {
    console.log("[inngest-init] importing client...");
    ({ inngest } = await import("../lib/inngest/client.js"));
    console.log("[inngest-init] client OK");
  } catch (err) {
    console.error("[inngest-init] FAILED at client:", err.message, err.stack);
    _initError = err;
    throw err;
  }

  try {
    console.log("[inngest-init] importing orderDelivery...");
    ({ orderDelivery } = await import("../lib/inngest/orderDelivery.js"));
    console.log("[inngest-init] orderDelivery OK");
  } catch (err) {
    console.error("[inngest-init] FAILED at orderDelivery:", err.message, err.stack);
    _initError = err;
    throw err;
  }

  try {
    console.log("[inngest-init] importing orderRevision...");
    ({ orderRevision } = await import("../lib/inngest/orderRevision.js"));
    console.log("[inngest-init] orderRevision OK");
  } catch (err) {
    console.error("[inngest-init] FAILED at orderRevision:", err.message, err.stack);
    _initError = err;
    throw err;
  }

  try {
    console.log("[inngest-init] importing articleGeneration...");
    ({ articleGeneration } = await import("../lib/inngest/articleGeneration.js"));
    console.log("[inngest-init] articleGeneration OK");
  } catch (err) {
    console.error("[inngest-init] FAILED at articleGeneration:", err.message, err.stack);
    _initError = err;
    throw err;
  }

  try {
    console.log("[inngest-init] calling serve()...");
    _handler = serve({
      client: inngest,
      functions: [orderDelivery, orderRevision, articleGeneration],
    });
    console.log("[inngest-init] handler ready");
    return _handler;
  } catch (err) {
    console.error("[inngest-init] FAILED at serve():", err.message, err.stack);
    _initError = err;
    throw err;
  }
}

export default async function handler(req, res) {
  try {
    const h = await getHandler();
    return h(req, res);
  } catch (err) {
    console.error("[inngest] request failed:", err.message);
    res.status(500).json({ error: "inngest init failed", message: err.message });
  }
}
