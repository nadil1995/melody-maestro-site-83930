import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, BookOpen, Users, Clock } from "lucide-react";
import musicNotesImg from "@/assets/music-notes.jpg";

const Services = () => {
  const services = [
    {
      icon: Music,
      title: "Flute Lessons",
      description: "Comprehensive flute instruction for all skill levels, covering Western and Indian classical techniques",
      features: ["Technique development", "Repertoire building", "Performance preparation", "Breath control mastery"]
    },
    {
      icon: BookOpen,
      title: "Music Theory",
      description: "Build a strong foundation in music theory to enhance your understanding and performance",
      features: ["Notation and sight-reading", "Harmony and composition", "Ear training", "Music history and context"]
    },
    {
      icon: Users,
      title: "Group Workshops",
      description: "Collaborative learning experiences in ensemble playing and music appreciation",
      features: ["Chamber music", "Orchestra preparation", "Cultural music exploration", "Performance workshops"]
    }
  ];

  return (
    <section id="services" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
              Music Lessons & Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Personalized instruction designed to help you achieve your musical goals
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto mt-6" />
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {services.map((service, index) => (
              <Card key={index} className="border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="bg-primary/10 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                    <service.icon className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="font-playfair text-2xl">{service.title}</CardTitle>
                  <CardDescription className="text-base">{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-foreground/80">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-border overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div 
                className="h-64 md:h-auto bg-cover bg-center"
                style={{ backgroundImage: `url(${musicNotesImg})` }}
              />
              <CardContent className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-accent mb-4">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold">Flexible Scheduling</span>
                </div>
                <h3 className="font-playfair text-2xl font-bold mb-3">
                  Personalized Learning Experience
                </h3>
                <p className="text-muted-foreground mb-4">
                  Lessons are tailored to your individual goals, whether you're a beginner discovering 
                  the flute or an advanced student preparing for performances. Both in-person and online 
                  sessions available.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>30, 45, or 60-minute sessions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Weekly or bi-weekly scheduling</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Performance opportunities</span>
                  </li>
                </ul>
              </CardContent>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Services;