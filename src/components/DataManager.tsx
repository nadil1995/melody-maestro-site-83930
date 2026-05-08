import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, Save, RefreshCw, Loader2, ExternalLink, Upload, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

type ColumnDef = { key: string; label: string; type: "text" | "url" | "textarea" };
type Row = Record<string, string>;

type SheetDef = {
  id: string;
  name: string;
  s3Key: string;
  googleSheetUrl: string;
  columns: ColumnDef[];
};

const SHEETS: SheetDef[] = [
  {
    id: "news",
    name: "News & Events",
    s3Key: "data/news.json",
    googleSheetUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRa43uUOdznAbfcgo1glW47sZqr92y1mZ6mRvNfxWLUPYJbP7OB9J772W1FgFp5G-ddPACHunzutkNF/pub?gid=0&single=true&output=csv",
    columns: [
      { key: "title",       label: "Title",       type: "text" },
      { key: "date",        label: "Date",        type: "text" },
      { key: "category",    label: "Category",    type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "location",    label: "Location",    type: "text" },
      { key: "link",        label: "Link",        type: "url" },
      { key: "image",       label: "Image URL",   type: "url" },
    ],
  },
  {
    id: "publications",
    name: "Publications",
    s3Key: "data/publications.json",
    googleSheetUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRFj7lqxRVSDEmlLHpEsDxmM7LgRgQDV22Iv_DkOTxNtEY9gyTePZexBihb6lBbPHIyW5Lf4uqXoFhf/pub?output=csv&gid=2",
    columns: [
      { key: "title",    label: "Title",    type: "text" },
      { key: "date",     label: "Date",     type: "text" },
      { key: "author",   label: "Author",   type: "text" },
      { key: "category", label: "Category", type: "text" },
      { key: "excerpt",  label: "Excerpt",  type: "textarea" },
      { key: "image",    label: "Image URL",type: "url" },
      { key: "link",     label: "Link",     type: "url" },
    ],
  },
  {
    id: "performances",
    name: "Performances",
    s3Key: "data/performances.json",
    googleSheetUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSm7_VKWjou_53pSM0zc1M1FRP0GeduboWNrAfhmFjrAlmTC3UPHgJy_MHKACH8dvVTwgNctjqvwqSH/pub?output=csv",
    columns: [
      { key: "title",       label: "Title",       type: "text" },
      { key: "date",        label: "Date",        type: "text" },
      { key: "venue",       label: "Venue",       type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image",       label: "Image URL",   type: "url" },
    ],
  },
  {
    id: "achievements",
    name: "Achievements",
    s3Key: "data/achievements.json",
    googleSheetUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRFj7lqxRVSDEmlLHpEsDxmM7LgRgQDV22Iv_DkOTxNtEY9gyTePZexBihb6lBbPHIyW5Lf4uqXoFhf/pub?output=csv",
    columns: [
      { key: "title", label: "Achievement", type: "textarea" },
      { key: "image", label: "Image URL",   type: "url" },
      { key: "link",  label: "Link",        type: "url" },
    ],
  },
];

// ── S3 helpers ────────────────────────────────────────────────────────────────

const BUCKET = import.meta.env.VITE_S3_BUCKET || "geoapp-build-artifacts";
const REGION = import.meta.env.VITE_S3_REGION || "eu-west-2";
const S3_BASE = `https://${BUCKET}.s3.${REGION}.amazonaws.com`;

function buildClient() {
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

async function s3Save(key: string, data: Row[]) {
  const client = buildClient();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = await getSignedUrl(client, new PutObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn: 3600 });
  const res = await fetch(url, { method: "PUT", body: blob, headers: { "Content-Type": "application/json" } });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    const code = txt.match(/<Code>([^<]+)<\/Code>/)?.[1] ?? res.status;
    const msg  = txt.match(/<Message>([^<]+)<\/Message>/)?.[1] ?? res.statusText;
    throw new Error(`${code}: ${msg}`);
  }
}

async function s3Load(key: string): Promise<Row[] | null> {
  try {
    const res = await fetch(`${S3_BASE}/${key}?t=${Date.now()}`);
    return res.ok ? res.json() : null;
  } catch { return null; }
}

function parseCSV(text: string, columns: ColumnDef[]): Row[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const header = lines[0].split(",").map(h => h.trim().toLowerCase());
  return lines.slice(1)
    .map(line => {
      const cells = line.split(",").map(c => c.trim().replace(/^"(.*)"$/, "$1"));
      const row: Row = {};
      columns.forEach(col => {
        const idx = header.indexOf(col.key);
        row[col.key] = idx >= 0 ? cells[idx] ?? "" : "";
      });
      return row;
    })
    .filter(row => Object.values(row).some(v => v));
}

// ── Inline image upload field ──────────────────────────────────────────────────

async function uploadImageToS3(file: File): Promise<string> {
  const client = buildClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const key = `data/images/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const url = await getSignedUrl(client, new PutObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn: 3600 });
  const res = await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    const code = txt.match(/<Code>([^<]+)<\/Code>/)?.[1] ?? res.status;
    const msg  = txt.match(/<Message>([^<]+)<\/Message>/)?.[1] ?? res.statusText;
    throw new Error(`${code}: ${msg}`);
  }
  return `${S3_BASE}/${key}`;
}

function ImageUploadField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState("");
  const inputRef                  = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) { setError("Please select an image file"); return; }
    setError("");
    setUploading(true);
    try {
      const url = await uploadImageToS3(file);
      onChange(url);
    } catch (e) {
      setError(String(e));
    }
    setUploading(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      {/* URL text input */}
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="https://… or upload below"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 text-xs"
        />
        {value && (
          <button type="button" onClick={() => onChange("")}
            className="p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Clear">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Upload zone */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-1.5 border-2 border-dashed rounded-lg px-4 py-3 cursor-pointer transition-colors text-sm
          ${uploading ? "border-primary/50 bg-primary/5 cursor-wait" : "border-border hover:border-primary/50 hover:bg-muted/30"}`}
      >
        {uploading ? (
          <><Loader2 className="w-4 h-4 animate-spin text-primary" /><span className="text-muted-foreground text-xs">Uploading…</span></>
        ) : (
          <><Upload className="w-4 h-4 text-muted-foreground" /><span className="text-muted-foreground text-xs">Click or drag an image to upload</span></>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="sr-only"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
      </div>

      {/* Preview */}
      {value && (
        <div className="w-full h-32 rounded-lg overflow-hidden border border-border bg-muted">
          <img src={value} alt="preview" className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ── Row edit modal ─────────────────────────────────────────────────────────────

function RowModal({
  columns, row, title, onSave, onClose,
}: {
  columns: ColumnDef[]; row: Row; title: string;
  onSave: (r: Row) => void; onClose: () => void;
}) {
  const [vals, setVals] = useState<Row>({ ...row });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-xl border border-border shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="p-6 space-y-4">
          <h3 className="font-playfair text-lg font-semibold">{title}</h3>
          {columns.map(col => (
            <div key={col.key} className="space-y-1">
              <label className="text-sm font-medium text-foreground">{col.label}</label>
              {col.key === "image"
                ? <ImageUploadField value={vals[col.key] ?? ""} onChange={url => setVals(v => ({ ...v, [col.key]: url }))} />
                : col.type === "textarea"
                  ? <textarea rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                      value={vals[col.key] ?? ""} onChange={e => setVals(v => ({ ...v, [col.key]: e.target.value }))} />
                  : <Input type="text" placeholder={col.type === "url" ? "https://…" : ""}
                      value={vals[col.key] ?? ""} onChange={e => setVals(v => ({ ...v, [col.key]: e.target.value }))} />
              }
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Button onClick={() => onSave(vals)} className="flex-1">Save</Button>
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sheet editor ───────────────────────────────────────────────────────────────

function SheetEditor({ sheet }: { sheet: SheetDef }) {
  const [rows, setRows]       = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [source, setSource]   = useState<"s3" | "unsaved" | "empty">("empty");
  const [modal, setModal]     = useState<{ idx: number; row: Row } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    s3Load(sheet.s3Key).then(data => {
      if (data?.length) { setRows(data); setSource("s3"); }
      else              { setRows([]);   setSource("empty"); }
      setLoading(false);
    });
  }, [sheet.id]);

  const syncFromSheet = async () => {
    setSyncing(true);
    try {
      const res = await fetch(sheet.googleSheetUrl);
      const parsed = parseCSV(await res.text(), sheet.columns);
      if (!parsed.length) { toast({ title: "No data found in Google Sheet", variant: "destructive" }); }
      else { setRows(parsed); setSource("unsaved"); toast({ title: `${parsed.length} rows imported — click Save to apply` }); }
    } catch { toast({ title: "Failed to fetch Google Sheet", variant: "destructive" }); }
    setSyncing(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      await s3Save(sheet.s3Key, rows);
      setSource("s3");
      toast({ title: `${sheet.name} saved — ${rows.length} rows` });
    } catch (err) {
      toast({ title: "Save failed", description: String(err), variant: "destructive" });
    }
    setSaving(false);
  };

  const handleSaveRow = (row: Row) => {
    if (!modal) return;
    setRows(prev => modal.idx === -1 ? [...prev, row] : prev.map((r, i) => i === modal.idx ? row : r));
    setSource("unsaved");
    setModal(null);
  };

  const deleteRow = (idx: number) => {
    if (!window.confirm("Delete this row?")) return;
    setRows(prev => prev.filter((_, i) => i !== idx));
    setSource("unsaved");
  };

  const emptyRow = Object.fromEntries(sheet.columns.map(c => [c.key, ""]));

  if (loading) return (
    <div className="flex items-center justify-center py-16 text-muted-foreground">
      <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            source === "s3"      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" :
            source === "unsaved" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" :
                                   "bg-muted text-muted-foreground"}`}>
            {source === "s3" ? "Saved in S3" : source === "unsaved" ? "Unsaved changes" : "No data"}
          </span>
          <span className="text-sm text-muted-foreground">{rows.length} row{rows.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={syncFromSheet} disabled={syncing}>
            {syncing ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 mr-1.5" />}
            Sync from Google Sheet
          </Button>
          <Button variant="outline" size="sm" onClick={() => setModal({ idx: -1, row: emptyRow })}>
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Row
          </Button>
          <Button size="sm" onClick={save} disabled={saving || source === "s3"}>
            {saving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
            Save to S3
          </Button>
        </div>
      </div>

      {/* Table */}
      {rows.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl">
          No data yet. Add a row manually or sync from Google Sheets.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-3 py-2.5 text-left font-medium text-muted-foreground w-8">#</th>
                {sheet.columns.map(col => (
                  <th key={col.key} className="px-3 py-2.5 text-left font-medium text-foreground whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
                <th className="px-3 py-2.5 text-right font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-muted/20 transition-colors">
                  <td className="px-3 py-2 text-muted-foreground text-xs">{idx + 1}</td>
                  {sheet.columns.map(col => (
                    <td key={col.key} className="px-3 py-2 max-w-[180px]">
                      {col.type === "url" && row[col.key] ? (
                        <a href={row[col.key]} target="_blank" rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 truncate text-xs">
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">{row[col.key]}</span>
                        </a>
                      ) : (
                        <span className="line-clamp-2 text-foreground/80">
                          {row[col.key] || <span className="text-muted-foreground/40">—</span>}
                        </span>
                      )}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    <button onClick={() => setModal({ idx, row: { ...row } })}
                      className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors mr-1" title="Edit">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteRow(idx)}
                      className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <RowModal
          columns={sheet.columns}
          row={modal.row}
          title={modal.idx === -1 ? `Add Row — ${sheet.name}` : `Edit Row ${modal.idx + 1} — ${sheet.name}`}
          onSave={handleSaveRow}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────

export default function DataManager() {
  const [activeId, setActiveId] = useState(SHEETS[0].id);
  const sheet = SHEETS.find(s => s.id === activeId) ?? SHEETS[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Manager</CardTitle>
        <CardDescription>
          Edit content shown on News, Publications, and Portfolio pages. Data is stored in S3 and reflected on the site immediately.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-1 mb-6 border border-border rounded-lg p-1 bg-muted/30 flex-wrap">
          {SHEETS.map(s => (
            <button key={s.id} onClick={() => setActiveId(s.id)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeId === s.id ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}>
              {s.name}
            </button>
          ))}
        </div>
        <SheetEditor key={activeId} sheet={sheet} />
      </CardContent>
    </Card>
  );
}
