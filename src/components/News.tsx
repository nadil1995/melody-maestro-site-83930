import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, ExternalLink } from "lucide-react";

interface NewsItem {
  title: string;
  date: string;
  category: string;
  description: string;
  location?: string;
  link?: string;
  image?: string;
}

const News = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchNews = async () => {
      try {
        // Check cache first
        const cachedNews = sessionStorage.getItem('news_data');
        const cacheTime = sessionStorage.getItem('news_cache_time');
        const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

        if (cachedNews && cacheTime && Date.now() - parseInt(cacheTime) < CACHE_DURATION) {
          setNews(JSON.parse(cachedNews));
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
          "https://docs.google.com/spreadsheets/d/e/2PACX-1vRFj7lqxRVSDEmlLHpEsDxmM7LgRgQDV22Iv_DkOTxNtEY9gyTePZexBihb6lBbPHIyW5Lf4uqXoFhf/pub?output=csv&gid=1"
        );

        const text = await (response as Response).text();
        const lines = text.trim().split("\n");

        if (lines.length < 2) {
          setNews([]);
          setLoading(false);
          return;
        }

        const header = lines[0].split(",").map(h => h.trim());
        const newsData: NewsItem[] = lines.slice(1)
          .map(line => {
            const cells = line.split(",").map(c => c.trim());
            return {
              title: cells[header.indexOf("title")] || cells[0] || "",
              date: cells[header.indexOf("date")] || "",
              category: cells[header.indexOf("category")] || "",
              description: cells[header.indexOf("description")] || "",
              location: cells[header.indexOf("location")] || "",
              link: cells[header.indexOf("link")] || cells[header.indexOf("url")] || "",
              image: cells[header.indexOf("image")] || cells[header.indexOf("image_url")] || ""
            };
          })
          .filter(item => item.title);

        sessionStorage.setItem('news_data', JSON.stringify(newsData));
        sessionStorage.setItem('news_cache_time', Date.now().toString());

        setNews(newsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching news:", error);
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return <div className="p-10 text-center text-muted-foreground">Loading news...</div>;
  }

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
              News & Upcoming Events
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto mb-6" />
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Stay updated with the latest news, performances, and events
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {news.length > 0 ? (
              news.map((item, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
                  {item.image && (
                    <div className="w-full h-48 overflow-hidden bg-muted">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <CardHeader className="flex-1">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{item.title}</CardTitle>
                      </div>
                      {item.category && (
                        <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full whitespace-nowrap">
                          {item.category}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      {item.date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {item.date}
                        </div>
                      )}
                      {item.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {item.location}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <p className="text-foreground/80">{item.description}</p>
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors font-medium mt-auto"
                      >
                        Learn More
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2 text-center py-12">
                <p className="text-muted-foreground">No news available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default News;
