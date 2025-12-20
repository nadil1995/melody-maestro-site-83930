import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, User, ExternalLink, Tag } from "lucide-react";

interface Publication {
  title: string;
  date: string;
  author?: string;
  category?: string;
  excerpt: string;
  image?: string;
  link?: string;
}

const Publications = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchPublications = async () => {
      try {
        // Check cache first
        const cachedPubs = sessionStorage.getItem('publications_data');
        const cacheTime = sessionStorage.getItem('publications_cache_time');
        const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

        if (cachedPubs && cacheTime && Date.now() - parseInt(cacheTime) < CACHE_DURATION) {
          setPublications(JSON.parse(cachedPubs));
          setLoading(false);
          return;
        }

        const fetchWithTimeout = (url: string, timeout = 5000) => {
          return Promise.race([
            fetch(url),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Request timeout')), timeout)
            )
          ]);
        };

        const response = await fetchWithTimeout(
          "https://docs.google.com/spreadsheets/d/e/2PACX-1vRFj7lqxRVSDEmlLHpEsDxmM7LgRgQDV22Iv_DkOTxNtEY9gyTePZexBihb6lBbPHIyW5Lf4uqXoFhf/pub?output=csv&gid=2"
        );

        const text = await (response as Response).text();
        const lines = text.trim().split("\n");

        if (lines.length < 2) {
          setPublications([]);
          setLoading(false);
          return;
        }

        const header = lines[0].split(",").map(h => h.trim());
        const pubsData: Publication[] = lines.slice(1)
          .map(line => {
            const cells = line.split(",").map(c => c.trim());
            return {
              title: cells[header.indexOf("title")] || cells[0] || "",
              date: cells[header.indexOf("date")] || "",
              author: cells[header.indexOf("author")] || "",
              category: cells[header.indexOf("category")] || cells[header.indexOf("tag")] || "",
              excerpt: cells[header.indexOf("excerpt")] || cells[header.indexOf("description")] || "",
              image: cells[header.indexOf("image")] || cells[header.indexOf("image_url")] || "",
              link: cells[header.indexOf("link")] || cells[header.indexOf("url")] || ""
            };
          })
          .filter(item => item.title);

        sessionStorage.setItem('publications_data', JSON.stringify(pubsData));
        sessionStorage.setItem('publications_cache_time', Date.now().toString());

        setPublications(pubsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching publications:", error);
        setLoading(false);
      }
    };

    fetchPublications();
  }, []);

  if (loading) {
    return <div className="p-10 text-center text-muted-foreground">Loading publications...</div>;
  }

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
              Publications & Blog
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto mb-6" />
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Insights, articles, and stories about music and teaching
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {publications.length > 0 ? (
              publications.map((pub, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
                  {pub.image && (
                    <div className="w-full h-48 overflow-hidden bg-muted">
                      <img
                        src={pub.image}
                        alt={pub.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <CardHeader className="flex-1">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{pub.title}</CardTitle>
                      </div>
                      {pub.category && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-accent/10 text-accent rounded-full whitespace-nowrap">
                          <Tag className="w-3 h-3" />
                          {pub.category}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      {pub.date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {pub.date}
                        </div>
                      )}
                      {pub.author && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {pub.author}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <p className="text-foreground/80 line-clamp-3">{pub.excerpt}</p>
                    {pub.link && (
                      <a
                        href={pub.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors font-medium mt-auto"
                      >
                        Read Article
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2 text-center py-12">
                <p className="text-muted-foreground">No publications available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Publications;
