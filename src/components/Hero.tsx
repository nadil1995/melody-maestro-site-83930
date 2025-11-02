import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";
import heroImage from "@/assets/hero-flute.jpg";

const Hero = () => {
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.4)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      <div className="container mx-auto px-4 z-10 text-center">
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-accent/20 backdrop-blur-sm border border-accent/30">
            <Music className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-background">Professional Flutist</span>
          </div>
          
          <h1 className="font-playfair text-5xl md:text-7xl font-bold mb-6 text-background leading-tight">
            Classical Music
            <span className="block text-accent">Reimagined</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-background/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Bridging Western and Indian classical traditions through the art of flute performance and dedicated music education
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={scrollToContact}
              className="bg-accent text-secondary hover:bg-accent/90 font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Book a Lesson
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              className="border-2 border-background/80 text-background hover:bg-background/10 backdrop-blur-sm font-semibold px-8 py-6 text-lg"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-background/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-background/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default Hero;