import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, ArrowRight, BookOpen } from "lucide-react";
import { fetchArticleIndex } from "@/lib/articleStorage";
import type { ArticleMeta } from "@/types/article";

const RecentArticles = () => {
  const [articles, setArticles] = useState<ArticleMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticleIndex().then((all) => {
      const published = all
        .filter((a) => a.status === "published")
        .sort((a, b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt))
        .slice(0, 3);
      setArticles(published);
      setLoading(false);
    });
  }, []);

  // Don't render the section if there are no articles
  if (!loading && articles.length === 0) return null;

  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <BookOpen className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium text-primary uppercase tracking-widest">
              From the Blog
            </span>
          </div>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-4">
            Latest Articles
          </h2>
          <div className="w-20 h-0.5 bg-gradient-to-r from-primary to-accent mx-auto" />
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-border rounded-lg overflow-hidden animate-pulse">
                <div className="h-44 bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {articles.map((article, idx) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Link
                  to={`/blog/${article.slug}`}
                  className="group block border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/50 bg-card h-full flex flex-col"
                >
                  {article.coverImage ? (
                    <div className="h-44 overflow-hidden">
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="h-44 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                      <BookOpen className="w-10 h-10 text-primary/30" />
                    </div>
                  )}

                  <div className="p-5 flex flex-col flex-1">
                    {article.tags.length > 0 && (
                      <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full w-fit mb-2">
                        {article.tags[0]}
                      </span>
                    )}
                    <h3 className="font-playfair text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2 flex-1">
                      {article.title}
                    </h3>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        {article.publishedAt
                          ? new Date(article.publishedAt).toLocaleDateString("en-GB", {
                              day: "numeric", month: "short",
                            })
                          : ""}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-primary font-medium">
                        Read <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary border border-primary/30 px-6 py-2.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          >
            View all articles <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RecentArticles;
