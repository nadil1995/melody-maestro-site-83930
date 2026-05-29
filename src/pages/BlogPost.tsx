import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Calendar, Tag, ArrowLeft, User, BookOpen } from "lucide-react";
import Footer from "@/components/Footer";
import CommentSection from "@/components/CommentSection";
import { usePageTracking } from "@/hooks/usePageTracking";
import { useCanonical } from "@/hooks/useCanonical";
import { fetchArticle } from "@/lib/articleStorage";
import type { Article } from "@/types/article";

const BASE_URL = "https://www.lflauto.co.uk";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  usePageTracking("Blog Post");
  useCanonical(slug ? `/blog/${slug}` : "/blog");

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) { navigate("/blog", { replace: true }); return; }
    fetchArticle(slug).then((data) => {
      if (!data || data.status !== "published") {
        setNotFound(true);
      } else {
        setArticle(data);
      }
      setLoading(false);
    });
  }, [slug, navigate]);

  // SEO: dynamic <title>, <meta description>, canonical, Schema.org JSON-LD
  useEffect(() => {
    if (!article) return;

    document.title = `${article.title} | LF Flauto`;

    let desc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (desc) desc.content = article.summary;

    // Open Graph
    const setOg = (prop: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[property="${prop}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", prop);
        document.head.appendChild(el);
      }
      el.content = content;
    };
    setOg("og:title", article.title);
    setOg("og:description", article.summary);
    setOg("og:type", "article");
    setOg("og:url", `${BASE_URL}/blog/${article.slug}`);
    if (article.coverImage) setOg("og:image", article.coverImage);

    // Schema.org BlogPosting
    const schemaId = "blog-post-schema";
    let schema = document.getElementById(schemaId);
    if (!schema) {
      schema = document.createElement("script");
      schema.id = schemaId;
      schema.setAttribute("type", "application/ld+json");
      document.head.appendChild(schema);
    }
    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: article.title,
      description: article.summary,
      image: article.coverImage ?? undefined,
      author: {
        "@type": "Person",
        name: article.author,
        url: BASE_URL,
      },
      publisher: {
        "@type": "Person",
        name: "Lashikala Hettiarachchi",
        url: BASE_URL,
      },
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
      url: `${BASE_URL}/blog/${article.slug}`,
      keywords: article.tags.join(", "),
    });

    return () => {
      schema?.remove();
    };
  }, [article]);

  if (loading) {
    return (
      <div className="min-h-screen pt-16 pb-12">
        <div className="container mx-auto px-4 py-24 max-w-3xl animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="min-h-screen pt-16 pb-12 flex flex-col items-center justify-center gap-4">
        <BookOpen className="w-16 h-16 text-muted-foreground/30" />
        <h1 className="font-playfair text-3xl font-bold">Article not found</h1>
        <p className="text-muted-foreground">This article may have been removed or the URL is incorrect.</p>
        <Link to="/blog" className="text-primary underline">← Back to Blog</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 pb-12">
      {/* Cover image */}
      {article.coverImage && (
        <div className="w-full h-72 md:h-96 overflow-hidden">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Back link */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 text-xs px-3 py-1 bg-primary/10 text-primary rounded-full"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="font-playfair text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
          {article.title}
        </h1>

        {/* Summary */}
        {article.summary && (
          <p className="text-lg text-muted-foreground mb-6 font-medium border-l-4 border-primary pl-4">
            {article.summary}
          </p>
        )}

        {/* Author / date */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
          <span className="flex items-center gap-1.5">
            <User className="w-4 h-4" />
            {article.author}
          </span>
          {article.publishedAt && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(article.publishedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          )}
        </div>

        {/* Article content */}
        <div
          className="prose prose-lg dark:prose-invert max-w-none
            prose-headings:font-playfair
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-lg prose-img:shadow-md
            prose-blockquote:border-primary prose-blockquote:text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Comments */}
        <CommentSection slug={article.slug} />

        {/* Footer nav */}
        <div className="mt-12 pt-8 border-t border-border flex justify-between items-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> All articles
          </Link>
          <Link
            to="/contact"
            className="text-sm text-primary hover:text-accent transition-colors font-medium"
          >
            Book a lesson →
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogPost;
