import { Music2, Users, Award } from "lucide-react";

const About = () => {
  return (
    <section id="about" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
              About the Artist
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto" />
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <p className="text-lg text-foreground/80 leading-relaxed">
                With years of dedication to the art of flute performance, I've had the privilege of performing 
                with prestigious orchestras across both Western and Indian classical music traditions.
              </p>
              <p className="text-lg text-foreground/80 leading-relaxed">
                My journey spans concert halls and cultural venues, where I've explored the rich tapestry of 
                classical music from both hemispheres. This unique perspective allows me to bring depth and 
                versatility to every performance and teaching session.
              </p>
              <p className="text-lg text-foreground/80 leading-relaxed">
                Now, I'm passionate about sharing this knowledge with aspiring musicians, helping them develop 
                their skills in both flute technique and music theory fundamentals.
              </p>
            </div>

            <div className="grid gap-6">
              <div className="bg-card p-6 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Music2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-playfair text-xl font-semibold mb-2">Dual Traditions</h3>
                    <p className="text-muted-foreground">
                      Expert in both Western and Indian classical music performance and pedagogy
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-accent/10 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-playfair text-xl font-semibold mb-2">Orchestra Experience</h3>
                    <p className="text-muted-foreground">
                      Performed with renowned orchestras in diverse concert settings
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-secondary/10 p-3 rounded-lg">
                    <Award className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-playfair text-xl font-semibold mb-2">Dedicated Teaching</h3>
                    <p className="text-muted-foreground">
                      Committed to nurturing the next generation of musicians with personalized instruction
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;