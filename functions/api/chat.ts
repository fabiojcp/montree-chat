interface Env {
  VITE_OPENROUTER_API_KEY: string;
}

export async function onRequestPost({
  request,
  env,
}: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const apiKey = env.VITE_OPENROUTER_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "VITE_OPENROUTER_API_KEY not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const upstream = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": String(new URL(request.url).origin),
        "X-OpenRouter-Title": "mini-chat",
      },
      body: JSON.stringify(body),
    },
  );

  const data: unknown = await upstream.json();

  return new Response(JSON.stringify(data), {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}
