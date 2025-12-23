import { useEffect } from "react";

const SitemapXML = () => {
  useEffect(() => {
    // Set the content type to XML
    const response = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.lflauto.co.uk/</loc>
    <lastmod>2025-12-23</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.lflauto.co.uk/about</loc>
    <lastmod>2025-12-23</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.lflauto.co.uk/portfolio</loc>
    <lastmod>2025-12-23</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.lflauto.co.uk/gallery</loc>
    <lastmod>2025-12-23</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://www.lflauto.co.uk/contact</loc>
    <lastmod>2025-12-23</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.lflauto.co.uk/sitemap</loc>
    <lastmod>2025-12-23</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;

    // Create a blob with XML content
    const blob = new Blob([response], { type: "application/xml" });

    // Download the XML file
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sitemap.xml";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, []);

  return null;
};

export default SitemapXML;
