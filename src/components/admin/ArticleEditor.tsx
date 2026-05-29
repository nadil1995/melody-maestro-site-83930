import { useState, useEffect, useCallback, useRef } from "react";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link as LinkIcon, ImagePlus, Quote, Code, Undo, Redo,
  ArrowLeft, Save, Globe, Eye, EyeOff, Trash2, Plus, X
} from "lucide-react";
import type { Article, ArticleMeta } from "@/types/article";
import {
  fetchArticleIndex, fetchArticle, saveArticle,
  deleteArticle, uploadArticleImage, slugify
} from "@/lib/articleStorage";

/* ─── Toolbar button helper ─────────────────────────────────────── */
function ToolBtn({
  onClick, active = false, title, children,
}: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`p-1.5 rounded text-sm transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "hover:bg-muted text-foreground/70 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

/* ─── Article List ────────────────────────────────────────────────── */
function ArticleList({
  articles, onEdit, onNew,
}: { articles: ArticleMeta[]; onEdit: (id: string) => void; onNew: () => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-playfair text-2xl font-bold">Articles</h2>
        <Button onClick={onNew} size="sm">
          <Plus className="w-4 h-4 mr-2" /> New Article
        </Button>
      </div>
      {articles.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-lg">
          No articles yet. Click "New Article" to get started.
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between border border-border rounded-lg p-4 hover:bg-muted/20 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      a.status === "published"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}
                  >
                    {a.status === "published" ? "Published" : "Draft"}
                  </span>
                  <h3 className="font-semibold truncate">{a.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground truncate">{a.summary}</p>
                <div className="text-xs text-muted-foreground mt-1">
                  {a.publishedAt
                    ? `Published ${new Date(a.publishedAt).toLocaleDateString("en-GB")}`
                    : `Created ${new Date(a.createdAt).toLocaleDateString("en-GB")}`}
                  {a.tags.length > 0 && ` · ${a.tags.join(", ")}`}
                </div>
              </div>
              <Button variant="outline" size="sm" className="ml-4" onClick={() => onEdit(a.id)}>
                Edit
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main Editor Component ──────────────────────────────────────── */
export default function ArticleEditor() {
  const { toast } = useToast();

  const [view, setView] = useState<"list" | "editor">("list");
  const [index, setIndex] = useState<ArticleMeta[]>([]);
  const [loadingIndex, setLoadingIndex] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  // Form fields
  const [articleId, setArticleId] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [createdAt, setCreatedAt] = useState("");
  const [publishedAt, setPublishedAt] = useState<string | undefined>();
  const [slugEdited, setSlugEdited] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const inlineImageInputRef = useRef<HTMLInputElement>(null);

  // Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Start writing your article…" }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-lg dark:prose-invert max-w-none min-h-[400px] focus:outline-none px-1",
      },
    },
  });

  // Load index on mount
  useEffect(() => {
    fetchArticleIndex().then((data) => {
      setIndex(data);
      setLoadingIndex(false);
    });
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugEdited && title) setSlug(slugify(title));
  }, [title, slugEdited]);

  // ── Helpers ────────────────────────────────────────────────────────

  function resetForm() {
    setArticleId(crypto.randomUUID());
    setTitle("");
    setSlug("");
    setSummary("");
    setCoverImage("");
    setTags("");
    setStatus("draft");
    setCreatedAt(new Date().toISOString());
    setPublishedAt(undefined);
    setSlugEdited(false);
    editor?.commands.setContent("");
  }

  function newArticle() {
    resetForm();
    setView("editor");
  }

  async function loadArticleForEdit(id: string) {
    const meta = index.find((a) => a.id === id);
    if (!meta) return;
    const full = await fetchArticle(meta.slug);
    if (!full) {
      toast({ title: "Error", description: "Could not load article content.", variant: "destructive" });
      return;
    }
    setArticleId(full.id);
    setTitle(full.title);
    setSlug(full.slug);
    setSummary(full.summary);
    setCoverImage(full.coverImage ?? "");
    setTags(full.tags.join(", "));
    setStatus(full.status);
    setCreatedAt(full.createdAt);
    setPublishedAt(full.publishedAt);
    setSlugEdited(true);
    editor?.commands.setContent(full.content);
    setView("editor");
  }

  const handleSave = useCallback(
    async (publish?: boolean) => {
      if (!title.trim()) {
        toast({ title: "Title required", variant: "destructive" });
        return;
      }
      setSaving(true);
      const newStatus: "draft" | "published" = publish ? "published" : status;
      const now = new Date().toISOString();
      const article: Article = {
        id: articleId || crypto.randomUUID(),
        title: title.trim(),
        slug: slug || slugify(title),
        summary: summary.trim(),
        content: editor?.getHTML() ?? "",
        coverImage: coverImage.trim() || undefined,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        author: "Lashikala",
        status: newStatus,
        publishedAt: newStatus === "published" ? (publishedAt ?? now) : undefined,
        createdAt: createdAt || now,
        updatedAt: now,
      };
      try {
        await saveArticle(article, index);
        // Update local index
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { content: _c, ...meta } = article;
        setIndex((prev) => {
          const filtered = prev.filter((a) => a.id !== article.id);
          return [...filtered, meta].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        });
        setStatus(newStatus);
        if (newStatus === "published") setPublishedAt(article.publishedAt);
        toast({
          title: publish ? "Published!" : "Saved",
          description: publish ? "Article is now live." : "Draft saved to S3.",
        });
      } catch (err) {
        toast({ title: "Save failed", description: String(err), variant: "destructive" });
      } finally {
        setSaving(false);
      }
    },
    [articleId, title, slug, summary, coverImage, tags, status, publishedAt, createdAt, editor, index, toast]
  );

  const handleDelete = useCallback(async () => {
    if (!window.confirm("Delete this article? This cannot be undone.")) return;
    setSaving(true);
    try {
      await deleteArticle(articleId, slug, index);
      setIndex((prev) => prev.filter((a) => a.id !== articleId));
      setView("list");
      toast({ title: "Deleted", description: "Article removed." });
    } catch (err) {
      toast({ title: "Delete failed", description: String(err), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [articleId, slug, index, toast]);

  const handleCoverImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const url = await uploadArticleImage(file);
        setCoverImage(url);
        toast({ title: "Cover image uploaded" });
      } catch (err) {
        toast({ title: "Upload failed", description: String(err), variant: "destructive" });
      }
    },
    [toast]
  );

  const handleInlineImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;
      try {
        const url = await uploadArticleImage(file);
        editor.chain().focus().setImage({ src: url }).run();
      } catch (err) {
        toast({ title: "Upload failed", description: String(err), variant: "destructive" });
      }
    },
    [editor, toast]
  );

  const addLink = useCallback(() => {
    if (!linkUrl || !editor) return;
    editor.chain().focus().setLink({ href: linkUrl }).run();
    setLinkUrl("");
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  // ── Render ─────────────────────────────────────────────────────────

  if (loadingIndex) {
    return <div className="text-muted-foreground py-8 text-center">Loading articles…</div>;
  }

  if (view === "list") {
    return (
      <ArticleList
        articles={index}
        onEdit={loadArticleForEdit}
        onNew={newArticle}
      />
    );
  }

  // ── Editor view ────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={() => setView("list")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> All articles
        </button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPreviewing(!previewing)}>
            {previewing ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
            {previewing ? "Edit" : "Preview"}
          </Button>
          {index.find((a) => a.id === articleId) && (
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={handleDelete} disabled={saving}>
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => handleSave(false)} disabled={saving}>
            <Save className="w-4 h-4 mr-1" /> {saving ? "Saving…" : "Save Draft"}
          </Button>
          <Button size="sm" onClick={() => handleSave(true)} disabled={saving}>
            <Globe className="w-4 h-4 mr-1" /> {saving ? "Publishing…" : "Publish"}
          </Button>
        </div>
      </div>

      {/* Status badge */}
      {index.find((a) => a.id === articleId) && (
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              status === "published"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            }`}
          >
            {status === "published" ? "● Published" : "○ Draft"}
          </span>
          {status === "published" && publishedAt && (
            <span className="text-xs text-muted-foreground">
              {new Date(publishedAt).toLocaleDateString("en-GB")}
              {" · "}
              <a
                href={`/blog/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                View live
              </a>
            </span>
          )}
        </div>
      )}

      {/* Meta fields */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Title *</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Slug (URL)</label>
          <Input
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
            placeholder="article-url-slug"
          />
        </div>
        <div className="md:col-span-2 space-y-1">
          <label className="text-sm font-medium">Summary / Meta description</label>
          <Input
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Short description shown in cards and search results (≤160 chars)"
            maxLength={160}
          />
          <p className="text-xs text-muted-foreground">{summary.length}/160</p>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Tags (comma separated)</label>
          <Input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="flute, music, lessons"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Cover image</label>
          <div className="flex gap-2">
            <Input
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://... or upload →"
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => coverImageInputRef.current?.click()}
            >
              <ImagePlus className="w-4 h-4" />
            </Button>
            <input
              ref={coverImageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverImageUpload}
            />
          </div>
          {coverImage && (
            <div className="relative mt-2 w-full h-32 rounded overflow-hidden border border-border">
              <img src={coverImage} alt="cover" className="w-full h-full object-cover" />
              <button
                onClick={() => setCoverImage("")}
                className="absolute top-1 right-1 bg-background/80 rounded p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Preview mode */}
      {previewing ? (
        <div className="border border-border rounded-lg p-8">
          {coverImage && (
            <img src={coverImage} alt={title} className="w-full h-56 object-cover rounded-lg mb-6" />
          )}
          <h1 className="font-playfair text-4xl font-bold mb-2">{title || "Untitled"}</h1>
          {summary && <p className="text-muted-foreground text-lg mb-6">{summary}</p>}
          <div
            className="prose prose-lg dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: editor?.getHTML() ?? "" }}
          />
        </div>
      ) : (
        /* Editor */
        <div className="border border-border rounded-lg overflow-hidden">
          {/* Toolbar */}
          <div className="border-b border-border bg-muted/30 p-2 flex flex-wrap gap-0.5 items-center">
            <ToolBtn onClick={() => editor?.chain().focus().undo().run()} title="Undo"><Undo className="w-4 h-4" /></ToolBtn>
            <ToolBtn onClick={() => editor?.chain().focus().redo().run()} title="Redo"><Redo className="w-4 h-4" /></ToolBtn>
            <span className="w-px h-5 bg-border mx-1" />
            <ToolBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} active={editor?.isActive("heading", { level: 1 })} title="Heading 1"><Heading1 className="w-4 h-4" /></ToolBtn>
            <ToolBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive("heading", { level: 2 })} title="Heading 2"><Heading2 className="w-4 h-4" /></ToolBtn>
            <ToolBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} active={editor?.isActive("heading", { level: 3 })} title="Heading 3"><Heading3 className="w-4 h-4" /></ToolBtn>
            <span className="w-px h-5 bg-border mx-1" />
            <ToolBtn onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive("bold")} title="Bold"><Bold className="w-4 h-4" /></ToolBtn>
            <ToolBtn onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive("italic")} title="Italic"><Italic className="w-4 h-4" /></ToolBtn>
            <ToolBtn onClick={() => editor?.chain().focus().toggleUnderline().run()} active={editor?.isActive("underline")} title="Underline"><UnderlineIcon className="w-4 h-4" /></ToolBtn>
            <ToolBtn onClick={() => editor?.chain().focus().toggleStrike().run()} active={editor?.isActive("strike")} title="Strikethrough"><Strikethrough className="w-4 h-4" /></ToolBtn>
            <span className="w-px h-5 bg-border mx-1" />
            <ToolBtn onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive("bulletList")} title="Bullet list"><List className="w-4 h-4" /></ToolBtn>
            <ToolBtn onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive("orderedList")} title="Ordered list"><ListOrdered className="w-4 h-4" /></ToolBtn>
            <ToolBtn onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive("blockquote")} title="Blockquote"><Quote className="w-4 h-4" /></ToolBtn>
            <ToolBtn onClick={() => editor?.chain().focus().toggleCode().run()} active={editor?.isActive("code")} title="Inline code"><Code className="w-4 h-4" /></ToolBtn>
            <span className="w-px h-5 bg-border mx-1" />
            <ToolBtn onClick={() => editor?.chain().focus().setTextAlign("left").run()} active={editor?.isActive({ textAlign: "left" })} title="Align left"><AlignLeft className="w-4 h-4" /></ToolBtn>
            <ToolBtn onClick={() => editor?.chain().focus().setTextAlign("center").run()} active={editor?.isActive({ textAlign: "center" })} title="Center"><AlignCenter className="w-4 h-4" /></ToolBtn>
            <ToolBtn onClick={() => editor?.chain().focus().setTextAlign("right").run()} active={editor?.isActive({ textAlign: "right" })} title="Align right"><AlignRight className="w-4 h-4" /></ToolBtn>
            <ToolBtn onClick={() => editor?.chain().focus().setTextAlign("justify").run()} active={editor?.isActive({ textAlign: "justify" })} title="Justify"><AlignJustify className="w-4 h-4" /></ToolBtn>
            <span className="w-px h-5 bg-border mx-1" />
            {/* Link */}
            {showLinkInput ? (
              <div className="flex items-center gap-1">
                <input
                  className="border border-border rounded px-2 py-1 text-xs w-40 bg-background"
                  placeholder="https://..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addLink()}
                  autoFocus
                />
                <Button size="sm" className="h-7 text-xs px-2" onClick={addLink}>Add</Button>
                <button onClick={() => { setShowLinkInput(false); setLinkUrl(""); }} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <ToolBtn onClick={() => {
                if (editor?.isActive("link")) {
                  editor.chain().focus().unsetLink().run();
                } else {
                  setShowLinkInput(true);
                }
              }} active={editor?.isActive("link")} title="Link"><LinkIcon className="w-4 h-4" /></ToolBtn>
            )}
            {/* Inline image upload */}
            <ToolBtn onClick={() => inlineImageInputRef.current?.click()} title="Insert image"><ImagePlus className="w-4 h-4" /></ToolBtn>
            <input
              ref={inlineImageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleInlineImageUpload}
            />
          </div>

          {/* Editor content */}
          <div className="p-4 bg-background">
            <EditorContent editor={editor} />
          </div>
        </div>
      )}
    </div>
  );
}
