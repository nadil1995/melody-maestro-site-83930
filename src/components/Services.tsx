import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, BookOpen, Users, Clock, HeartPulse } from "lucide-react";
import musicNotesImg from "@/assets/music-notes.jpg";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const Services = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [50, -50]);

  const services = [
     {
      icon: HeartPulse,
      title: "Mind Relaxation through Music",
      description: "Experience the therapeutic benefits of music to reduce stress and enhance well-being",
      features: ["Guided listening sessions", "Breathing techniques", "Mindfulness practices", "Personalized music selection"]
      
    },
    {
      icon: Music,
      title: "Western Flute Lessons",
      description: "Comprehensive flute instruction in Croydon, London & Surrey for all skill levels, covering Western classical flute techniques",
      features: ["Technique development", "Repertoire building", "Performance preparation", "Breath control mastery"]
    },
      {
      icon: Music,
      title: "Indian Flute Lessons",
      description: "Comprehensive flute instruction in Croydon, London & Surrey for all skill levels, covering Indian Bamboo flute and Indian flute (Bansuri) techniques",
      features: ["Technique development", "Repertoire building", "Performance preparation", "Breath control mastery"]
    },
    {
      icon: BookOpen,
      title: "Western Music Theory",
      description: "Build a strong foundation in music theory to enhance your understanding and performance",
      features: ["Notation and sight-reading", "Harmony and composition", "Ear training", "Music history and context"]
    },
     {
      icon: BookOpen,
      title: "Indian Music Theory",
      description: "Build a strong foundation in Indian music theory to enhance your understanding and performance",
      features: ["Notation and sight-reading", "Raaga", "Ear training", "Indian Music history and context"]
    }
  ];

  return (
    <section id="services" className="py-24 bg-muted/30 relative overflow-hidden" ref={ref}>
      
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/3 rounded-full blur-3xl"
        style={{ y: y1 }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
              Music Lessons & Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Personalized instruction designed to help you achieve your musical goals
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto mt-6" />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card className="border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-2 h-full">
                  <CardHeader>
                    <motion.div
                      className="bg-primary/10 w-14 h-14 rounded-lg flex items-center justify-center mb-4"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <service.icon className="w-7 h-7 text-primary" />
                    </motion.div>
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
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8 }}
          >
            <Card className="border-border overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="grid md:grid-cols-2">
                <motion.div
                  className="h-64 md:h-auto bg-cover bg-center"
                  style={{ backgroundImage: `url(${musicNotesImg})` }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.5 }}
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
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Services;