import { useEffect, useState } from "react";
import { Award, ExternalLink } from "lucide-react";
import Footer from "@/components/Footer";
import { usePageTracking } from "@/hooks/usePageTracking";
import { useSEO } from "@/hooks/useSEO";

const Awards = () => {
  usePageTracking("Awards");
  useSEO({
    title: "Awards & Achievements | Lashikala Hettiarachchi",
    description:
      "National Youth Award-winning flautist Lashikala Hettiarachchi's achievements, qualifications, and recognitions in Western and Indian classical music.",
    path: "/awards",
  });

  const [achievements, setAchievements] = useState<any[]>([]);
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
    fetch(`${S3_BASE}/data/achievements.json?t=${Date.now()}`)
      .then(r => r.ok ? r.json() : [])
      .catch(() => [])
      .then((data: any[]) => {
        setAchievements(sortByDate(data));
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-center text-muted-foreground">Loading awards...</div>;

  return (
    <div className="min-h-screen pt-16 bg-background">
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
                Achievements &amp; Awards
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto mb-6" />
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                Recognition, awards, and milestones throughout my musical career
              </p>
            </div>

            <div className="grid gap-6">
              {achievements.length > 0 ? (
                achievements.map((a, index) => (
                  <div
                    key={index}
                    className="bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col md:flex-row"
                  >
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
                      <div className="flex items-start gap-3 mb-2">
                        <Award className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                        <p className="text-lg text-foreground">{a.title}</p>
                      </div>
                      {a.date && (
                        <p className="text-sm text-muted-foreground ml-8 mb-2">{a.date}</p>
                      )}
                      {a.link && (
                        <a
                          href={a.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors font-medium mt-auto ml-8"
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
                  <p className="text-muted-foreground">Awards data will be displayed here soon.</p>
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

export default Awards;
