import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const BUCKET = import.meta.env.VITE_S3_BUCKET || "geoapp-build-artifacts";
const REGION = import.meta.env.VITE_S3_REGION || "eu-west-2";

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
}

function getDevice(): "Mobile" | "Tablet" | "Desktop" {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "Tablet";
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return "Mobile";
  return "Desktop";
}

function getBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari")) return "Safari";
  return "Other";
}

function getOS(): string {
  const ua = navigator.userAgent;
  if (/iphone|ipad/i.test(ua)) return "iOS";
  if (/android/i.test(ua)) return "Android";
  if (/windows/i.test(ua)) return "Windows";
  if (/mac/i.test(ua)) return "macOS";
  if (/linux/i.test(ua)) return "Linux";
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
  try {
    const cached = sessionStorage.getItem("rt_geo");
    if (cached) return JSON.parse(cached);
    const res = await fetch("https://freeipapi.com/api/json", {
      signal: AbortSignal.timeout(4000),
    });
    const d = await res.json();
    const geo = {
      ip: d.ipAddress || "unknown",
      country: d.countryName || "Unknown",
      city: d.cityName || "Unknown",
    };
    sessionStorage.setItem("rt_geo", JSON.stringify(geo));
    return geo;
  } catch {
    return { ip: "unknown", country: "Unknown", city: "Unknown" };
  }
}

function buildS3Client() {
  return new S3Client({
    region: REGION,
    credentials: {
      accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || "",
      secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || "",
    },
    requestChecksumCalculation: "WHEN_REQUIRED" as const,
    responseChecksumValidation: "WHEN_REQUIRED" as const,
  });
}

export async function trackVisit(page: string): Promise<void> {
  try {
    const geo = await getGeoInfo();
    const sessionId = getSessionId();
    const referrer = document.referrer;

    const event: VisitEvent = {
      sessionId,
      visitorId: `v-${geo.ip.replace(/[.:]/g, "")}`,
      ip: geo.ip,
      country: geo.country,
      city: geo.city,
      device: getDevice(),
      browser: getBrowser(),
      os: getOS(),
      source: getSource(referrer),
      referrer,
      page,
      timestamp: Date.now(),
    };

    const dateStr = new Date().toISOString().slice(0, 10);
    const key = `analytics/events/${dateStr}/${event.timestamp}-${sessionId.slice(-5)}.json`;

    const client = buildS3Client();
    const blob = new Blob([JSON.stringify(event)], { type: "application/json" });
    const url = await getSignedUrl(
      client,
      new PutObjectCommand({ Bucket: BUCKET, Key: key }),
      { expiresIn: 300 }
    );
    await fetch(url, {
      method: "PUT",
      body: blob,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // Silent — analytics must never break the site
  }
}
