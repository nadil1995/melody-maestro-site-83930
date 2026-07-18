import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const BUCKET   = import.meta.env.VITE_S3_BUCKET  || "geoapp-build-artifacts";
const REGION   = import.meta.env.VITE_S3_REGION  || "eu-west-2";
const S3_BASE  = `https://${BUCKET}.s3.${REGION}.amazonaws.com`;
const FEED_KEY = "analytics/live-feed.json";
const HISTORY_KEY = "analytics/history.json";
const FORMS_KEY   = "analytics/form-submissions.json";
const MAX_EVENTS  = 500;
const MAX_HISTORY = 10000;
const MAX_FORMS   = 1000;

export interface VisitEvent {
  sessionId: string;
  visitorId: string;
  ip: string;
  country: string;
  city: string;
  device: "Mobile" | "Tablet" | "Desktop";
  browser: string;
  os: string;
  source: "Direct" | "Search" | "Social" | "Referral";
  referrer: string;
  page: string;
  timestamp: number;
  /** "view" = a real page view; "ping" = heartbeat proving the visitor is still on the page */
  kind?: "view" | "ping";
}

/** Crawlers (Googlebot renders JS) and headless browsers must not pollute visitor data. */
function isBot(): boolean {
  return /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|prerender|preview|facebookexternalhit|whatsapp|telegram|puppeteer|playwright|phantomjs/i.test(
    navigator.userAgent
  );
}

function getDevice(): "Mobile" | "Tablet" | "Desktop" {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "Tablet";
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return "Mobile";
  return "Desktop";
}

function getBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Edg"))     return "Edge";
  if (ua.includes("Chrome"))  return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari"))  return "Safari";
  return "Other";
}

function getOS(): string {
  const ua = navigator.userAgent;
  if (/iphone|ipad/i.test(ua))  return "iOS";
  if (/android/i.test(ua))      return "Android";
  if (/windows/i.test(ua))      return "Windows";
  if (/mac/i.test(ua))          return "macOS";
  if (/linux/i.test(ua))        return "Linux";
  return "Other";
}

function getSource(referrer: string): "Direct" | "Search" | "Social" | "Referral" {
  if (!referrer) return "Direct";
  if (/google|bing|yahoo|duckduckgo|baidu/i.test(referrer)) return "Search";
  if (/facebook|instagram|twitter|linkedin|youtube|tiktok/i.test(referrer)) return "Social";
  return "Referral";
}

function getSessionId(): string {
  let id = sessionStorage.getItem("rt_session");
  if (!id) {
    id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    sessionStorage.setItem("rt_session", id);
  }
  return id;
}

async function getGeoInfo(): Promise<{ ip: string; country: string; city: string }> {
  const cached = sessionStorage.getItem("rt_geo");
  if (cached) {
    try { return JSON.parse(cached); } catch {}
  }

  // Two independent geo providers — ipapi.co rate-limits its free tier, and
  // either may be blocked by ad-blockers, so a single provider gives "Unknown"
  // for a meaningful share of visitors.
  const providers: (() => Promise<{ ip: string; country: string; city: string } | null>)[] = [
    async () => {
      const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(5000) });
      const d = await res.json();
      if (!d.ip) return null;
      return { ip: d.ip, country: d.country_name || "Unknown", city: d.city || "Unknown" };
    },
    async () => {
      const res = await fetch("https://ipwho.is/", { signal: AbortSignal.timeout(5000) });
      const d = await res.json();
      if (!d.success || !d.ip) return null;
      return { ip: d.ip, country: d.country || "Unknown", city: d.city || "Unknown" };
    },
  ];

  for (const provider of providers) {
    try {
      const geo = await provider();
      if (geo) {
        sessionStorage.setItem("rt_geo", JSON.stringify(geo));
        return geo;
      }
    } catch {
      // try the next provider
    }
  }
  return { ip: "unknown", country: "Unknown", city: "Unknown" };
}

/**
 * Stable per-browser visitor id. Prefer the IP; when geo lookup fails, fall
 * back to a persistent random id instead of "v-unknown" — otherwise every
 * geo-blocked visitor collapses into one visitor and unique counts are wrong.
 */
function getVisitorId(ip: string): string {
  if (ip !== "unknown") return `v-${ip.replace(/[.:]/g, "")}`;
  let id = localStorage.getItem("rt_vid");
  if (!id) {
    id = `v-anon-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    try { localStorage.setItem("rt_vid", id); } catch {}
  }
  return id;
}

function buildS3Client() {
  return new S3Client({
    region: REGION,
    credentials: {
      accessKeyId:     import.meta.env.VITE_AWS_ACCESS_KEY_ID     || "",
      secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || "",
    },
    requestChecksumCalculation: "WHEN_REQUIRED" as const,
    responseChecksumValidation: "WHEN_REQUIRED" as const,
  });
}

async function readJson<T>(key: string): Promise<T[]> {
  try {
    const res = await fetch(`${S3_BASE}/${key}?t=${Date.now()}`);
    return res.ok ? res.json() : [];
  } catch {
    return [];
  }
}

async function writeJson(key: string, data: unknown): Promise<void> {
  const client = buildS3Client();
  const body   = JSON.stringify(data);
  const url    = await getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: "application/json" }),
    { expiresIn: 300 }
  );
  await fetch(url, {
    method: "PUT",
    body,
    headers: { "Content-Type": "application/json" },
  });
}

const readFeed  = () => readJson<VisitEvent>(FEED_KEY);
const writeFeed = (events: VisitEvent[]) => writeJson(FEED_KEY, events);

let lastPage = "";
let heartbeatStarted = false;
const HEARTBEAT_MS = 60 * 1000;

async function pushEvent(page: string, kind: "view" | "ping"): Promise<void> {
  const geo       = await getGeoInfo();
  const sessionId = getSessionId();

  const event: VisitEvent = {
    sessionId,
    visitorId: getVisitorId(geo.ip),
    ip:        geo.ip,
    country:   geo.country,
    city:      geo.city,
    device:    getDevice(),
    browser:   getBrowser(),
    os:        getOS(),
    source:    getSource(document.referrer),
    referrer:  document.referrer,
    page,
    timestamp: Date.now(),
    kind,
  };

  const existing = await readFeed();
  const updated  = [event, ...existing].slice(0, MAX_EVENTS);
  await writeFeed(updated);
}

/**
 * While the tab stays visible, send a "ping" every minute so the Live tab
 * knows the visitor is still on the page. Without this, anyone reading for
 * more than 5 minutes drops out of "Live now" even though they're still here.
 */
function ensureHeartbeat(): void {
  if (heartbeatStarted) return;
  heartbeatStarted = true;
  setInterval(() => {
    if (document.visibilityState !== "visible" || !lastPage) return;
    pushEvent(lastPage, "ping").catch(() => {});
  }, HEARTBEAT_MS);
}

export async function trackVisit(page: string): Promise<void> {
  try {
    if (isBot()) return;
    lastPage = page;
    ensureHeartbeat();
    await pushEvent(page, "view");
  } catch {
    // Silent — analytics must never break the site
  }
}

// Called by admin dashboard to read all events
export async function readLiveFeed(): Promise<VisitEvent[]> {
  return readFeed();
}

/**
 * Diagnoses why analytics data might not load, so the dashboard can show a
 * real error instead of an empty page. A fetch() that throws (rather than
 * returning a status) almost always means the bucket's CORS policy doesn't
 * allow this origin.
 */
export async function probeAnalyticsSource(): Promise<string | null> {
  try {
    const res = await fetch(`${S3_BASE}/${FEED_KEY}?t=${Date.now()}`);
    if (res.ok) return null;
    if (res.status === 403 || res.status === 404) {
      return `No analytics data file exists yet in S3 (${res.status} for ${FEED_KEY}). It is created automatically on the first tracked visit.`;
    }
    return `S3 returned ${res.status} when reading ${FEED_KEY}.`;
  } catch {
    return `Could not reach S3 from this origin (${window.location.origin}). The bucket's CORS policy only allows the production site — data will show on https://www.lflauto.co.uk, or add this origin to the bucket CORS configuration.`;
  }
}

// ── Historical archive ────────────────────────────────────────────────────────
// The live feed keeps only the last 500 events. Whenever the admin opens the
// analytics view, any feed events not yet archived are merged into
// analytics/history.json, so history accumulates instead of rolling off.

const eventKey = (e: VisitEvent) => `${e.sessionId}|${e.timestamp}|${e.page}`;

export async function loadHistory(): Promise<VisitEvent[]> {
  const [history, feed] = await Promise.all([
    readJson<VisitEvent>(HISTORY_KEY),
    readFeed(),
  ]);

  // Heartbeat pings prove liveness but aren't page views — keep them out of history
  const seen = new Set(history.map(eventKey));
  const fresh = feed.filter((e) => e.kind !== "ping" && !seen.has(eventKey(e)));

  const merged = [...fresh, ...history]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, MAX_HISTORY);

  if (fresh.length > 0) {
    try {
      await writeJson(HISTORY_KEY, merged);
    } catch {
      // Archive write failed — still return the merged view for display
    }
  }

  return merged;
}

// ── Form submissions (S3-persisted, visible from any browser) ────────────────

export interface FormSubmissionEvent {
  name: string;
  email: string;
  phone: string;
  message: string;
  country: string;
  city: string;
  device: string;
  timestamp: number;
}

export async function trackFormSubmissionS3(data: {
  name: string;
  email: string;
  phone: string;
  message: string;
}): Promise<void> {
  try {
    const geo = await getGeoInfo();
    const event: FormSubmissionEvent = {
      ...data,
      country: geo.country,
      city: geo.city,
      device: getDevice(),
      timestamp: Date.now(),
    };
    const existing = await readJson<FormSubmissionEvent>(FORMS_KEY);
    await writeJson(FORMS_KEY, [event, ...existing].slice(0, MAX_FORMS));
  } catch {
    // Silent — analytics must never break the contact form
  }
}

export async function readFormSubmissions(): Promise<FormSubmissionEvent[]> {
  return readJson<FormSubmissionEvent>(FORMS_KEY);
}
