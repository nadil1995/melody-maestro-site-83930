import { useState, useEffect, useCallback } from "react";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { Users, Globe, Monitor, Smartphone, Tablet, RefreshCw, Loader2, Wifi, Eye, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { VisitEvent } from "@/lib/analyticsTracker";

const BUCKET = import.meta.env.VITE_S3_BUCKET || "geoapp-build-artifacts";
const REGION = import.meta.env.VITE_S3_REGION || "eu-west-2";
const S3_BASE = `https://${BUCKET}.s3.${REGION}.amazonaws.com`;

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

function datePrefixes(days: number): string[] {
  const prefixes: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - i * 86400000);
    prefixes.push(`analytics/events/${d.toISOString().slice(0, 10)}/`);
  }
  return prefixes;
}

async function listKeys(prefix: string): Promise<string[]> {
  const client = buildS3Client();
  const keys: string[] = [];
  let token: string | undefined;
  do {
    const cmd = new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: prefix,
      ContinuationToken: token,
      MaxKeys: 1000,
    });
    const res = await client.send(cmd);
    res.Contents?.forEach(o => { if (o.Key) keys.push(o.Key); });
    token = res.NextContinuationToken;
  } while (token);
  return keys;
}

async function fetchEvent(key: string): Promise<VisitEvent | null> {
  try {
    const res = await fetch(`${S3_BASE}/${key}`);
    return res.ok ? res.json() : null;
  } catch { return null; }
}

function relTime(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function DeviceIcon({ device }: { device: string }) {
  if (device === "Mobile") return <Smartphone className="w-3.5 h-3.5" />;
  if (device === "Tablet") return <Tablet className="w-3.5 h-3.5" />;
  return <Monitor className="w-3.5 h-3.5" />;
}

function countBy<T>(arr: T[], key: (item: T) => string): [string, number][] {
  const map: Record<string, number> = {};
  arr.forEach(item => { const k = key(item); map[k] = (map[k] || 0) + 1; });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

function Bar({ value, max, color = "bg-primary" }: { value: number; max: number; color?: string }) {
  return (
    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${max ? (value / max) * 100 : 0}%` }} />
    </div>
  );
}

export default function LiveAnalytics() {
  const [events, setEvents]     = useState<VisitEvent[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const prefixes = datePrefixes(7);
      const allKeys = (await Promise.all(prefixes.map(listKeys))).flat();
      // Only fetch events from last 30 days (all keys we have)
      const fetched = await Promise.all(allKeys.map(fetchEvent));
      const valid = fetched.filter(Boolean) as VisitEvent[];
      valid.sort((a, b) => b.timestamp - a.timestamp);
      setEvents(valid);
      setLastRefresh(new Date());
    } catch (e) {
      setError(String(e));
    }
    setLoading(false);
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const now = Date.now();
  const LIVE_MS   = 5  * 60 * 1000;  // 5 minutes  = "live"
  const MIN30_MS  = 30 * 60 * 1000;  // 30 minutes
  const DAY_MS    = 24 * 60 * 60 * 1000;

  const liveEvents    = events.filter(e => now - e.timestamp < LIVE_MS);
  const last30Events  = events.filter(e => now - e.timestamp < MIN30_MS);
  const todayEvents   = events.filter(e => now - e.timestamp < DAY_MS);

  // Unique visitors (by visitorId) in various windows
  const liveVisitors   = new Set(liveEvents.map(e => e.visitorId)).size;
  const last30Visitors = new Set(last30Events.map(e => e.visitorId)).size;
  const todayVisitors  = new Set(todayEvents.map(e => e.visitorId)).size;

  // Breakdowns for today
  const countries = countBy(todayEvents, e => e.country);
  const pages     = countBy(todayEvents, e => e.page);
  const sources   = countBy(todayEvents, e => e.source);
  const devices   = countBy(todayEvents, e => e.device);
  const browsers  = countBy(todayEvents, e => e.browser);

  const topCountryCount = countries[0]?.[1] ?? 1;
  const topPageCount    = pages[0]?.[1] ?? 1;

  // Recent unique visitors (most recent event per visitor)
  const recentVisitors = Object.values(
    todayEvents.reduce<Record<string, VisitEvent>>((acc, e) => {
      if (!acc[e.visitorId] || e.timestamp > acc[e.visitorId].timestamp) acc[e.visitorId] = e;
      return acc;
    }, {})
  ).sort((a, b) => b.timestamp - a.timestamp).slice(0, 15);

  const deviceTotal = devices.reduce((s, [, n]) => s + n, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold">Live Analytics</h2>
          {lastRefresh && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Last updated {relTime(lastRefresh.getTime())} · auto-refreshes every 30s
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 mr-1.5" />}
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <strong>Error loading analytics:</strong> {error}
          <br /><span className="text-xs mt-1 block">Make sure your IAM policy includes <code>s3:ListBucket</code> and <code>s3:GetObject</code> on the analytics/ prefix.</span>
        </div>
      )}

      {loading && events.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading visitor data…
        </div>
      ) : (
        <>
          {/* Top stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wifi className="w-4 h-4 text-primary animate-pulse" />
                  <span className="text-xs font-medium text-muted-foreground">Live now</span>
                </div>
                <div className="text-3xl font-bold text-primary">{liveVisitors}</div>
                <div className="text-xs text-muted-foreground">active last 5 min</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-accent" />
                  <span className="text-xs font-medium text-muted-foreground">Last 30 min</span>
                </div>
                <div className="text-3xl font-bold">{last30Visitors}</div>
                <div className="text-xs text-muted-foreground">{last30Events.length} page views</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-secondary" />
                  <span className="text-xs font-medium text-muted-foreground">Today</span>
                </div>
                <div className="text-3xl font-bold">{todayVisitors}</div>
                <div className="text-xs text-muted-foreground">unique visitors</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Today views</span>
                </div>
                <div className="text-3xl font-bold">{todayEvents.length}</div>
                <div className="text-xs text-muted-foreground">{countries.length} countries</div>
              </CardContent>
            </Card>
          </div>

          {/* Middle row: Countries + Pages + Source */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Globe className="w-4 h-4" /> Countries</CardTitle>
                <CardDescription className="text-xs">Today's visitors by country</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {countries.slice(0, 8).map(([country, count]) => (
                  <div key={country}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="truncate">{country}</span>
                      <span className="font-semibold ml-2">{count}</span>
                    </div>
                    <Bar value={count} max={topCountryCount} color="bg-accent" />
                  </div>
                ))}
                {countries.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No data yet</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Eye className="w-4 h-4" /> Page Views</CardTitle>
                <CardDescription className="text-xs">Most visited pages today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {pages.slice(0, 8).map(([page, count]) => (
                  <div key={page}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="truncate font-mono text-xs">{page}</span>
                      <span className="font-semibold ml-2">{count}</span>
                    </div>
                    <Bar value={count} max={topPageCount} />
                  </div>
                ))}
                {pages.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No data yet</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Traffic & Device</CardTitle>
                <CardDescription className="text-xs">Where visitors come from</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {sources.map(([src, count]) => (
                    <div key={src} className="flex items-center justify-between text-sm">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        src === "Search"   ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" :
                        src === "Social"   ? "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300" :
                        src === "Referral" ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" :
                                             "bg-muted text-muted-foreground"
                      }`}>{src}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
                <hr className="border-border" />
                <div className="space-y-2">
                  {devices.map(([device, count]) => (
                    <div key={device} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <DeviceIcon device={device} />
                        {device}
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {deviceTotal ? Math.round((count / deviceTotal) * 100) : 0}%
                        </span>
                        <span className="font-semibold">{count}</span>
                      </span>
                    </div>
                  ))}
                </div>
                <hr className="border-border" />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Browsers</p>
                  {browsers.map(([browser, count]) => (
                    <div key={browser} className="flex justify-between text-xs">
                      <span>{browser}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent visitors + Live activity */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Users className="w-4 h-4" /> Recent Visitors</CardTitle>
                <CardDescription className="text-xs">Unique visitors by IP, most recent first</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {recentVisitors.map((v, i) => (
                    <div key={v.visitorId} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium">{v.country}</span>
                          {v.city && v.city !== "Unknown" && (
                            <span className="text-xs text-muted-foreground">· {v.city}</span>
                          )}
                          <span className={`px-1.5 py-0.5 rounded text-xs ${
                            v.source === "Search" ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" :
                            v.source === "Social" ? "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300" :
                            "bg-muted text-muted-foreground"
                          }`}>{v.source}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <DeviceIcon device={v.device} />
                          <span className="text-xs text-muted-foreground truncate">{v.page}</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground shrink-0 text-right">
                        {relTime(v.timestamp)}
                      </div>
                    </div>
                  ))}
                  {recentVisitors.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-8">No visitors today yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-primary animate-pulse" />
                  Live Activity Feed
                </CardTitle>
                <CardDescription className="text-xs">All page views, newest first</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5 max-h-96 overflow-y-auto">
                  {events.slice(0, 30).map((e, i) => (
                    <div key={i} className={`flex items-center gap-2 p-2 rounded text-xs transition-colors ${
                      now - e.timestamp < LIVE_MS ? "bg-primary/5 border border-primary/20" : "bg-muted/20"
                    }`}>
                      <DeviceIcon device={e.device} />
                      <span className="font-mono truncate flex-1">{e.page}</span>
                      <span className="text-muted-foreground shrink-0">{e.country}</span>
                      <span className={`shrink-0 ${now - e.timestamp < LIVE_MS ? "text-primary font-medium" : "text-muted-foreground"}`}>
                        {relTime(e.timestamp)}
                      </span>
                    </div>
                  ))}
                  {events.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-8">No activity recorded yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
