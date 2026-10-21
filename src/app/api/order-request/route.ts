/**
 * Optional hand-off of an order request to an automation workflow (for
 * example an n8n webhook that emails the maker and logs the order).
 * Does nothing unless ORDER_WEBHOOK_URL is set on the server.
 */
export async function POST(request: Request) {
  const webhook = process.env.ORDER_WEBHOOK_URL;
  if (!webhook) return Response.json({ forwarded: false });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const r = body as Record<string, unknown>;
  if (typeof r?.ref !== "string" || typeof r?.productId !== "string") {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });
    return Response.json({ forwarded: res.ok });
  } catch {
    return Response.json({ forwarded: false });
  }
}
