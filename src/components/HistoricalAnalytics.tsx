import { useState, useEffect, useCallback } from "react";
import {
  Users, Globe, Monitor, Smartphone, Tablet, RefreshCw, Loader2, Eye,
  Mail, Phone, MapPin, Clock, CalendarDays, TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer, BarChart, Bar as RBar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import {
  loadHistory, readFormSubmissions, probeAnalyticsSource,
  type VisitEvent, type FormSubmissionEvent,
} from "@/lib/analyticsTracker";

type Range = "today" | "7d" | "30d" | "all";

const RANGES: { id: Range; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "all", label: "All time" },
];

const DAY_MS = 24 * 60 * 60 * 1000;

function rangeStart(range: Range): number {
  const now = new Date();
  if (range === "today") return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  if (range === "7d") return Date.now() - 7 * DAY_MS;
  if (range === "30d") return Date.now() - 30 * DAY_MS;
  return 0;
}

function countBy<T>(arr: T[], key: (item: T) => string): [string, number][] {
  const map: Record<string, number> = {};
  arr.forEach((item) => { const k = key(item); map[k] = (map[k] || 0) + 1; });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

function fmtDateTime(ts: number): string {
  return new Date(ts).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function DeviceIcon({ device }: { device: string }) {
  if (device === "Mobile") return <Smartphone className="w-3.5 h-3.5" />;
  if (device === "Tablet") return <Tablet className="w-3.5 h-3.5" />;
  return <Monitor className="w-3.5 h-3.5" />;
}

function HBar({ value, max, color = "bg-primary" }: { value: number; max: number; color?: string }) {
  return (
    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-500`}
        style={{ width: `${max ? (value / max) * 100 : 0}%` }} />
    </div>
  );
}

function BreakdownCard({
  title, icon, data, color, empty,
}: {
  title: string; icon: React.ReactNode; data: [string, number][]; color?: string; empty: string;
}) {
  const top = data[0]?.[1] ?? 1;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">{icon} {title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.slice(0, 8).map(([label, count]) => (
          <div key={label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="truncate">{label}</span>
              <span className="font-semibold ml-2">{count}</span>
            </div>
            <HBar value={count} max={top} color={color} />
          </div>
        ))}
        {data.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">{empty}</p>}
      </CardContent>
    </Card>
  );
}

const chartAxis = {
  tick: { fill: "hsl(var(--muted-foreground))", fontSize: 11 },
  axisLine: false as const,
  tickLine: false as const,
};

const chartTooltip = {
  contentStyle: {
    background: "hsl(var(--background))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 8,
    fontSize: 12,
    color: "hsl(var(--foreground))",
  },
  cursor: { fill: "hsl(var(--muted))", opacity: 0.4 },
};

export default function HistoricalAnalytics() {
  const [events, setEvents] = useState<VisitEvent[] | null>(null);
  const [forms, setForms] = useState<FormSubmissionEvent[] | null>(null);
  const [range, setRange] = useState<Range>("30d");
  const [loading, setLoading] = useState(true);
  const [sourceError, setSourceError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [history, submissions] = await Promise.all([loadHistory(), readFormSubmissions()]);
    setEvents(history);
    setForms(submissions);
    setSourceError(history.length === 0 ? await probeAnalyticsSource() : null);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading && events === null) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading historical data…
      </div>
    );
  }

  const allEvents = events ?? [];
  const allForms = forms ?? [];
  const start = rangeStart(range);
  const inRange = allEvents.filter((e) => e.timestamp >= start);
  const formsInRange = allForms.filter((f) => f.timestamp >= start);

  const uniqueVisitors = new Set(inRange.map((e) => e.visitorId)).size;
  const pages = countBy(inRange, (e) => e.page);
  const countries = countBy(inRange, (e) => e.country);
  const cities = countBy(
    inRange.filter((e) => e.city && e.city !== "Unknown"),
    (e) => `${e.city}, ${e.country}`
  );
  const devices = countBy(inRange, (e) => e.device);
  const browsers = countBy(inRange, (e) => e.browser);
  const oses = countBy(inRange, (e) => e.os);
  const sources = countBy(inRange, (e) => e.source);
  const deviceTotal = inRange.length;

  // Visits per day — fill empty days so the timeline is continuous
  const earliest = allEvents.length ? allEvents[allEvents.length - 1].timestamp : Date.now();
  const chartStart = range === "all"
    ? Math.max(earliest, Date.now() - 60 * DAY_MS) // cap "all time" chart at 60 daily bars
    : start;
  const dayKey = (ts: number) => new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  const perDayMap: Record<string, number> = {};
  inRange.forEach((e) => {
    if (e.timestamp >= chartStart) perDayMap[dayKey(e.timestamp)] = (perDayMap[dayKey(e.timestamp)] || 0) + 1;
  });
  const perDay: { day: string; views: number }[] = [];
  for (let t = chartStart; t <= Date.now(); t += DAY_MS) {
    const k = dayKey(t);
    perDay.push({ day: k, views: perDayMap[k] || 0 });
  }

  // Visits by hour of day
  const perHourMap: Record<number, number> = {};
  inRange.forEach((e) => {
    const h = new Date(e.timestamp).getHours();
    perHourMap[h] = (perHourMap[h] || 0) + 1;
  });
  const perHour = Array.from({ length: 24 }, (_, h) => ({
    hour: `${String(h).padStart(2, "0")}:00`,
    views: perHourMap[h] || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header + range filter */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold">Historical Analytics</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            All visitor and form data, stored in S3 — visible from any device
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 border border-border rounded-lg p-1 bg-muted/30">
            {RANGES.map((r) => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  range === r.id
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            {loading
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <RefreshCw className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      {/* Data source problem banner */}
      {sourceError && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <CardContent className="p-4">
            <div className="flex items-start gap-2 text-yellow-800 dark:text-yellow-200">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-semibold">Analytics data could not be loaded from S3</p>
                <p className="text-sm mt-0.5">{sourceError}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Page views</span>
            </div>
            <div className="text-3xl font-bold">{inRange.length}</div>
            <div className="text-xs text-muted-foreground">{pages.length} unique pages</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-accent" />
              <span className="text-xs font-medium text-muted-foreground">Unique visitors</span>
            </div>
            <div className="text-3xl font-bold">{uniqueVisitors}</div>
            <div className="text-xs text-muted-foreground">by IP address</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-secondary" />
              <span className="text-xs font-medium text-muted-foreground">Countries</span>
            </div>
            <div className="text-3xl font-bold">{countries.length}</div>
            <div className="text-xs text-muted-foreground">{cities.length} cities</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Form submissions</span>
            </div>
            <div className="text-3xl font-bold">{formsInRange.length}</div>
            <div className="text-xs text-muted-foreground">{allForms.length} all time</div>
          </CardContent>
        </Card>
      </div>

      {/* Time charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CalendarDays className="w-4 h-4" /> Visits by Date
            </CardTitle>
            <CardDescription className="text-xs">
              Page views per day{range === "all" ? " (last 60 days)" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={perDay} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" {...chartAxis} interval="preserveStartEnd" minTickGap={24} />
                <YAxis {...chartAxis} allowDecimals={false} />
                <Tooltip {...chartTooltip} />
                <RBar dataKey="views" name="Views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" /> Visits by Time of Day
            </CardTitle>
            <CardDescription className="text-xs">When visitors are on the site (your local time)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={perHour} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="hour" {...chartAxis} interval={3} />
                <YAxis {...chartAxis} allowDecimals={false} />
                <Tooltip {...chartTooltip} />
                <RBar dataKey="views" name="Views" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} maxBarSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Breakdowns */}
      <div className="grid md:grid-cols-3 gap-4">
        <BreakdownCard title="Most Visited Pages" icon={<Eye className="w-4 h-4" />}
          data={pages} empty="No page views in this period" />
        <BreakdownCard title="Countries" icon={<Globe className="w-4 h-4" />}
          data={countries} color="bg-accent" empty="No visitor locations yet" />
        <BreakdownCard title="Cities" icon={<MapPin className="w-4 h-4" />}
          data={cities} color="bg-secondary" empty="No city data yet" />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Monitor className="w-4 h-4" /> Devices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {devices.map(([device, count]) => (
              <div key={device} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <DeviceIcon device={device} />{device}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {deviceTotal ? Math.round((count / deviceTotal) * 100) : 0}%
                  </span>
                  <span className="font-semibold">{count}</span>
                </span>
              </div>
            ))}
            {devices.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No data yet</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
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
            {sources.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No data yet</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Smartphone className="w-4 h-4" /> Browsers & OS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              {browsers.map(([browser, count]) => (
                <div key={browser} className="flex justify-between text-xs">
                  <span>{browser}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
            <hr className="border-border" />
            <div className="space-y-1">
              {oses.map(([os, count]) => (
                <div key={os} className="flex justify-between text-xs">
                  <span>{os}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
            {browsers.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No data yet</p>}
          </CardContent>
        </Card>
      </div>

      {/* Form submissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" /> Contact Form Submissions
          </CardTitle>
          <CardDescription>
            {formsInRange.length} in this period · stored permanently in S3
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[560px] overflow-y-auto">
            {formsInRange.map((s, idx) => (
              <div key={idx} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <h4 className="font-semibold text-lg">{s.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1 flex-wrap">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{s.email}</span>
                      {s.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{s.phone}</span>}
                      {s.country && s.country !== "Unknown" && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {s.city && s.city !== "Unknown" ? `${s.city}, ` : ""}{s.country}
                        </span>
                      )}
                      {s.device && <span className="flex items-center gap-1"><DeviceIcon device={s.device} />{s.device}</span>}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{fmtDateTime(s.timestamp)}</div>
                </div>
                <div className="bg-muted/30 p-3 rounded text-sm">
                  <p className="whitespace-pre-wrap">{s.message}</p>
                </div>
              </div>
            ))}
            {formsInRange.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                No form submissions in this period. New submissions are saved here automatically.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Full visit log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" /> Visit Log
          </CardTitle>
          <CardDescription>Every recorded page view in this period, newest first</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-[480px] overflow-y-auto rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-background">
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Date & Time</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Page</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Location</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Device</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Browser</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {inRange.slice(0, 300).map((e, i) => (
                  <tr key={i} className="hover:bg-muted/20">
                    <td className="px-3 py-1.5 whitespace-nowrap text-muted-foreground">{fmtDateTime(e.timestamp)}</td>
                    <td className="px-3 py-1.5 font-mono">{e.page}</td>
                    <td className="px-3 py-1.5 whitespace-nowrap">
                      {e.city && e.city !== "Unknown" ? `${e.city}, ` : ""}{e.country}
                    </td>
                    <td className="px-3 py-1.5">
                      <span className="flex items-center gap-1"><DeviceIcon device={e.device} />{e.device}</span>
                    </td>
                    <td className="px-3 py-1.5">{e.browser} / {e.os}</td>
                    <td className="px-3 py-1.5">{e.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {inRange.length === 0 && (
              <p className="text-muted-foreground text-center py-8 text-sm">No visits recorded in this period</p>
            )}
          </div>
          {inRange.length > 300 && (
            <p className="text-xs text-muted-foreground mt-2">Showing the 300 most recent of {inRange.length} visits.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
