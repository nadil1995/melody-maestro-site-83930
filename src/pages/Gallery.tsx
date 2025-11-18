import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Footer from "@/components/Footer";
import { usePageTracking } from "@/hooks/usePageTracking";

// Import all gallery photos
import img8993 from "@/assets/galaryphotos/IMG_8993.jpg";
import img8994 from "@/assets/galaryphotos/IMG_8994.jpg";
import img8997 from "@/assets/galaryphotos/IMG_8997 2.jpg";
import img8998 from "@/assets/galaryphotos/IMG_8998.jpg";
import img8999 from "@/assets/galaryphotos/IMG_8999.jpg";
import img9001 from "@/assets/galaryphotos/IMG_9001.jpg";
import img9002 from "@/assets/galaryphotos/IMG_9002.jpg";
import img9003 from "@/assets/galaryphotos/IMG_9003 2.jpg";
import img9005 from "@/assets/galaryphotos/IMG_9005.jpg";
import img9006 from "@/assets/galaryphotos/IMG_9006.jpg";
import img9007 from "@/assets/galaryphotos/IMG_9007.jpg";

const Gallery = () => {
  usePageTracking("Gallery");

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedImage(null);
    };

    if (selectedImage) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [selectedImage]);

  const galleryItems = [
    {
      src: img8993,
      alt: "Flute Performance",
      title: "Performance Moment - gustav mahler orchestra sri lanka",
    },
    {
      src: img8994,
      alt: "Musical Performance",
      title: "Performance Moment - gustav mahler orchestra sri lanka",
    },
 
    {
      src: img8997,
      alt: "Concert Performance",
      title: "Concert Performance - gustav mahler orchestra sri lanka",
    },
    {
      src: img8998,
      alt: "Concert Performance",
      title: "Concert Performance - gustav mahler orchestra sri lanka",
    },
    {
      src: img8999,
      alt: "Wind Orchestra Performance",
      title: "Orchestra Performance - Colombo Wind Orchestra",
    },
    {
      src: img9001,
      alt: "Musical Performance",
      title: "Stage Performance - Bank of ceylon London branch 75th anniversary",
    },
    {
      src: img9002,
      alt: "Flute Solo",
      title: "Candlelight Solo Performance",
    },
    {
      src: img9003,
      alt: "Concert Moment",
      title: "Candlelight Solo Performance",
    },
    {
      src: img9005,
          alt: "Stage Performance",
      title: "Pawan Podak Concert",
    },
    {
      src: img9006,
      alt: "Stage Performance",
      title: "Pawan Podak Concert",
    },

    {
      src: img9007,
      alt: "Stage Performance",
      title: "Pawan Podak Concert",
    },

  ];

  return (
    <div className="min-h-screen pt-16 bg-background">
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
                Gallery
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto mb-6" />
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                Moments from performances, rehearsals, and musical journey
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-border shadow-sm hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => setSelectedImage(item.src)}
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-playfair text-xl font-semibold">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              aria-label="Close image"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <motion.img
              src={selectedImage}
              alt="Gallery item"
              className="max-w-full max-h-full object-contain rounded-lg"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Gallery;
