import { Music, Award, Calendar } from "lucide-react";
import Footer from "@/components/Footer";

const Portfolio = () => {
  const performances = [
    {
      title: "Symphony Orchestra Performance",
      date: "March 2024",
      venue: "National Concert Hall",
      description: "Featured soloist in Mozart's Flute Concerto No. 1",
    },
    {
      title: "Indian Classical Ensemble",
      date: "January 2024",
      venue: "Cultural Center",
      description: "Bansuri performance in traditional ragas",
    },
    {
      title: "Chamber Music Recital",
      date: "November 2023",
      venue: "City Music Hall",
      description: "Baroque chamber music with period instruments",
    },
  ];

  const achievements = [
    "Principal Flutist, City Symphony Orchestra",
    "Graduate, Prestigious Music Conservatory",
    "Award Winner, National Music Competition",
    "Guest Artist, International Music Festival",
  ];

  return (
    <div className="min-h-screen pt-16 bg-background">
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
                Portfolio
              </h1>
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
                {performances.map((performance, index) => (
                  <div
                    key={index}
                    className="bg-card p-6 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-playfair text-2xl font-semibold text-foreground">
                        {performance.title}
                      </h3>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {performance.date}
                      </span>
                    </div>
                    <p className="text-primary font-medium mb-2">{performance.venue}</p>
                    <p className="text-foreground/70">{performance.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div>
              <h2 className="font-playfair text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
                <Award className="w-8 h-8 text-accent" />
                Achievements & Experience
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="bg-card p-6 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow"
                  >
                    <p className="text-lg text-foreground">{achievement}</p>
                  </div>
                ))}
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
