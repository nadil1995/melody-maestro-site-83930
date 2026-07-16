import { useEffect, useState } from "react";
import { Loader2, Save, Plus, Trash2, RotateCcw, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  DEFAULT_SERVICE_PAGES,
  SERVICE_PAGE_NAMES,
  ensureServicePages,
  saveServicePages,
  type ServicePageContent,
  type ServicePageSlug,
  type ServicePagesData,
} from "@/lib/servicePageStorage";

const SLUGS = Object.keys(DEFAULT_SERVICE_PAGES) as ServicePageSlug[];

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}

function TextArea({
  value,
  onChange,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <textarea
      rows={rows}
      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default function ServicePageEditor() {
  const [pages, setPages] = useState<ServicePagesData | null>(null);
  const [activeSlug, setActiveSlug] = useState<ServicePageSlug>(SLUGS[0]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    ensureServicePages().then(setPages);
  }, []);

  if (!pages) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading service pages…
      </div>
    );
  }

  const content = pages[activeSlug];

  const update = (patch: Partial<ServicePageContent>) => {
    setPages((prev) => prev && { ...prev, [activeSlug]: { ...prev[activeSlug], ...patch } });
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      await saveServicePages(pages);
      setDirty(false);
      toast({ title: "Service pages saved", description: "Changes are live on the site now." });
    } catch (err) {
      toast({ title: "Save failed", description: String(err), variant: "destructive" });
    }
    setSaving(false);
  };

  const resetPage = () => {
    if (!window.confirm(`Reset "${SERVICE_PAGE_NAMES[activeSlug]}" to the original content?`)) return;
    update({ ...DEFAULT_SERVICE_PAGES[activeSlug] });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Pages</CardTitle>
        <CardDescription>
          Edit the content of the three SEO service pages. Changes are stored in S3 and appear on
          the site immediately after saving — no redeploy needed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Page tabs */}
        <div className="flex gap-1 border border-border rounded-lg p-1 bg-muted/30 flex-wrap">
          {SLUGS.map((slug) => (
            <button
              key={slug}
              onClick={() => setActiveSlug(slug)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeSlug === slug
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {SERVICE_PAGE_NAMES[slug]}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                dirty
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                  : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              }`}
            >
              {dirty ? "Unsaved changes" : "Saved"}
            </span>
            <a
              href={`/${activeSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              View page <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetPage}>
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset This Page
            </Button>
            <Button size="sm" onClick={save} disabled={saving || !dirty}>
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5 mr-1.5" />
              )}
              Save to S3
            </Button>
          </div>
        </div>

        {/* SEO */}
        <div className="border border-border rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-foreground">Google Search (SEO)</h3>
          <Field
            label="Title tag"
            hint={`The blue clickable link on Google. Aim for under 60 characters (currently ${content.metaTitle.length}).`}
          >
            <Input value={content.metaTitle} onChange={(e) => update({ metaTitle: e.target.value })} />
          </Field>
          <Field
            label="Meta description"
            hint={`The grey text under the link on Google. Aim for under 160 characters (currently ${content.metaDescription.length}).`}
          >
            <TextArea value={content.metaDescription} onChange={(v) => update({ metaDescription: v })} rows={2} />
          </Field>
        </div>

        {/* Header */}
        <div className="border border-border rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-foreground">Page Header</h3>
          <Field label="Heading (H1)">
            <Input value={content.heading} onChange={(e) => update({ heading: e.target.value })} />
          </Field>
          <Field label="Subheading">
            <TextArea value={content.subheading} onChange={(v) => update({ subheading: v })} rows={2} />
          </Field>
        </div>

        {/* Intro paragraphs */}
        <div className="border border-border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Intro Paragraphs</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => update({ intro: [...content.intro, ""] })}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Paragraph
            </Button>
          </div>
          {content.intro.map((paragraph, i) => (
            <div key={i} className="flex gap-2">
              <TextArea
                value={paragraph}
                onChange={(v) => update({ intro: content.intro.map((p, j) => (j === i ? v : p)) })}
              />
              <button
                onClick={() => update({ intro: content.intro.filter((_, j) => j !== i) })}
                className="p-1.5 h-fit rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                title="Remove paragraph"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Feature groups */}
        <div className="border border-border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Feature Cards</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => update({ featureGroups: [...content.featureGroups, { title: "", items: [""] }] })}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Card
            </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {content.featureGroups.map((group, gi) => (
              <div key={gi} className="border border-border rounded-lg p-3 space-y-3 bg-muted/20">
                <div className="flex gap-2">
                  <Input
                    placeholder="Card title"
                    value={group.title}
                    onChange={(e) =>
                      update({
                        featureGroups: content.featureGroups.map((g, j) =>
                          j === gi ? { ...g, title: e.target.value } : g
                        ),
                      })
                    }
                  />
                  <button
                    onClick={() => update({ featureGroups: content.featureGroups.filter((_, j) => j !== gi) })}
                    className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    title="Remove card"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <Field label="Bullet points" hint="One per line">
                  <TextArea
                    rows={5}
                    value={group.items.join("\n")}
                    onChange={(v) =>
                      update({
                        featureGroups: content.featureGroups.map((g, j) =>
                          j === gi ? { ...g, items: v.split("\n") } : g
                        ),
                      })
                    }
                  />
                </Field>
              </div>
            ))}
          </div>
        </div>

        {/* Areas */}
        <div className="border border-border rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-foreground">Areas Covered</h3>
          <Field label="Areas text" hint="Shown in the highlighted box with the map pin.">
            <TextArea value={content.areas} onChange={(v) => update({ areas: v })} rows={2} />
          </Field>
        </div>

        {/* FAQs */}
        <div className="border border-border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">FAQs</h3>
              <p className="text-xs text-muted-foreground">
                Also sent to Google as FAQ markup — can appear directly in search results.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => update({ faqs: [...content.faqs, { question: "", answer: "" }] })}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Add FAQ
            </Button>
          </div>
          {content.faqs.map((faq, i) => (
            <div key={i} className="border border-border rounded-lg p-3 space-y-2 bg-muted/20">
              <div className="flex gap-2">
                <Input
                  placeholder="Question"
                  value={faq.question}
                  onChange={(e) =>
                    update({
                      faqs: content.faqs.map((f, j) => (j === i ? { ...f, question: e.target.value } : f)),
                    })
                  }
                />
                <button
                  onClick={() => update({ faqs: content.faqs.filter((_, j) => j !== i) })}
                  className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  title="Remove FAQ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <TextArea
                rows={2}
                value={faq.answer}
                onChange={(v) => update({ faqs: content.faqs.map((f, j) => (j === i ? { ...f, answer: v } : f)) })}
              />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="border border-border rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-foreground">Call to Action</h3>
          <Field label="CTA text" hint="Shown above the 'Book a Lesson / Enquire' button.">
            <TextArea value={content.ctaText} onChange={(v) => update({ ctaText: v })} rows={2} />
          </Field>
        </div>

        {/* Bottom save */}
        <div className="flex justify-end">
          <Button onClick={save} disabled={saving || !dirty}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save to S3
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
