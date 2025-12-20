import { useEffect, useState, useRef } from "react";
import { Music, Award, Calendar, ExternalLink } from "lucide-react";
import Footer from "@/components/Footer";
import { usePageTracking } from "@/hooks/usePageTracking";

const Portfolio = () => {
  usePageTracking("Portfolio");

  const [performances, setPerformances] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchData = async () => {
      try {
        // Check cache first
        const cachedData = sessionStorage.getItem('portfolio_data');
        const cacheTime = sessionStorage.getItem('portfolio_cache_time');
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

        if (cachedData && cacheTime && Date.now() - parseInt(cacheTime) < CACHE_DURATION) {
          const { performances: cachedPerf, achievements: cachedAch } = JSON.parse(cachedData);
          setPerformances(cachedPerf);
          setAchievements(cachedAch);
          setLoading(false);
          return;
        }

        // Fetch with timeout
        const fetchWithTimeout = (url: string, timeout = 8000) => {
          return Promise.race([
            fetch(url),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Request timeout')), timeout)
            )
          ]);
        };

        // Replace these with your published CSV links or API endpoints
        const [perfRes, achRes] = await Promise.all([
          fetchWithTimeout("https://docs.google.com/spreadsheets/d/e/2PACX-1vSm7_VKWjou_53pSM0zc1M1FRP0GeduboWNrAfhmFjrAlmTC3UPHgJy_MHKACH8dvVTwgNctjqvwqSH/pub?output=csv"),
          fetchWithTimeout("https://docs.google.com/spreadsheets/d/e/2PACX-1vRFj7lqxRVSDEmlLHpEsDxmM7LgRgQDV22Iv_DkOTxNtEY9gyTePZexBihb6lBbPHIyW5Lf4uqXoFhf/pub?output=csv")
        ]);

        const perfText = await (perfRes as Response).text();
        const achText = await (achRes as Response).text();

        // Parse CSV manually (simple split logic)
        const parseCSV = (str: string) => {
          const lines = str.trim().split("\n");
          if (lines.length < 2) return [];

          const header = lines[0].split(",").map(h => h.trim());
          const rows = lines.slice(1);

          return rows
            .map(row => {
              const cells = row.split(",").map(c => c.trim());
              return Object.fromEntries(header.map((key, i) => [key, cells[i] || ""]));
            })
            .filter(row => Object.values(row).some(val => val)); // Filter empty rows
        };

        const performancesData = parseCSV(perfText)
          .map((r: any) => ({
            title: r.title || r.Title || "",
            date: r.date || r.Date || "",
            venue: r.venue || r.Venue || "",
            description: r.description || r.Description || "",
            image: r.image || r.Image || r.image_url || r.imageUrl || r.thumbnail || r.Thumbnail || ""
          }))
          .filter((p: any) => p.title);
        const achievementsData = parseCSV(achText)
          .map((r: any) => ({
            title: r.achievement || r.Achievement || "",
            image: r.image || r.Image || r.image_url || r.imageUrl || r.image_link || r.imageLink || "",
            link: r.link || r.Link || r.url || r.URL || r.external_link || r.externalLink || ""
          }))
          .filter((a: any) => a.title);

        // Cache the data
        sessionStorage.setItem('portfolio_data', JSON.stringify({
          performances: performancesData,
          achievements: achievementsData
        }));
        sessionStorage.setItem('portfolio_cache_time', Date.now().toString());

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
