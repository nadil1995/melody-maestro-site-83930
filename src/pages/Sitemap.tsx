import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { usePageTracking } from "@/hooks/usePageTracking";
import { useCanonical } from "@/hooks/useCanonical";
import { useEffect } from "react";
import { MapPin, Music, User, Image, Mail, Award, BookOpen } from "lucide-react";

interface SitemapLink {
  path: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
}

const Sitemap = () => {
  usePageTracking("Sitemap");
  useCanonical("/sitemap");
  useEffect(() => {
    let meta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      document.head.appendChild(meta);
    }
    const prev = meta.content;
    meta.content = "noindex, follow";
    return () => { if (meta) meta.content = prev; };
  }, []);

  const sitemapLinks: SitemapLink[] = [
    {
      path: "/",
      title: "Home",
      description: "Professional flautist offering Western and Indian flute lessons in Croydon, London & Surrey",
      icon: <Music className="w-5 h-5" />,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      path: "/about",
      title: "About",
      description: "Learn about Lashikala - LTCL qualified professional flautist with expertise in Western and Indian classical music",
      icon: <User className="w-5 h-5" />,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      path: "/portfolio",
      title: "Performances",
      description: "View recent performances and collaborations throughout my musical journey",
      icon: <Music className="w-5 h-5" />,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      path: "/awards",
      title: "Awards",
      description: "Recognition, awards, and achievements throughout my musical career",
      icon: <Award className="w-5 h-5" />,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      path: "/gallery",
      title: "Gallery",
      description: "Photo gallery showcasing performances, teaching, and musical events",
      icon: <Image className="w-5 h-5" />,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      path: "/contact",
      title: "Contact",
      description: "Get in touch to book a lesson or inquire about flute classes",
      icon: <Mail className="w-5 h-5" />,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      path: "/blog",
      title: "Blog & Articles",
      description: "Flute tips, practice guides, music theory, and insights from Lashikala's musical journey",
      icon: <BookOpen className="w-5 h-5" />,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      path: "/western-flute-lessons-london",
      title: "Western Flute Lessons London",
      description: "Classical flute lessons in London, Croydon & Surrey — beginners to advanced, ABRSM & Trinity exam preparation",
      icon: <Music className="w-5 h-5" />,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      path: "/bansuri-lessons-croydon",
      title: "Bansuri Lessons Croydon",
      description: "Indian flute (bansuri) lessons in Croydon & London — North Indian raags, Bollywood music & Visharad exams",
      icon: <Music className="w-5 h-5" />,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      path: "/flute-performance-events",
      title: "Flute Performances for Events",
      description: "Live flute music for weddings, corporate events & private parties in London, Surrey and across the UK",
      icon: <Music className="w-5 h-5" />,
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];

  const generateSitemapXML = () => {
    const baseUrl = "https://www.lflauto.co.uk";
    const sitemapEntries = sitemapLinks
      .map(
        (link) => `
  <url>
    <loc>${baseUrl}${link.path}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>${link.changeFrequency}</changefreq>
    <priority>${link.priority}</priority>
  </url>`
      )
      .join("");

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</urlset>`;
  };

  const handleDownloadSitemap = () => {
    const sitemapXML = generateSitemapXML();
    const blob = new Blob([sitemapXML], { type: "application/xml" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sitemap.xml";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen pt-16 pb-12">
      <section className="py-24 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-2 mb-4">
                <MapPin className="w-8 h-8 text-primary" />
                <h1 className="font-playfair text-4xl md:text-5xl font-bold text-foreground">
                  Sitemap
                </h1>
              </div>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto mb-6" />
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                Browse all pages on the LF Flauto website. Find what you're looking for with ease.
              </p>
            </div>

            {/* Sitemap Links Grid */}
            <div className="grid gap-4 mb-12">
              {sitemapLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="group bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/50"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-primary group-hover:text-accent transition-colors mt-1">
                      {link.icon}
                    </div>
                    <div className="flex-1">
                      <h2 className="font-playfair text-xl font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                        {link.title}
                      </h2>
                      <p className="text-foreground/70 text-sm">{link.description}</p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground whitespace-nowrap ml-4">
                      <div className="font-medium">Priority: {link.priority}</div>
                      <div className="capitalize">{link.changeFrequency}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* XML Sitemap Section */}
            <div className="bg-card border border-border rounded-lg p-8 mb-12">
              <h2 className="font-playfair text-2xl font-bold text-foreground mb-4">
                XML Sitemap
              </h2>
              <p className="text-foreground/70 mb-6">
                The XML sitemap helps search engines like Google and Bing crawl and index all pages on our website.
                You can submit this sitemap directly to Google Search Console and Bing Webmaster Tools.
              </p>

              <div className="space-y-4 mb-6">
                <div className="bg-muted/50 border border-border rounded p-4">
                  <h3 className="font-semibold text-foreground mb-2">Direct Access</h3>
                  <p className="text-sm text-foreground/70 mb-3">
                    The sitemap is automatically available at:
                  </p>
                  <code className="block bg-background px-3 py-2 rounded border border-border text-xs overflow-auto mb-3">
                    https://www.lflauto.co.uk/sitemap.xml
                  </code>
                  <a
                    href="https://www.lflauto.co.uk/sitemap.xml"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors text-sm font-medium"
                  >
                    View Sitemap
                    <MapPin className="w-4 h-4" />
                  </a>
                </div>

                <div className="bg-muted/50 border border-border rounded p-4">
                  <h3 className="font-semibold text-foreground mb-2">Download</h3>
                  <p className="text-sm text-foreground/70 mb-3">
                    Download a copy of the sitemap for local reference:
                  </p>
                  <button
                    onClick={handleDownloadSitemap}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors font-medium text-sm"
                  >
                    <MapPin className="w-4 h-4" />
                    Download sitemap.xml
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded p-4">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Note:</strong> If you're using Google Search Console and the sitemap shows as "HTML" instead of "XML",
                  please ensure your server is configured to serve .xml files with the correct MIME type (application/xml).
                  This is typically handled by your hosting provider's web server configuration.
                </p>
              </div>
            </div>

            {/* SEO Information */}
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-lg p-8">
              <h2 className="font-playfair text-2xl font-bold text-foreground mb-4">
                About This Sitemap
              </h2>
              <ul className="space-y-3 text-foreground/80">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">•</span>
                  <span>
                    <strong>Last Updated:</strong> {new Date().toLocaleDateString("en-GB")}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">•</span>
                  <span>
                    <strong>Total Pages:</strong> {sitemapLinks.length}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">•</span>
                  <span>
                    <strong>Change Frequency:</strong> Indicates how often page content typically changes
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">•</span>
                  <span>
                    <strong>Priority:</strong> Relative priority of pages (1.0 = highest, 0.0 = lowest)
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Sitemap;
