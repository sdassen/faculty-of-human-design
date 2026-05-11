import { serve } from "inngest/next";
import { inngest } from "../lib/inngest/client.js";
import { orderDelivery } from "../lib/inngest/orderDelivery.js";

// Inngest serve handler — works with Vercel serverless functions
// (inngest/next is compatible with Vercel's Node.js runtime)
export default serve({
  client: inngest,
  functions: [orderDelivery],
});
