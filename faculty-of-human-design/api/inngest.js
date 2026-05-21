// Lazy-initialized Inngest serve handler.
// Static imports are intentionally avoided — any module-level throw in the
// import chain (e.g. missing env var in a constructor) would crash the entire
// Lambda on cold start and return FUNCTION_INVOCATION_FAILED for every request.
// Dynamic imports defer initialization to the first request, matching the
// pattern used by api/webhooks/stripe.js and api/create-order.js.

let _handler = null;

async function getHandler() {
  if (_handler) return _handler;

  const [{ serve }, { inngest }, { orderDelivery }, { articleGeneration }] =
    await Promise.all([
      import("inngest/next"),
      import("../lib/inngest/client.js"),
      import("../lib/inngest/orderDelivery.js"),
      import("../lib/inngest/articleGeneration.js"),
    ]);

  _handler = serve({
    client: inngest,
    functions: [orderDelivery, articleGeneration],
  });

  return _handler;
}

export default async function handler(req, res) {
  const h = await getHandler();
  return h(req, res);
}
