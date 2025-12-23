import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { usePageTracking } from "@/hooks/usePageTracking";
import { MapPin, Music, User, Image, Mail, Award } from "lucide-react";

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
      title: "Portfolio",
      description: "View recent performances, achievements, and experience in classical music",
      icon: <Award className="w-5 h-5" />,
      changeFrequency: "weekly",
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
                Download the XML sitemap for search engine optimization. This file helps search engines
                like Google, Bing, and others crawl and index all pages on our website.
              </p>
              <button
                onClick={handleDownloadSitemap}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                <MapPin className="w-4 h-4" />
                Download sitemap.xml
              </button>
              <p className="text-sm text-muted-foreground mt-4">
                Alternatively, you can access the sitemap at:{" "}
                <code className="bg-muted px-2 py-1 rounded text-xs">
                  https://www.lflauto.co.uk/sitemap.xml
                </code>
              </p>
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
