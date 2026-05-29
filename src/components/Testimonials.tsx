import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";

interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  image?: string;
}

interface TestimonialsProps {
  testimonials?: Testimonial[];
}

const Testimonials = ({ testimonials = [] }: TestimonialsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  // Default testimonials if none provided
  const defaultTestimonials: Testimonial[] = [
    {
      id: "1",
      quote: "Exceptional musical talent and dedication. The performances are captivating and emotionally resonant.",
      name: "Client Name",
      role: "Event Organizer",
    },
    {
      id: "2",
      quote: "A true professional with remarkable flute skills. Every performance exceeds expectations.",
      name: "Client Name",
      role: "Music Director",
    },
    {
      id: "3",
      quote: "Outstanding artistry and beautiful interpretations. A pleasure to work with.",
      name: "Client Name",
      role: "Concert Producer",
    },
    {
      id: "4",
      quote: "Incredible versatility across different musical genres and styles.",
      name: "Client Name",
      role: "Festival Coordinator",
    },
  ];

  const displayTestimonials = testimonials.length > 0 ? testimonials : defaultTestimonials;

  // Auto-advance carousel
  useEffect(() => {
    if (!autoplay) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayTestimonials.length);
    }, 5000); // Change testimonial every 5 seconds

    return () => clearInterval(interval);
  }, [autoplay, displayTestimonials.length]);

  const nextTestimonial = () => {
    setAutoplay(false);
    setCurrentIndex((prev) => (prev + 1) % displayTestimonials.length);
    setTimeout(() => setAutoplay(true), 5000);
  };

  const prevTestimonial = () => {
    setAutoplay(false);
    setCurrentIndex((prev) => (prev - 1 + displayTestimonials.length) % displayTestimonials.length);
    setTimeout(() => setAutoplay(true), 5000);
  };

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
              Testimonials
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              What others say about my performances
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto mt-6" />
          </motion.div>

          {/* Carousel Container */}
          <div className="relative">
            {/* Testimonial Cards */}
            <AnimatePresence mode="wait">
              {displayTestimonials.map((testimonial, index) => (
                index === currentIndex && (
                  <motion.div
                    key={testimonial.id}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="border-border hover:shadow-xl transition-all duration-300 overflow-hidden">
                      <CardContent className="p-8 md:p-12">
                        {/* Stars */}
                        <div className="flex gap-1 mb-6">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-5 h-5 fill-primary text-primary"
                            />
                          ))}
                        </div>

                        {/* Quote */}
                        <p className="text-lg md:text-xl text-foreground mb-8 italic leading-relaxed">
                          "{testimonial.quote}"
                        </p>

                        {/* Author */}
                        <div className="flex items-center gap-4">
                          {testimonial.image && (
                            <img
                              src={testimonial.image}
                              alt={testimonial.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <p className="font-semibold text-foreground">
                              {testimonial.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {testimonial.role}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              ))}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <button
              onClick={prevTestimonial}
              className="absolute -left-12 md:-left-16 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={nextTestimonial}
              className="absolute -right-12 md:-right-16 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-8">
              {displayTestimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setAutoplay(false);
                    setCurrentIndex(index);
                    setTimeout(() => setAutoplay(true), 5000);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-primary w-8"
                      : "bg-muted-foreground/40 hover:bg-muted-foreground/60"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
