const DOCUMENTS = {
  resume: "/assets/docs/eddy-sallault-resume.pdf",
  "wingfinder-report": "/assets/docs/eddy-sallault-wingfinder-report.pdf",
  "wingfinder-passport": "/assets/docs/eddy-sallault-wingfinder-passport.pdf",
};

const ADMIN_CSS = `
body{margin:0;font-family:Inter,ui-sans-serif,system-ui,sans-serif;background:#f6f8fb;color:#08111f}
main{width:min(1180px,calc(100% - 32px));margin:0 auto;padding:40px 0}
h1{margin:0 0 8px;font-size:clamp(2rem,5vw,4rem);line-height:.95}
p{color:#5d6b7c}.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:28px 0}a{color:#0f4ea8;font-weight:800;text-decoration:none}a:hover{text-decoration:underline}
.card,table,.admin-form,.generated-link{background:white;border:1px solid rgba(8,17,31,.1);border-radius:8px;box-shadow:0 12px 32px rgba(8,17,31,.08)}
.card{padding:18px}.card strong{display:block;font-size:2rem}.card span{color:#5d6b7c;font-weight:700}
table{width:100%;border-collapse:collapse;overflow:hidden}th,td{padding:12px;border-bottom:1px solid rgba(8,17,31,.08);text-align:left;font-size:.9rem;vertical-align:top}
th{background:#08111f;color:white}code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.admin-form{display:grid;gap:14px;margin:28px 0;padding:18px}.admin-form h2{margin:0}.admin-form-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.admin-form label{display:grid;gap:6px;color:#082b66;font-size:.74rem;font-weight:900;text-transform:uppercase;letter-spacing:.08em}.admin-form input{min-height:42px;padding:9px 11px;border:1px solid rgba(8,17,31,.14);border-radius:6px;font:inherit}.admin-form button{min-height:42px;align-self:end;border:0;border-radius:999px;background:#082b66;color:white;font-weight:900;cursor:pointer}.generated-link{padding:14px 16px;margin:14px 0;background:#eef8f2;border-color:rgba(16,166,106,.28)}.generated-link input{width:100%;margin-top:8px;padding:10px;border:1px solid rgba(16,166,106,.35);border-radius:6px;font:inherit}.timeline{display:grid;gap:10px}.timeline-item{padding:14px 16px;background:white;border:1px solid rgba(8,17,31,.1);border-radius:8px;box-shadow:0 8px 24px rgba(8,17,31,.06)}.timeline-item strong{display:block}.timeline-item small{color:#5d6b7c}.timeline-item pre{white-space:pre-wrap;word-break:break-word;background:#f6f8fb;border-radius:6px;padding:10px;max-height:220px;overflow:auto}.badge{display:inline-block;padding:4px 8px;border-radius:999px;background:#eef2f7;color:#082b66;font-size:.74rem;font-weight:900}
.insight-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:16px;margin:24px 0}.insight-card{background:white;border:1px solid rgba(8,17,31,.1);border-radius:8px;box-shadow:0 12px 32px rgba(8,17,31,.08);padding:18px}.insight-card h2,.insight-card h3{margin:0 0 12px}.metric-list{display:grid;gap:10px}.metric-row{display:grid;grid-template-columns:1fr auto;gap:16px;align-items:start;padding:10px 0;border-bottom:1px solid rgba(8,17,31,.08)}.metric-row:last-child{border-bottom:0}.metric-row strong{font-size:1rem}.metric-row span{color:#5d6b7c}.metric-value{font-weight:900;color:#08111f;white-space:nowrap}.section-bar{height:8px;background:#e8eef6;border-radius:999px;overflow:hidden;margin-top:7px}.section-bar span{display:block;height:100%;background:#0f4ea8;border-radius:999px}.empty{padding:18px;background:white;border:1px dashed rgba(8,17,31,.2);border-radius:8px;color:#5d6b7c}.details{margin-top:28px}.details summary{cursor:pointer;font-weight:900;color:#082b66;margin-bottom:12px}.action-table td:first-child{white-space:nowrap;color:#5d6b7c}.subtle{color:#5d6b7c}.kicker{font-weight:900;color:#082b66;text-transform:uppercase;letter-spacing:.08em}
@media(max-width:760px){.grid,.insight-grid{grid-template-columns:1fr}table{display:block;overflow-x:auto}.admin-form-grid{grid-template-columns:1fr}}
`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return handleApi(request, env, url);
    }

    if (url.pathname === "/admin/session") {
      return handleAdminSession(request, env, url);
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
    return Response.redirect(`${new URL(request.url).origin}/admin?created=${encodeURIComponent(generatedLink.token)}`, 303);
  }

  const createdToken = new URL(request.url).searchParams.get("created");
  if (createdToken) {
    generatedLink = await env.DB.prepare(
      `SELECT l.token, c.name, c.role, c.email
       FROM links l
       LEFT JOIN contacts c ON c.id = l.contact_id
       WHERE l.token = ?`,
    ).bind(createdToken).first();
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
        COALESCE(c.name,
          (SELECT TRIM(COALESCE(json_extract(e.event_data, '$.firstName'), '') || ' ' || COALESCE(json_extract(e.event_data, '$.lastName'), ''))
           FROM events e
           WHERE e.session_id = s.session_id AND e.event_type = 'visitor_identified'
           ORDER BY e.created_at DESC LIMIT 1),
          'Anonymous visitor'
        ) AS visitor,
        s.session_id, s.started_at, s.last_seen_at,
        s.active_time_seconds, s.page_views, s.device_type, s.browser, s.os, s.country, s.region, s.referrer
       FROM sessions s
       LEFT JOIN links l ON l.token = s.token
       LEFT JOIN contacts c ON c.id = l.contact_id
       LEFT JOIN links pl ON pl.token = l.parent_token
       LEFT JOIN contacts pc ON pc.id = pl.contact_id
       WHERE datetime(s.started_at) >= datetime('now', '-15 days')
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
    <h2>Connection journal - last 15 days</h2>${connectionsTable(sessions)}
    <h2>Messages & appointments</h2>${table(messages, ["type","first_name","last_name","email","title","message","token","created_at"])}
    <h2>Top events</h2>${table(topEvents, ["event_type","count"])}
    <h2>Links</h2>${table(links, ["token","name","company","role","email","parent_token","parent_name","campaign","status","last_opened_at"])}
  </main></body></html>`;
}

async function handleAdminSession(request, env, url) {
  const unauthorized = requireAdmin(request, env);
  if (unauthorized) return unauthorized;

  const sessionId = url.searchParams.get("session_id");
  if (!sessionId) return html(renderAdminShell("<h1>Missing session_id</h1><p><a href=\"/admin\">Back to admin</a></p>"));

  const session = await env.DB.prepare(
    `SELECT s.*, l.parent_token, c.name, c.company, c.role, c.email, pc.name AS parent_name
     FROM sessions s
     LEFT JOIN links l ON l.token = s.token
     LEFT JOIN contacts c ON c.id = l.contact_id
     LEFT JOIN links pl ON pl.token = l.parent_token
     LEFT JOIN contacts pc ON pc.id = pl.contact_id
     WHERE s.session_id = ?`,
  ).bind(sessionId).first();

  if (!session) return html(renderAdminShell("<h1>Session not found</h1><p><a href=\"/admin\">Back to admin</a></p>"));

  const events = (await env.DB.prepare(
    `SELECT event_type, section_id, event_data, created_at
     FROM events
     WHERE session_id = ? OR (session_id IS NULL AND token = ?)
     ORDER BY created_at ASC`,
  ).bind(sessionId, session.token).all()).results;

  const visitor = visitorLabel(session, events);
  const summary = summarizeEvents(events, session);

  return html(renderAdminShell(`
    <p><a href="/admin">Back to admin</a></p>
    <h1>${escapeHtml(visitor)}</h1>
    <p>
      <span class="badge">${escapeHtml(session.token)}</span>
      ${session.parent_name ? `<span class="badge">Invited by ${escapeHtml(session.parent_name)}</span>` : ""}
      <span class="badge">${escapeHtml(session.device_type ?? "unknown device")}</span>
      <span class="badge">${escapeHtml([session.country, session.region].filter(Boolean).join(" / ") || "unknown location")}</span>
    </p>
    <section class="grid">
      <div class="card"><strong>${escapeHtml(formatDuration(summary.activeSeconds))}</strong><span>Active time on site</span></div>
      <div class="card"><strong>${summary.sections.length}</strong><span>Sections viewed</span></div>
      <div class="card"><strong>${summary.articleOpenCount}</strong><span>Articles opened</span></div>
      <div class="card"><strong>${summary.actions.length}</strong><span>Clicks / actions</span></div>
    </section>
    <section class="insight-grid">
      <article class="insight-card">
        <p class="kicker">Behavior report</p>
        <h2>What this visitor actually did</h2>
        <div class="metric-list">
          ${summary.keyFindings.map((item) => `<div class="metric-row"><strong>${escapeHtml(item.label)}</strong><span class="metric-value">${escapeHtml(item.value)}</span></div>`).join("")}
        </div>
      </article>
      <article class="insight-card">
        <p class="kicker">Visitor profile</p>
        <h2>Context</h2>
        <div class="metric-list">
          <div class="metric-row"><strong>Identity</strong><span>${escapeHtml(visitor)}</span></div>
          <div class="metric-row"><strong>Email</strong><span>${escapeHtml(session.email ?? "Unknown")}</span></div>
          <div class="metric-row"><strong>Role</strong><span>${escapeHtml(session.role ?? "Unknown")}</span></div>
          <div class="metric-row"><strong>Session</strong><span><code>${escapeHtml(session.session_id)}</code></span></div>
          <div class="metric-row"><strong>Referrer</strong><span>${escapeHtml(session.referrer ?? "Direct")}</span></div>
        </div>
      </article>
    </section>
    <h2>Time by section</h2>
    ${summary.sections.length ? renderSectionSummary(summary.sections, summary.maxSectionSeconds) : `<p class="empty">No section view recorded yet.</p>`}
    <h2>Articles opened</h2>
    ${summary.articles.length ? renderArticleSummary(summary.articles) : `<p class="empty">No article opened yet.</p>`}
    <h2>Actions and clicks</h2>
    ${summary.actions.length ? renderActionSummary(summary.actions) : `<p class="empty">No click or explicit action recorded yet.</p>`}
    <details class="details">
      <summary>Complete raw behavior timeline</summary>
      <div class="timeline">${events.map(renderTimelineEvent).join("") || "<p>No event recorded yet.</p>"}</div>
    </details>
  `));
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

function renderAdminShell(content) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Red Bull Tracking Admin</title><style>${ADMIN_CSS}</style></head><body><main>${content}</main></body></html>`;
}

function connectionsTable(rows) {
  return `<table><thead><tr>${["visitor","token","origin","started_at","last_seen_at","active_time_seconds","device_type","browser","country","region"].map((column) => `<th>${escapeHtml(column)}</th>`).join("")}</tr></thead><tbody>${rows
    .map((row) => {
      const visitor = row.visitor?.trim() || row.name || "Anonymous visitor";
      const origin = row.parent_name ? `Invited by ${row.parent_name}` : row.parent_token ? `Invited by ${row.parent_token}` : "Direct tracked link";
      return `<tr>
        <td><a href="/admin/session?session_id=${encodeURIComponent(row.session_id)}">${escapeHtml(visitor)}</a></td>
        <td><code>${escapeHtml(row.token ?? "")}</code></td>
        <td>${escapeHtml(origin)}</td>
        <td>${escapeHtml(row.started_at ?? "")}</td>
        <td>${escapeHtml(row.last_seen_at ?? "")}</td>
        <td>${escapeHtml(row.active_time_seconds ?? 0)}s</td>
        <td>${escapeHtml(row.device_type ?? "")}</td>
        <td>${escapeHtml(row.browser ?? "")}</td>
        <td>${escapeHtml(row.country ?? "")}</td>
        <td>${escapeHtml(row.region ?? "")}</td>
      </tr>`;
    })
    .join("")}</tbody></table>`;
}

function visitorLabel(session, events) {
  if (session.name) return session.name;
  const identified = [...events].reverse().find((event) => event.event_type === "visitor_identified");
  if (identified) {
    const data = parseEventData(identified.event_data);
    const name = [data.firstName, data.lastName].filter(Boolean).join(" ").trim();
    if (name) return name;
  }
  return "Anonymous visitor";
}

function summarizeEvents(events, session = {}) {
  const sorted = [...events].sort((a, b) => eventMs(a) - eventMs(b));
  const sectionMap = new Map();
  const articleMap = new Map();
  const actions = [];
  const hasHeartbeats = sorted.some((event) => event.event_type === "heartbeat");
  let currentSection = null;

  sorted.forEach((event, index) => {
    const data = parseEventData(event.event_data);
    const next = sorted[index + 1];
    const delta = next ? Math.max(0, Math.min(60, Math.round((eventMs(next) - eventMs(event)) / 1000))) : 0;

    if (event.event_type === "section_view") {
      currentSection = {
        id: data.sectionId || event.section_id || "unknown-section",
        title: data.sectionTitle || data.sectionId || event.section_id || "Unknown section",
      };
      touchSection(sectionMap, currentSection.id, currentSection.title).views += 1;
    }

    if (!hasHeartbeats && currentSection && delta > 0) {
      touchSection(sectionMap, currentSection.id, currentSection.title).seconds += delta;
    }

    if (event.event_type === "heartbeat") {
      const sectionId = event.section_id || data.currentSection || data.sectionId || currentSection?.id || "active-session";
      const title = readableSection(sectionId);
      touchSection(sectionMap, sectionId, title).seconds += 15;
    }

    if (event.event_type === "case_article_open") {
      const articleId = data.caseId || data.articleTitle || "unknown-article";
      const article = touchArticle(articleMap, articleId, data.articleTitle || data.caseTitle || articleId);
      article.opens += 1;
      article.sources.add(data.source || "direct");
      article.seconds += estimateArticleSeconds(sorted, index, articleId);
    }

    const action = summarizeAction(event, data);
    if (action) actions.push(action);
  });

  const sections = [...sectionMap.values()]
    .map((section) => ({ ...section, seconds: Math.min(section.seconds, session.active_time_seconds ?? section.seconds) }))
    .sort((a, b) => b.seconds - a.seconds || b.views - a.views);
  const articles = [...articleMap.values()]
    .map((article) => ({ ...article, sources: [...article.sources].filter(Boolean).join(", ") }))
    .sort((a, b) => b.seconds - a.seconds || b.opens - a.opens);
  const activeSeconds = Math.max(session.active_time_seconds ?? 0, sections.reduce((sum, section) => sum + section.seconds, 0));
  const articleSeconds = articles.reduce((sum, article) => sum + article.seconds, 0);
  const topSection = sections[0];
  const topArticle = articles[0];
  const lastAction = actions[actions.length - 1];

  return {
    activeSeconds,
    sections,
    maxSectionSeconds: Math.max(1, ...sections.map((section) => section.seconds)),
    articles,
    articleOpenCount: articles.reduce((sum, article) => sum + article.opens, 0),
    articleSeconds,
    actions,
    keyFindings: [
      { label: "Active time on site", value: formatDuration(activeSeconds) },
      { label: "Main section", value: topSection ? `${topSection.title} (${formatDuration(topSection.seconds)})` : "Not enough data yet" },
      { label: "Article engagement", value: topArticle ? `${topArticle.title} (${formatDuration(topArticle.seconds)})` : "No article opened" },
      { label: "Total article reading time", value: formatDuration(articleSeconds) },
      { label: "Last explicit action", value: lastAction ? `${lastAction.label} at ${formatClock(lastAction.created_at)}` : "No action yet" },
    ],
  };
}

function touchSection(sectionMap, id, title) {
  if (!sectionMap.has(id)) sectionMap.set(id, { id, title: title || readableSection(id), views: 0, seconds: 0 });
  return sectionMap.get(id);
}

function touchArticle(articleMap, id, title) {
  if (!articleMap.has(id)) articleMap.set(id, { id, title: title || id, opens: 0, seconds: 0, sources: new Set() });
  return articleMap.get(id);
}

function estimateArticleSeconds(events, openIndex, articleId) {
  const openedAt = eventMs(events[openIndex]);
  const close = events.slice(openIndex + 1).find((event) => {
    const data = parseEventData(event.event_data);
    if (event.event_type !== "case_article_close") return false;
    return !articleId || data.caseId === articleId || data.articleTitle === articleId;
  });
  if (close) return Math.max(1, Math.min(900, Math.round((eventMs(close) - openedAt) / 1000)));
  const next = events[openIndex + 1];
  if (!next) return 0;
  return Math.max(1, Math.min(120, Math.round((eventMs(next) - openedAt) / 1000)));
}

function summarizeAction(event, data) {
  const type = event.event_type;
  const clickableTypes = new Set([
    "cta_click",
    "case_file_open",
    "document_click",
    "document_download",
    "linkedin_click",
    "email_click",
    "share_link_generated",
    "appointment_request",
    "message_sent",
    "no_fit_today",
    "gap_file_open",
    "gap_control_marked",
    "proof_validated",
  ]);
  if (!clickableTypes.has(type)) return null;

  return {
    created_at: event.created_at,
    type,
    section: readableSection(event.section_id || data.sectionId || data.currentSection || ""),
    label: eventLabel(type, data, event.section_id),
    target: data.articleTitle || data.caseTitle || data.title || data.label || data.documentId || data.caseId || data.flagId || data.ctaId || "",
  };
}

function renderSectionSummary(sections, maxSeconds) {
  return `<table><thead><tr><th>section</th><th>active time</th><th>views</th><th>share</th></tr></thead><tbody>${sections
    .map((section) => {
      const width = Math.max(6, Math.round((section.seconds / maxSeconds) * 100));
      return `<tr>
        <td><strong>${escapeHtml(section.title)}</strong><br><span class="subtle">${escapeHtml(section.id)}</span></td>
        <td>${escapeHtml(formatDuration(section.seconds))}</td>
        <td>${escapeHtml(section.views)}</td>
        <td><div class="section-bar"><span style="width:${width}%"></span></div></td>
      </tr>`;
    })
    .join("")}</tbody></table>`;
}

function renderArticleSummary(articles) {
  return `<table><thead><tr><th>article</th><th>opens</th><th>time on article</th><th>source</th></tr></thead><tbody>${articles
    .map((article) => `<tr>
      <td><strong>${escapeHtml(article.title)}</strong><br><span class="subtle">${escapeHtml(article.id)}</span></td>
      <td>${escapeHtml(article.opens)}</td>
      <td>${escapeHtml(formatDuration(article.seconds))}</td>
      <td>${escapeHtml(article.sources || "direct")}</td>
    </tr>`)
    .join("")}</tbody></table>`;
}

function renderActionSummary(actions) {
  return `<table class="action-table"><thead><tr><th>time</th><th>action</th><th>target</th><th>section</th></tr></thead><tbody>${actions
    .map((action) => `<tr>
      <td>${escapeHtml(formatClock(action.created_at))}</td>
      <td><strong>${escapeHtml(action.label)}</strong><br><span class="badge">${escapeHtml(action.type)}</span></td>
      <td>${escapeHtml(action.target || "Site action")}</td>
      <td>${escapeHtml(action.section || "Unknown")}</td>
    </tr>`)
    .join("")}</tbody></table>`;
}

function readableSection(value) {
  if (!value) return "";
  return String(value)
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function eventMs(event) {
  const timestamp = Date.parse(event.created_at || "");
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function formatDuration(seconds) {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  const minutes = Math.floor(total / 60);
  const remaining = total % 60;
  if (minutes <= 0) return `${remaining}s`;
  if (remaining === 0) return `${minutes}m`;
  return `${minutes}m ${remaining}s`;
}

function formatClock(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function renderTimelineEvent(event) {
  const data = parseEventData(event.event_data);
  const label = eventLabel(event.event_type, data, event.section_id);
  return `<article class="timeline-item">
    <small>${escapeHtml(event.created_at ?? "")}</small>
    <strong>${escapeHtml(label)}</strong>
    <span class="badge">${escapeHtml(event.event_type)}</span>
    ${event.section_id ? `<span class="badge">${escapeHtml(event.section_id)}</span>` : ""}
    <pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>
  </article>`;
}

function eventLabel(type, data, sectionId) {
  if (type === "page_view") return `Opened candidate file`;
  if (type === "section_view") return `Viewed section: ${data.sectionTitle || data.sectionId || sectionId || "unknown"}`;
  if (type === "scroll_depth") return `Scrolled to ${data.depth}%`;
  if (type === "case_file_open") return `Opened case file: ${data.caseTitle || data.caseId || "unknown"}`;
  if (type === "case_article_open") return `Opened full article: ${data.articleTitle || data.caseId || "unknown"}`;
  if (type === "proof_validated") return `Validated proof: ${data.requirement || data.proofId || "unknown"}`;
  if (type === "gap_file_open") return `Opened gap file: ${data.title || data.flagId || "unknown"}`;
  if (type === "gap_control_marked") return `Marked gap controlled: ${data.flagId || "unknown"}`;
  if (type === "document_click") return `Clicked document: ${data.documentId || data.label || "unknown"}`;
  if (type === "document_download") return `Downloaded document: ${data.documentId || "unknown"}`;
  if (type === "linkedin_click") return `Clicked LinkedIn`;
  if (type === "email_click") return `Clicked email action: ${data.label || "email"}`;
  if (type === "cta_click") return `Clicked CTA: ${data.label || data.ctaId || "unknown"}`;
  if (type === "share_link_generated") return `Generated or opened shared invite link`;
  if (type === "visitor_identified") return `Visitor identified: ${[data.firstName, data.lastName].filter(Boolean).join(" ")}`;
  if (type === "visitor_anonymous") return `Visitor chose anonymous mode`;
  if (type === "appointment_request") return `Sent appointment request`;
  if (type === "message_sent") return `Sent message`;
  if (type === "no_fit_today") return `Marked no fit today`;
  if (type === "return_visit") return `Returned visit`;
  if (type === "heartbeat") return `Active heartbeat`;
  if (type === "exit") return `Exited page`;
  return type;
}

function parseEventData(value) {
  try {
    return value ? JSON.parse(value) : {};
  } catch {
    return {};
  }
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
