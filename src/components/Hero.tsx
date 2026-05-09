import { Button } from "@/components/ui/button";
import { Music, ChevronLeft, ChevronRight } from "lucide-react";
import heroImage from "@/assets/hero-flute.jpg";
import westernFluteImage from "@/assets/Lashikala-playing-western-flute.jpg";
import indianFluteImage from "@/assets/Lashikala-playing-Indian-flute.jpg";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const Hero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [westernFluteImage, indianFluteImage];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.9, 0.3]);

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const goToPreviousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Parallax Background Layer with Image Slider */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{
          y,
        }}
      >
        {images.map((image, index) => (
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: index === currentImageIndex ? 1 : 0 }}
            transition={{ duration: 0.8 }}
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.4)), url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ))}
      </motion.div>

      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-primary/10 to-background/30"
        style={{ opacity: scrollYProgress }}
      />

      <motion.div
        className="container mx-auto px-4 z-10 text-center"
        style={{ opacity }}
      >
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.div
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-accent/20 backdrop-blur-sm border border-accent/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <Music className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-background">Professional Flautist & Composer · United Kingdom</span>
          </motion.div>

          <motion.h1
            className="font-playfair text-5xl md:text-7xl font-bold mb-3 text-background leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            Lashikala Hettiarachchi
          </motion.h1>

          <motion.p
            className="font-playfair text-2xl md:text-3xl text-accent mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Classical Music Reimagined
          </motion.p>

          <motion.p
            className="text-xl md:text-2xl text-background/90 mb-8 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            Sri Lankan flautist based in the UK. Western &amp; Indian flute lessons in Croydon, London &amp; Surrey. LTCL &amp; Visharad qualified.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            <Button
              size="lg"
              onClick={scrollToContact}
              className="bg-accent text-secondary hover:bg-accent/90 font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Book a Lesson
            </Button>
            {/* <Button
              size="lg"
              variant="outline"
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-accent text-secondary hover:bg-accent/90 font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Learn More
            </Button> */}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Image Slider Navigation */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
        <motion.button
          onClick={goToPreviousImage}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/30 border border-background/30 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-background" />
        </motion.button>

        <div className="flex gap-2">
          {images.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentImageIndex
                  ? 'bg-accent w-8'
                  : 'bg-background/50 w-2 hover:bg-background/70'
              }`}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </div>

        <motion.button
          onClick={goToNextImage}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/30 border border-background/30 transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-background" />
        </motion.button>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      >
        <div className="w-6 h-10 border-2 border-background/50 rounded-full flex items-start justify-center p-2">
          <motion.div
            className="w-1.5 h-3 bg-background/50 rounded-full"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;