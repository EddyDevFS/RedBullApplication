const DOCUMENTS = {
  resume: "/assets/docs/eddy-sallault-resume.pdf",
  "wingfinder-report": "/assets/docs/eddy-sallault-wingfinder-report.pdf",
  "wingfinder-passport": "/assets/docs/eddy-sallault-wingfinder-passport.pdf",
};

const ADMIN_CSS = `
body{margin:0;font-family:Inter,ui-sans-serif,system-ui,sans-serif;background:#f6f8fb;color:#08111f}
main{width:min(1180px,calc(100% - 32px));margin:0 auto;padding:40px 0}
h1{margin:0 0 8px;font-size:clamp(2rem,5vw,4rem);line-height:.95}
p{color:#5d6b7c}.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:28px 0}
.card,table,.admin-form,.generated-link{background:white;border:1px solid rgba(8,17,31,.1);border-radius:8px;box-shadow:0 12px 32px rgba(8,17,31,.08)}
.card{padding:18px}.card strong{display:block;font-size:2rem}.card span{color:#5d6b7c;font-weight:700}
table{width:100%;border-collapse:collapse;overflow:hidden}th,td{padding:12px;border-bottom:1px solid rgba(8,17,31,.08);text-align:left;font-size:.9rem;vertical-align:top}
th{background:#08111f;color:white}code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.admin-form{display:grid;gap:14px;margin:28px 0;padding:18px}.admin-form h2{margin:0}.admin-form-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.admin-form label{display:grid;gap:6px;color:#082b66;font-size:.74rem;font-weight:900;text-transform:uppercase;letter-spacing:.08em}.admin-form input{min-height:42px;padding:9px 11px;border:1px solid rgba(8,17,31,.14);border-radius:6px;font:inherit}.admin-form button{min-height:42px;align-self:end;border:0;border-radius:999px;background:#082b66;color:white;font-weight:900;cursor:pointer}.generated-link{padding:14px 16px;margin:14px 0;background:#eef8f2;border-color:rgba(16,166,106,.28)}.generated-link input{width:100%;margin-top:8px;padding:10px;border:1px solid rgba(16,166,106,.35);border-radius:6px;font:inherit}
@media(max-width:760px){.grid{grid-template-columns:1fr 1fr}table{display:block;overflow-x:auto}}
`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return handleApi(request, env, url);
    }

    if (url.pathname === "/admin") {
      return handleAdmin(request, env);
    }

    if (url.pathname.startsWith("/d/")) {
      return handleDocument(request, env, url);
    }

    if (url.pathname.startsWith("/r/")) {
      const token = decodeURIComponent(url.pathname.slice(3));
      return serveApp(request, env, { enabled: true, token, canonicalPath: "/redbull" });
    }

    if (url.pathname === "/public/redbull") {
      return serveApp(request, env, { enabled: false, token: null, canonicalPath: "/redbull" });
    }

    if (url.pathname === "/redbull") {
      const trackingOff = url.searchParams.get("tracking") === "off";
      return serveApp(request, env, {
        enabled: !trackingOff && Boolean(url.searchParams.get("t")),
        token: trackingOff ? null : url.searchParams.get("t"),
        canonicalPath: "/redbull",
      });
    }

    return env.ASSETS.fetch(request);
  },
};

async function serveApp(request, env, tracking) {
  if (tracking.enabled) {
    const link = await env.DB.prepare("SELECT token, tracking_enabled FROM links WHERE token = ?")
      .bind(tracking.token)
      .first();
    if (!link && String(tracking.token).startsWith("RB-SHARE-")) {
      const url = new URL(request.url);
      await env.DB.prepare(
        "INSERT OR IGNORE INTO links (token, campaign, parent_token, tracking_enabled, status) VALUES (?, 'redbull-application', ?, 1, 'shared')",
      ).bind(tracking.token, url.searchParams.get("parent")).run();
      const from = url.searchParams.get("from");
      if (from) {
        await env.DB.prepare(
          "INSERT INTO events (session_id, token, event_type, event_data) VALUES (?, ?, 'share_link_generated', ?)",
        ).bind(null, tracking.token, JSON.stringify({ label: from, source: "shared_link_open" })).run();
      }
    } else if (!link || link.tracking_enabled === 0) {
      return new Response("Unknown or disabled tracking link.", { status: 404 });
    }
  }

  const assetUrl = new URL(request.url);
  assetUrl.pathname = "/";
  assetUrl.search = "";
  const response = await env.ASSETS.fetch(new Request(assetUrl.toString(), request));
  const html = await response.text();
  const injected = html.replace(
    "</head>",
    `<script>window.__TRACKING__=${JSON.stringify({
      enabled: tracking.enabled,
      token: tracking.token,
    })};</script></head>`,
  );
  return new Response(injected, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

async function handleApi(request, env, url) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  if (url.pathname === "/api/session/start") return startSession(request, env);
  if (url.pathname === "/api/track") return trackEvent(request, env);
  if (url.pathname === "/api/heartbeat") return heartbeat(request, env);
  if (url.pathname === "/api/share") return share(request, env, url);
  if (url.pathname === "/api/message") return message(request, env);
  return json({ error: "Not found" }, 404);
}

async function startSession(request, env) {
  const body = await readJson(request);
  const token = String(body.token ?? "");
  if (!token) return json({ error: "Missing token" }, 400);

  const link = await env.DB.prepare("SELECT token FROM links WHERE token = ? AND tracking_enabled = 1")
    .bind(token)
    .first();
  if (!link) return json({ error: "Unknown token" }, 404);

  const sessionId = `sess_${crypto.randomUUID()}`;
  const visitorId = getCookie(request, "rb_visitor_id") ?? `vis_${crypto.randomUUID()}`;
  const userAgent = request.headers.get("User-Agent") ?? "";
  const parsed = parseUserAgent(userAgent);
  const cf = request.cf ?? {};
  const referrer = request.headers.get("Referer") ?? "";

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO sessions (
        session_id, token, visitor_id, last_seen_at, page_views, device_type, browser, os,
        country, region, referrer, user_agent_hash, tracking_consent
      ) VALUES (?, ?, ?, CURRENT_TIMESTAMP, 1, ?, ?, ?, ?, ?, ?, ?, 1)`,
    ).bind(
      sessionId,
      token,
      visitorId,
      parsed.device,
      parsed.browser,
      parsed.os,
      cf.country ?? null,
      cf.region ?? null,
      referrer,
      await sha256(userAgent),
    ),
    env.DB.prepare(
      "UPDATE links SET last_opened_at = CURRENT_TIMESTAMP, status = 'opened' WHERE token = ?",
    ).bind(token),
  ]);

  return json(
    { sessionId, visitorId },
    200,
    { "Set-Cookie": `rb_visitor_id=${visitorId}; Path=/; Max-Age=31536000; SameSite=Lax; Secure; HttpOnly` },
  );
}

async function trackEvent(request, env) {
  const body = await readJson(request);
  const eventType = String(body.eventType ?? "");
  if (!eventType || !body.sessionId || !body.token) return json({ error: "Invalid event" }, 400);

  await env.DB.prepare(
    "INSERT INTO events (session_id, token, event_type, section_id, event_data, created_at) VALUES (?, ?, ?, ?, ?, ?)",
  )
    .bind(
      body.sessionId,
      body.token,
      eventType,
      body.sectionId ?? body.eventData?.sectionId ?? null,
      JSON.stringify(body.eventData ?? {}),
      body.timestamp ?? new Date().toISOString(),
    )
    .run();

  await env.DB.prepare("UPDATE sessions SET last_seen_at = CURRENT_TIMESTAMP WHERE session_id = ?")
    .bind(body.sessionId)
    .run();

  return json({ ok: true });
}

async function heartbeat(request, env) {
  const body = await readJson(request);
  if (!body.sessionId || !body.token) return json({ error: "Invalid heartbeat" }, 400);

  await env.DB.batch([
    env.DB.prepare(
      "UPDATE sessions SET last_seen_at = CURRENT_TIMESTAMP, active_time_seconds = active_time_seconds + 15 WHERE session_id = ?",
    ).bind(body.sessionId),
    env.DB.prepare(
      "INSERT INTO events (session_id, token, event_type, section_id, event_data) VALUES (?, ?, 'heartbeat', ?, ?)",
    ).bind(body.sessionId, body.token, body.currentSection ?? null, JSON.stringify({ active: Boolean(body.active) })),
  ]);

  return json({ ok: true });
}

async function share(request, env, url) {
  const body = await readJson(request);
  const parentToken = String(body.parentToken ?? "");
  if (!parentToken) return json({ error: "Missing parent token" }, 400);

  const parent = await env.DB.prepare("SELECT campaign FROM links WHERE token = ?").bind(parentToken).first();
  if (!parent) return json({ error: "Unknown parent token" }, 404);

  const shareToken = `RB-SHARE-${randomCode(5)}`;
  await env.DB.batch([
    env.DB.prepare(
      "INSERT INTO links (token, campaign, parent_token, tracking_enabled, status) VALUES (?, ?, ?, 1, 'shared')",
    ).bind(shareToken, parent.campaign ?? "redbull", parentToken),
    env.DB.prepare(
      "INSERT INTO events (session_id, token, event_type, event_data) VALUES (?, ?, 'share_link_generated', ?)",
    ).bind(body.sessionId ?? null, parentToken, JSON.stringify({ label: body.label ?? null, shareToken })),
  ]);

  return json({
    shareToken,
    shareUrl: `${url.origin}/r/${shareToken}`,
  });
}

async function message(request, env) {
  const body = await readJson(request);
  const type = String(body.type ?? "message");
  const firstName = String(body.firstName ?? "").slice(0, 120);
  const lastName = String(body.lastName ?? "").slice(0, 120);
  const email = String(body.email ?? "").slice(0, 200);
  const title = String(body.title ?? "").slice(0, 220);
  const messageBody = String(body.message ?? "").slice(0, 4000);
  const token = body.token ? String(body.token).slice(0, 80) : null;

  if (!email && !messageBody && !title) {
    return json({ error: "Missing message content" }, 400);
  }

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO messages (token, type, first_name, last_name, email, title, message, event_data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(token, type, firstName, lastName, email, title, messageBody, JSON.stringify(body)),
    env.DB.prepare(
      "INSERT INTO events (session_id, token, event_type, section_id, event_data) VALUES (?, ?, ?, 'wing-fitting-room', ?)",
    ).bind(null, token, type === "appointment_request" ? "appointment_request" : "message_sent", JSON.stringify(body)),
  ]);

  return json({ ok: true });
}

async function handleDocument(request, env, url) {
  const documentId = decodeURIComponent(url.pathname.slice(3));
  const fileUrl = DOCUMENTS[documentId];
  if (!fileUrl) return new Response("Unknown document.", { status: 404 });

  const token = url.searchParams.get("t");
  if (token) {
    await env.DB.prepare(
      "INSERT INTO events (session_id, token, event_type, section_id, event_data) VALUES (?, ?, 'document_download', 'standard-flight-file', ?)",
    )
      .bind(null, token, JSON.stringify({ documentId, fileUrl }))
      .run();
  }

  return Response.redirect(new URL(fileUrl, url.origin).toString(), 302);
}

async function handleAdmin(request, env) {
  const unauthorized = requireAdmin(request, env);
  if (unauthorized) return unauthorized;
  let generatedLink = null;

  if (request.method === "POST") {
    generatedLink = await createRecipientLink(request, env);
  }

  const [totals, recentSessions, topEvents, links, messages] = await Promise.all([
    env.DB.prepare(
      `SELECT
        (SELECT COUNT(*) FROM links) AS links,
        (SELECT COUNT(*) FROM sessions) AS sessions,
        (SELECT COUNT(*) FROM events) AS events,
        (SELECT COALESCE(SUM(active_time_seconds), 0) FROM sessions) AS active_seconds`,
    ).first(),
    env.DB.prepare(
      `SELECT s.token, l.parent_token, c.name, c.role, c.email, pc.name AS parent_name,
        s.session_id, s.started_at, s.last_seen_at,
        s.active_time_seconds, s.page_views, s.device_type, s.browser, s.os, s.country, s.region, s.referrer
       FROM sessions s
       LEFT JOIN links l ON l.token = s.token
       LEFT JOIN contacts c ON c.id = l.contact_id
       LEFT JOIN links pl ON pl.token = l.parent_token
       LEFT JOIN contacts pc ON pc.id = pl.contact_id
       ORDER BY s.started_at DESC
       LIMIT 30`,
    ).all(),
    env.DB.prepare(
      `SELECT event_type, COUNT(*) AS count
       FROM events
       GROUP BY event_type
       ORDER BY count DESC`,
    ).all(),
    env.DB.prepare(
      `SELECT l.token, l.parent_token, l.campaign, l.status, l.last_opened_at,
        c.name, c.company, c.role, c.email, pc.name AS parent_name
       FROM links l
       LEFT JOIN contacts c ON c.id = l.contact_id
       LEFT JOIN links pl ON pl.token = l.parent_token
       LEFT JOIN contacts pc ON pc.id = pl.contact_id
       ORDER BY l.created_at DESC
       LIMIT 40`,
    ).all(),
    env.DB.prepare(
      `SELECT type, first_name, last_name, email, title, message, token, created_at
       FROM messages
       ORDER BY created_at DESC
       LIMIT 40`,
    ).all(),
  ]);

  return html(renderAdmin(totals, recentSessions.results, topEvents.results, links.results, messages.results, generatedLink, new URL(request.url).origin));
}

async function createRecipientLink(request, env) {
  const form = await request.formData();
  const firstName = String(form.get("first_name") ?? "").trim();
  const lastName = String(form.get("last_name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const role = String(form.get("role") ?? "").trim();
  const company = String(form.get("company") ?? "Red Bull").trim();
  const notes = String(form.get("notes") ?? "").trim();
  const name = [firstName, lastName].filter(Boolean).join(" ").trim() || email || "Unnamed recipient";
  const token = `RB-${randomCode(5)}`;

  const contact = await env.DB.prepare(
    "INSERT INTO contacts (name, company, role, email, channel, notes) VALUES (?, ?, ?, ?, 'admin', ?) RETURNING id",
  ).bind(name, company, role, email, notes).first();

  await env.DB.prepare(
    "INSERT INTO links (token, contact_id, campaign, tracking_enabled, status) VALUES (?, ?, 'redbull-application', 1, 'created')",
  ).bind(token, contact.id).run();

  return { token, name, role, email };
}

function renderAdmin(totals, sessions, topEvents, links, messages, generatedLink, origin) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Red Bull Tracking Admin</title><style>${ADMIN_CSS}</style></head><body><main>
    <h1>Tracking Admin</h1>
    <p>Internal candidate file analytics. Engagement only, no invasive fingerprinting.</p>
    ${generatedLink ? renderGeneratedLink(generatedLink, origin) : ""}
    ${renderCreateRecipientForm()}
    <section class="grid">
      <div class="card"><strong>${totals.links}</strong><span>Links</span></div>
      <div class="card"><strong>${totals.sessions}</strong><span>Sessions</span></div>
      <div class="card"><strong>${totals.events}</strong><span>Events</span></div>
      <div class="card"><strong>${Math.round(totals.active_seconds / 60)}</strong><span>Active minutes</span></div>
    </section>
    <h2>Recent sessions</h2>${table(sessions, ["token","name","role","email","parent_token","parent_name","started_at","last_seen_at","active_time_seconds","device_type","browser","os","country","region"])}
    <h2>Messages & appointments</h2>${table(messages, ["type","first_name","last_name","email","title","message","token","created_at"])}
    <h2>Top events</h2>${table(topEvents, ["event_type","count"])}
    <h2>Links</h2>${table(links, ["token","name","company","role","email","parent_token","parent_name","campaign","status","last_opened_at"])}
  </main></body></html>`;
}

function renderGeneratedLink(link, origin) {
  const url = `${origin}/r/${link.token}`;
  return `<section class="generated-link">
    <strong>Link generated for ${escapeHtml(link.name)}</strong>
    <p>Copy this URL into your email. Token: <code>${escapeHtml(link.token)}</code></p>
    <input readonly value="${escapeHtml(url)}" onclick="this.select()">
  </section>`;
}

function renderCreateRecipientForm() {
  return `<form class="admin-form" method="post" action="/admin">
    <h2>Create recipient link</h2>
    <div class="admin-form-grid">
      <label>First name<input name="first_name" autocomplete="given-name"></label>
      <label>Last name<input name="last_name" autocomplete="family-name"></label>
      <label>Email<input name="email" type="email" autocomplete="email"></label>
      <label>Role / position<input name="role"></label>
      <label>Company<input name="company" value="Red Bull"></label>
      <label>Notes<input name="notes"></label>
      <button type="submit">Generate link</button>
    </div>
  </form>`;
}

function table(rows, columns) {
  return `<table><thead><tr>${columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("")}</tr></thead><tbody>${rows
    .map((row) => `<tr>${columns.map((column) => `<td>${escapeHtml(row[column] ?? "")}</td>`).join("")}</tr>`)
    .join("")}</tbody></table>`;
}

function requireAdmin(request, env) {
  const username = env.ADMIN_USER ?? "admin";
  const password = env.ADMIN_PASSWORD;
  if (!password) {
    return new Response("ADMIN_PASSWORD is not configured.", { status: 503 });
  }

  const header = request.headers.get("Authorization") ?? "";
  const expected = `Basic ${btoa(`${username}:${password}`)}`;
  if (header === expected) return null;

  return new Response("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Red Bull Tracking Admin"' },
  });
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function html(markup) {
  return new Response(markup, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

function getCookie(request, name) {
  const cookie = request.headers.get("Cookie") ?? "";
  return cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function parseUserAgent(userAgent) {
  const mobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /Chrome\//.test(userAgent)
      ? "Chrome"
      : /Safari\//.test(userAgent)
        ? "Safari"
        : /Firefox\//.test(userAgent)
          ? "Firefox"
          : "Other";
  const os = /Windows/i.test(userAgent)
    ? "Windows"
    : /Mac OS X/i.test(userAgent)
      ? "macOS"
      : /Android/i.test(userAgent)
        ? "Android"
        : /iPhone|iPad/i.test(userAgent)
          ? "iOS"
          : "Other";
  return { device: mobile ? "mobile" : "desktop", browser, os };
}

async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function randomCode(length) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return [...bytes].map((byte) => alphabet[byte % alphabet.length]).join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
