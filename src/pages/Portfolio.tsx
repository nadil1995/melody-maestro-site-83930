import { useEffect, useState } from "react";
import { Music, Award, Calendar } from "lucide-react";
import Footer from "@/components/Footer";
import { usePageTracking } from "@/hooks/usePageTracking";

const Portfolio = () => {
  usePageTracking("Portfolio");

  const [performances, setPerformances] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace these with your published CSV links or API endpoints
        const perfRes = await fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vSm7_VKWjou_53pSM0zc1M1FRP0GeduboWNrAfhmFjrAlmTC3UPHgJy_MHKACH8dvVTwgNctjqvwqSH/pub?output=csv");
        const achRes = await fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vSm7_VKWjou_53pSM0zc1M1FRP0GeduboWNrAfhmFjrAlmTC3UPHgJy_MHKACH8dvVTwgNctjqvwqSH/pub?output=csv");

        const perfText = await perfRes.text();
        const achText = await achRes.text();

        // Parse CSV manually (simple split logic)
        const parseCSV = (str) => {
          const [header, ...rows] = str.trim().split("\n").map(r => r.split(","));
          return rows.map(row =>
            Object.fromEntries(header.map((key, i) => [key.trim(), row[i]?.trim()]))
          );
        };

        const performancesData = parseCSV(perfText);
        const achievementsData = parseCSV(achText).map(r => r.achievement);

        setPerformances(performancesData);
        setAchievements(achievementsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false); // Set loading to false even on error
      }
    };

    fetchData();
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
                    <div key={index} className="bg-card p-6 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-playfair text-2xl font-semibold text-foreground">{p.title}</h3>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {p.date}
                        </span>
                      </div>
                      <p className="text-primary font-medium mb-2">{p.venue}</p>
                      <p className="text-foreground/70">{p.description}</p>
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
              <div className="grid md:grid-cols-2 gap-4">
                {achievements.length > 0 ? (
                  achievements.map((a, index) => (
                    <div key={index} className="bg-card p-6 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-lg text-foreground">{a}</p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 bg-card p-8 rounded-lg border border-border text-center">
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
