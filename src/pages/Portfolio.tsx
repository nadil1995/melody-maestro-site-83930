import { useEffect, useState, useRef } from "react";
import { Music, Award, Calendar, ExternalLink } from "lucide-react";
import Footer from "@/components/Footer";
import { usePageTracking } from "@/hooks/usePageTracking";
import { useCanonical } from "@/hooks/useCanonical";

const Portfolio = () => {
  usePageTracking("Portfolio");
  useCanonical("/portfolio");

  const [performances, setPerformances] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

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

    Promise.all([
      fetch(`${S3_BASE}/data/performances.json?t=${Date.now()}`).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(`${S3_BASE}/data/achievements.json?t=${Date.now()}`).then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([perf, ach]) => {
      setPerformances(sortByDate(perf));
      setAchievements(sortByDate(ach));
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-10 text-center text-muted-foreground">Loading portfolio...</div>;

  return (
    <div className="min-h-screen pt-16 bg-background">
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">Portfolio</h1>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto mb-6" />
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                A collection of performances, collaborations, and achievements throughout my musical journey
              </p>
            </div>

            {/* Recent Performances */}
            <div className="mb-16">
              <h2 className="font-playfair text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
                <Music className="w-8 h-8 text-primary" />
                Recent Performances
              </h2>
              <div className="grid gap-6">
                {performances.length > 0 ? (
                  performances.map((p, index) => (
                    <div key={index} className="bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col md:flex-row">
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
                          <h3 className="font-playfair text-2xl font-semibold text-foreground">{p.title}</h3>
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
                    <p className="text-muted-foreground">Performance data will be displayed here soon.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Achievements */}
            <div>
              <h2 className="font-playfair text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
                <Award className="w-8 h-8 text-accent" />
                Achievements & Experience
              </h2>
              <div className="grid gap-6">
                {achievements.length > 0 ? (
                  achievements.map((a, index) => (
                    <div key={index} className="bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col md:flex-row">
                      {a.image && (
                        <div className="w-full md:w-40 h-40 bg-muted flex-shrink-0 overflow-hidden">
                          <img
                            src={a.image}
                            alt={a.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                      )}
                      <div className="p-6 flex flex-col flex-1">
                        <p className="text-lg text-foreground mb-4">{a.title}</p>
                        {a.link && (
                          <a
                            href={a.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors font-medium mt-auto"
                          >
                            View Details
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-card p-8 rounded-lg border border-border text-center">
                    <p className="text-muted-foreground">Achievements data will be displayed here soon.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Portfolio;
