type TrackingConfig = {
  enabled: boolean;
  token: string | null;
};

type TrackPayload = Record<string, unknown>;

declare global {
  interface Window {
    __TRACKING__?: Partial<TrackingConfig>;
    track?: (eventType: string, eventData?: TrackPayload) => void;
  }
}

const SECTION_TITLES: Record<string, string> = {
  hero: "Hero",
  "role-blueprint": "Role Blueprint",
  "candidate-scan": "Candidate Scan",
  "evidence-validation": "Evidence Validation",
  "proof-archive": "Proof Archive",
  "gap-review-risk-control": "Gap Review / Risk Control File",
  "wing-fitting-room": "Wing Fitting Room",
  "standard-flight-file": "Standard Flight File",
};

const HEARTBEAT_MS = 15_000;
const SCROLL_DEPTHS = [25, 50, 75, 100];

let config: TrackingConfig | null = null;
let sessionId: string | null = null;
let visitorId: string | null = null;
let started = false;
let currentSection: string | null = null;
let heartbeatTimer: number | null = null;
const viewedSections = new Set<string>();
const sentDepths = new Set<number>();
const pendingEvents: Array<{ eventType: string; eventData: TrackPayload }> = [];

function readConfig(): TrackingConfig {
  const params = new URLSearchParams(window.location.search);
  const tokenFromRoute = window.location.pathname.match(/^\/r\/([^/?#]+)/)?.[1] ?? null;
  const token = window.__TRACKING__?.token ?? params.get("t") ?? tokenFromRoute;
  const explicitlyOff =
    window.__TRACKING__?.enabled === false ||
    params.get("tracking") === "off" ||
    window.location.pathname.startsWith("/public/");

  return {
    enabled: Boolean(!explicitlyOff && token),
    token: explicitlyOff ? null : token,
  };
}

function postJson(path: string, payload: TrackPayload, keepalive = true) {
  return fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive,
  }).catch(() => undefined);
}

function sendBeaconOrFetch(path: string, payload: TrackPayload) {
  const body = JSON.stringify(payload);
  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon(path, blob)) return;
  }
  void postJson(path, payload);
}

function track(eventType: string, eventData: TrackPayload = {}) {
  if (!config?.enabled || !config.token) return;
  if (!sessionId) {
    pendingEvents.push({ eventType, eventData });
    return;
  }

  sendBeaconOrFetch("/api/track", {
    token: config.token,
    sessionId,
    eventType,
    sectionId: typeof eventData.sectionId === "string" ? eventData.sectionId : currentSection,
    eventData,
    timestamp: new Date().toISOString(),
  });
}

async function startSession() {
  if (!config?.enabled || !config.token) return;

  const response = await postJson(
    "/api/session/start",
    {
      token: config.token,
      page: window.location.pathname,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: {
        width: window.screen.width,
        height: window.screen.height,
      },
    },
    false,
  );

  if (!response?.ok) return;
  const data = (await response.json()) as { sessionId?: string; visitorId?: string };
  sessionId = data.sessionId ?? null;
  visitorId = data.visitorId ?? null;

  track("page_view", {
    path: window.location.pathname,
    title: document.title,
    visitorId,
  });

  const storedVisitor = window.localStorage.getItem("rb_visitor_id");
  if (visitorId) window.localStorage.setItem("rb_visitor_id", visitorId);
  if (storedVisitor && storedVisitor === visitorId) {
    track("return_visit", { visitorId });
  }

  while (pendingEvents.length) {
    const event = pendingEvents.shift();
    if (event) track(event.eventType, event.eventData);
  }
}

function setupHeartbeat() {
  if (!config?.enabled || !config.token) return;
  const send = () => {
    if (!sessionId || document.visibilityState !== "visible") return;
    sendBeaconOrFetch("/api/heartbeat", {
      token: config?.token,
      sessionId,
      active: true,
      currentSection,
    });
  };

  heartbeatTimer = window.setInterval(send, HEARTBEAT_MS);
  window.addEventListener("visibilitychange", send);
  window.addEventListener("pagehide", () => {
    if (!sessionId) return;
    sendBeaconOrFetch("/api/track", {
      token: config?.token,
      sessionId,
      eventType: "exit",
      sectionId: currentSection,
      eventData: { currentSection },
      timestamp: new Date().toISOString(),
    });
  });
}

function setupSections() {
  const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-track-section]"));
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const sectionId = entry.target.getAttribute("data-track-section");
        if (!sectionId) return;
        currentSection = sectionId;
        if (viewedSections.has(sectionId)) return;
        viewedSections.add(sectionId);
        track("section_view", {
          sectionId,
          sectionTitle: SECTION_TITLES[sectionId] ?? sectionId,
          percentVisible: Math.round(entry.intersectionRatio * 100),
        });
      });
    },
    { threshold: [0.25, 0.5, 0.75] },
  );

  sections.forEach((section) => observer.observe(section));
}

function setupScrollDepth() {
  const update = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const depth = Math.min(100, Math.round((window.scrollY / scrollable) * 100));
    SCROLL_DEPTHS.forEach((target) => {
      if (depth >= target && !sentDepths.has(target)) {
        sentDepths.add(target);
        track("scroll_depth", { depth: target });
      }
    });
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
}

function setupClickDelegation() {
  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-track-click]") : null;
    if (!target) return;

    const eventType = target.dataset.trackClick;
    if (!eventType) return;

    track(eventType, {
      ctaId: target.dataset.trackId,
      label: target.dataset.trackLabel ?? target.textContent?.trim(),
      documentId: target.dataset.documentId,
      caseId: target.dataset.caseId,
      flagId: target.dataset.flagId,
      proofId: target.dataset.proofId,
    });
  });
}

export function initTracking() {
  if (started || typeof window === "undefined") return;
  started = true;
  config = readConfig();
  window.track = track;

  if (!config.enabled) return;

  void startSession().then(() => {
    setupSections();
    setupScrollDepth();
    setupClickDelegation();
    setupHeartbeat();
  });
}

export function trackEvent(eventType: string, eventData?: TrackPayload) {
  track(eventType, eventData);
}

export function isSharedInvitationVisit() {
  const activeConfig = config ?? readConfig();
  return Boolean(activeConfig.enabled && activeConfig.token?.startsWith("RB-SHARE-"));
}

export function getTrackingToken() {
  return (config ?? readConfig()).token;
}

export function identifySharedVisitor(visitor: { firstName: string; lastName: string; role?: string }) {
  track("visitor_identified", {
    visitorType: "shared_invitee",
    firstName: visitor.firstName,
    lastName: visitor.lastName,
    role: visitor.role ?? "",
  });
}

export function getTrackedDocumentHref(documentId: "resume" | "wingfinder-report" | "wingfinder-passport", directHref: string) {
  const activeConfig = config ?? readConfig();
  if (!activeConfig.enabled || !activeConfig.token) return directHref;
  return `/d/${documentId}?t=${encodeURIComponent(activeConfig.token)}`;
}

export function createShareLink(label = "Forwarded from Red Bull recruiter") {
  if (!config?.enabled || !config.token) {
    const code = Math.random().toString(36).slice(2, 7).toUpperCase();
    const origin = window.location.origin;
    const sender = encodeURIComponent(label);
    return Promise.resolve(`${origin}/r/RB-SHARE-${code}?from=${sender}`);
  }

  return postJson(
    "/api/share",
    {
      parentToken: config.token,
      sessionId,
      label,
    },
    false,
  ).then(async (response) => {
    if (!response?.ok) return window.location.href;
    const data = (await response.json()) as { shareUrl?: string };
    track("share_link_generated", { label, shareUrl: data.shareUrl });
    return data.shareUrl ?? window.location.href;
  });
}

export function submitAdminMessage(payload: TrackPayload) {
  const activeConfig = config ?? readConfig();
  return postJson(
    "/api/message",
    {
      token: activeConfig.token,
      page: window.location.href,
      ...payload,
    },
    false,
  );
}

export function stopTrackingForTests() {
  if (heartbeatTimer) window.clearInterval(heartbeatTimer);
}
