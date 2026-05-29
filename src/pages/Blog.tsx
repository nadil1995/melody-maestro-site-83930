import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Tag, ArrowRight, BookOpen } from "lucide-react";
import Footer from "@/components/Footer";
import { usePageTracking } from "@/hooks/usePageTracking";
import { useCanonical } from "@/hooks/useCanonical";
import { fetchArticleIndex } from "@/lib/articleStorage";
import type { ArticleMeta } from "@/types/article";

const Blog = () => {
  usePageTracking("Blog");
  useCanonical("/blog");

  const [articles, setArticles] = useState<ArticleMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    fetchArticleIndex().then((all) => {
      setArticles(all.filter((a) => a.status === "published"));
      setLoading(false);
    });
  }, []);

  // Update document meta for SEO
  useEffect(() => {
    document.title = "Blog & Articles | LF Flauto";
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (meta) meta.content =
      "Flute tips, music insights, and articles by Lashikala — professional flautist in Croydon, London & Surrey.";
  }, []);

  const allTags = Array.from(new Set(articles.flatMap((a) => a.tags))).sort();
  const filtered = activeTag
    ? articles.filter((a) => a.tags.includes(activeTag))
    : articles;

  return (
    <div className="min-h-screen pt-16 pb-12">
      <section className="py-24 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-2 mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
                <h1 className="font-playfair text-4xl md:text-5xl font-bold text-foreground">
                  Blog & Articles
                </h1>
              </div>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto mb-6" />
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                Flute tips, practice guides, music theory, and insights from Lashikala's musical journey.
              </p>
            </div>

            {/* Tag filter */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center mb-10">
                <button
                  onClick={() => setActiveTag(null)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                    !activeTag
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-primary text-foreground/70 hover:text-foreground"
                  }`}
                >
                  All
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                    className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                      activeTag === tag
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:border-primary text-foreground/70 hover:text-foreground"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}

            {/* Articles */}
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border border-border rounded-lg overflow-hidden animate-pulse">
                    <div className="h-48 bg-muted" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24 text-muted-foreground">
                {activeTag ? `No articles tagged "${activeTag}".` : "No articles published yet. Check back soon!"}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((article) => (
                  <Link
                    key={article.id}
                    to={`/blog/${article.slug}`}
                    className="group border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/50 bg-card flex flex-col"
                  >
                    {/* Cover */}
                    {article.coverImage ? (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={article.coverImage}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-primary/30" />
                      </div>
                    )}

                    <div className="p-5 flex flex-col flex-1">
                      {/* Tags */}
                      {article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {article.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <h2 className="font-playfair text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
                        {article.title}
                      </h2>

                      <p className="text-sm text-foreground/70 line-clamp-3 flex-1">
                        {article.summary}
                      </p>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          {article.publishedAt
                            ? new Date(article.publishedAt).toLocaleDateString("en-GB", {
                                day: "numeric", month: "short", year: "numeric",
                              })
                            : ""}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-primary font-medium">
                          Read more <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Blog;
