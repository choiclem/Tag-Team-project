const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type EmailEntry = {
  source?: string;
  author?: string;
  text?: string;
  imageCount?: number;
  createdAt?: string;
};

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[char] || char));
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function validateRecipient(to: string) {
  const allowed = Deno.env.get("ALLOWED_RECIPIENTS")?.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
  if (!allowed?.length) return true;
  return allowed.includes(to.toLowerCase());
}

function buildEmailHtml(entries: EmailEntry[], sentBy: string) {
  const rows = entries.map((entry) => {
    const text = escapeHtml(entry.text || "(no text)").replace(/\n/g, "<br>");
    const imageNote = entry.imageCount ? `<div style="color:#666;font-size:12px;margin-top:6px;">Images: ${entry.imageCount}</div>` : "";
    return `
      <article style="border:1px solid #e5e5e5;border-radius:10px;padding:12px;margin:0 0 10px;background:#fafafa;">
        <div style="font-size:12px;color:#666;margin-bottom:6px;">
          <strong>${escapeHtml(entry.source)}</strong>
          · ${escapeHtml(entry.author)}
          · ${escapeHtml(entry.createdAt)}
        </div>
        <div style="font-size:14px;line-height:1.55;color:#111;">${text}</div>
        ${imageNote}
      </article>`;
  }).join("");

  return `
    <div style="font-family:Arial,'Noto Sans KR',sans-serif;max-width:680px;margin:0 auto;color:#111;">
      <h2 style="margin:0 0 4px;">Devlog Duo - Today's updates</h2>
      <p style="margin:0 0 18px;color:#666;font-size:13px;">Sent by ${escapeHtml(sentBy)} · ${entries.length} update(s)</p>
      ${rows}
    </div>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("RESEND_FROM_EMAIL") || "Devlog Duo <onboarding@resend.dev>";
  if (!apiKey) return json({ error: "Missing RESEND_API_KEY" }, 500);

  let body: { to?: string; subject?: string; sentBy?: string; entries?: EmailEntry[] };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const to = body.to?.trim();
  const entries = Array.isArray(body.entries) ? body.entries.slice(0, 100) : [];
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return json({ error: "Valid recipient email is required" }, 400);
  if (!validateRecipient(to)) return json({ error: "Recipient is not allowed" }, 403);
  if (!entries.length) return json({ error: "No updates to send" }, 400);

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: body.subject || "Devlog Duo Today's updates",
      html: buildEmailHtml(entries, body.sentBy || "Devlog Duo"),
    }),
  });

  const result = await resendResponse.json().catch(() => ({}));
  if (!resendResponse.ok) return json({ error: "Resend failed", details: result }, resendResponse.status);

  return json({ message: "이메일을 보냈습니다", id: result.id });
});
