import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Footer from "@/components/Footer";
import { usePageTracking } from "@/hooks/usePageTracking";

type GalleryItem = {
  src: string;
  alt: string;
  title: string;
};

const GALLERY_ITEMS: readonly GalleryItem[] = [
  {
    src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/IMG_8993.jpg",
    alt: "Flute Performance",
    title: "Performance Moment - gustav mahler orchestra sri lanka",
  },
  {
    src:"https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis+images/8994.jpg",
    alt: "Musical Performance",
    title: "Performance Moment - gustav mahler orchestra sri lanka",
  },
  {
    src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/89972.jpg",
    alt: "Concert Performance",
    title: "Concert Performance - gustav mahler orchestra sri lanka",
  },
  {
    src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/8998.jpg",
    alt: "Concert Performance",
    title: "Concert Performance - gustav mahler orchestra sri lanka",
  },
  {
    src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/8999.jpg",
    alt: "Wind Orchestra Performance",
    title: "Orchestra Performance - Colombo Wind Orchestra",
  },
  {
    src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/9001.jpg",
    alt: "Musical Performance",
    title: "Stage Performance - Bank of ceylon London branch 75th anniversary",
  },
  {
    src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/9002.jpg",
    alt: "Flute Solo",
    title: "Candlelight Solo Performance",
  },
  {
    src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/o9003%202.jpg",
    alt: "Concert Moment",
    title: "Candlelight Solo Performance",
  },
  {
    src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/9005.jpg",
    alt: "Stage Performance",
    title: "Pawan Podak Concert",
  },
  {
    src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/9006.jpg",
    alt: "Stage Performance",
    title: "Pawan Podak Concert",
  },
  {
    src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/9007.jpg",
    alt: "Stage Performance",
    title: "Pawan Podak Concert",
  },
];

const Gallery = () => {
  usePageTracking("Gallery");

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const selectedItem =
    selectedIndex !== null ? GALLERY_ITEMS[selectedIndex] ?? null : null;

  // Close lightbox on Escape key and lock body scroll
  useEffect(() => {
    if (selectedIndex === null) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedIndex(null);
      }
    };

    const previousOverflow = document.body.style.overflow;

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedIndex]);

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
              {GALLERY_ITEMS.map((item, index) => (
                <motion.div
                  key={item.src}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-border shadow-sm hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => setSelectedIndex(index)}
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    decoding="async"
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
        {selectedItem && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={selectedItem.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIndex(null)}
          >
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              aria-label="Close image"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <motion.img
              src={selectedItem.src}
              alt={selectedItem.alt}
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