import { useEffect, useState } from "react";
import { Music, Calendar } from "lucide-react";
import Footer from "@/components/Footer";
import { usePageTracking } from "@/hooks/usePageTracking";
import { useSEO } from "@/hooks/useSEO";

const Portfolio = () => {
  usePageTracking("Performances");
  useSEO({
    title: "Performances & Portfolio | Lashikala Hettiarachchi, Flautist",
    description:
      "Explore recent performances, concerts, and collaborations by Sri Lankan flautist Lashikala Hettiarachchi across the UK and internationally.",
    path: "/portfolio",
  });

  const [performances, setPerformances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const S3_BASE = `https://${import.meta.env.VITE_S3_BUCKET || "geoapp-build-artifacts"}.s3.${import.meta.env.VITE_S3_REGION || "eu-west-2"}.amazonaws.com`;

  const sortByDate = (arr: any[]) =>
    [...arr].sort((a, b) => {
      const da = new Date(a.date || "").getTime();
      const db = new Date(b.date || "").getTime();
      if (isNaN(da) && isNaN(db)) return 0;
      if (isNaN(da)) return 1;
      if (isNaN(db)) return -1;
      return db - da;
    });

  useEffect(() => {
    fetch(`${S3_BASE}/data/performances.json?t=${Date.now()}`)
      .then(r => r.ok ? r.json() : [])
      .catch(() => [])
      .then((data: any[]) => {
        setPerformances(sortByDate(data));
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-center text-muted-foreground">Loading performances...</div>;

  return (
    <div className="min-h-screen pt-16 bg-background">
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">Performances</h1>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto mb-6" />
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                A collection of performances and collaborations throughout my musical journey
              </p>
            </div>

            <div className="grid gap-6">
              {performances.length > 0 ? (
                performances.map((p, index) => (
                  <div
                    key={index}
                    className="bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col md:flex-row"
                  >
                    {p.image && (
                      <div className="w-full md:w-32 h-32 bg-muted flex-shrink-0 overflow-hidden">
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                    )}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h2 className="font-playfair text-2xl font-semibold text-foreground">{p.title}</h2>
                        <span className="text-sm text-muted-foreground flex items-center gap-1 whitespace-nowrap ml-2">
                          <Calendar className="w-4 h-4" />
                          {p.date}
                        </span>
                      </div>
                      <p className="text-primary font-medium mb-2">{p.venue}</p>
                      <p className="text-foreground/70">{p.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-card p-8 rounded-lg border border-border text-center">
                  <Music className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-muted-foreground">Performance data will be displayed here soon.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Portfolio;
