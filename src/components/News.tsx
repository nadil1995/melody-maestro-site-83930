import { useEffect, useState } from "react";
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

const S3_NEWS = `https://${import.meta.env.VITE_S3_BUCKET || "geoapp-build-artifacts"}.s3.${import.meta.env.VITE_S3_REGION || "eu-west-2"}.amazonaws.com/data/news.json`;

const News = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${S3_NEWS}?t=${Date.now()}`)
      .then(r => r.ok ? r.json() : [])
      .catch(() => [])
      .then((data: NewsItem[]) => {
        setNews(data);
        setLoading(false);
      });
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
                    <div
                      className="w-full bg-muted"
                      style={{
                        height: '60vh',
                        backgroundImage: `url(${item.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="hidden"
                        onError={(e) => {
                          const parent = (e.target as HTMLImageElement).parentElement;
                          if (parent) parent.style.display = "none";
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
