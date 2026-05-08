import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, Images } from "lucide-react";
import Footer from "@/components/Footer";
import { usePageTracking } from "@/hooks/usePageTracking";

type GalleryImage = {
  src: string;
  alt: string;
};

type GalleryGroup = {
  topic: string;
  thumbnail: string;
  images: GalleryImage[];
};

const GALLERY_GROUPS: readonly GalleryGroup[] = [
  {
    topic: "Gustav Mahler Orchestra Sri Lanka",
    thumbnail: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/IMG_8993.jpg",
    images: [
      { src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/IMG_8993.jpg", alt: "Flute Performance" },
      { src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis+images/8996.jpg", alt: "Musical Performance" },
      { src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/89972.jpg", alt: "Concert Performance" },
      { src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/8998.jpg", alt: "Concert Performance" },
   
    ],
  },
  {
    topic: "Colombo Wind Orchestra",
    thumbnail: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/8999.jpg",
    images: [
      { src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/8999.jpg", alt: "Wind Orchestra Performance" },
    ],
  },
  {
    topic: "Bank of Ceylon London Branch 75th Anniversary",
    thumbnail: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/9001.jpg",
    images: [
      { src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/9001.jpg", alt: "Stage Performance" },
    ],
  },
  {
    topic: "Candlelight Solo Performance",
    thumbnail: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/9002.jpg",
    images: [
      { src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/9002.jpg", alt: "Flute Solo" },
      { src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/o9003%202.jpg", alt: "Concert Moment" },
    ],
  },
  {
    topic: "Pawan Podak Concert",
    thumbnail: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/9005.jpg",
    images: [
      { src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/9005.jpg", alt: "Stage Performance" },
      { src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/9006.jpg", alt: "Stage Performance" },
      { src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis%20images/9007.jpg", alt: "Stage Performance" },
    ],
  },
  {
    topic: "Miyuru Gee Dahana - Glasgow Concert",
    thumbnail: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis+images/fb1378b6-38e6-4d8a-a2df-b15946afb5e4.JPG",
    images: [
      { src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis+images/fb1378b6-38e6-4d8a-a2df-b15946afb5e4.JPG", alt: "Miyuru Gee Dahana - Glasgow Concert" },
      { src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis+images/IMG_9392.JPG", alt: "Miyuru Gee Dahana - Glasgow Concert" },
      { src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis+images/IMG_9393.JPG", alt: "Miyuru Gee Dahana - Glasgow Concert" },
    ],
  },
  {
    topic: "Hadha Randhi Miyuru Gee Suyamaya - High Wycombe",
    thumbnail: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis+images/IMG_9394.JPG",
    images: [
      { src: "https://geoapp-build-artifacts.s3.eu-west-2.amazonaws.com/Lashis+images/IMG_9394.JPG", alt: "Hadha Randhi Miyuru Gee Suyamaya - High Wycombe" },
    ],
  },
];

const BUCKET = import.meta.env.VITE_S3_BUCKET || "geoapp-build-artifacts";
const REGION = import.meta.env.VITE_S3_REGION || "eu-west-2";

const Gallery = () => {
  usePageTracking("Gallery");

  const [groups, setGroups] = useState<GalleryGroup[]>(GALLERY_GROUPS as GalleryGroup[]);
  const [activeGroup, setActiveGroup] = useState<GalleryGroup | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Load live gallery config from S3, fall back to hardcoded if unavailable
  useEffect(() => {
    const url = `https://${BUCKET}.s3.${REGION}.amazonaws.com/gallery-config.json?t=${Date.now()}`;
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: GalleryGroup[] | null) => { if (data?.length) setGroups(data); })
      .catch(() => {});
  }, []);

  const selectedImage =
    activeGroup && selectedIndex !== null
      ? activeGroup.images[selectedIndex] ?? null
      : null;

  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowRight" && activeGroup) {
        setSelectedIndex((i) =>
          i !== null ? Math.min(i + 1, activeGroup.images.length - 1) : i
        );
      }
      if (e.key === "ArrowLeft") {
        setSelectedIndex((i) => (i !== null ? Math.max(i - 1, 0) : i));
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedIndex, activeGroup]);

  return (
    <div className="min-h-screen pt-16 bg-background">
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">

            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
                Gallery
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto mb-6" />
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                Moments from performances, rehearsals, and musical journey
              </p>
            </div>

            <AnimatePresence mode="wait">
              {/* Topics grid */}
              {!activeGroup && (
                <motion.div
                  key="topics"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {groups.map((group, index) => (
                    <motion.div
                      key={group.topic}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.07 }}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-border shadow-sm hover:shadow-xl transition-all cursor-pointer"
                      onClick={() => setActiveGroup(group)}
                    >
                      <img
                        src={group.thumbnail}
                        alt={group.topic}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {/* Dark overlay always visible at bottom */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Topic label */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white font-playfair text-lg font-semibold leading-snug drop-shadow">
                          {group.topic}
                        </h3>
                        <div className="flex items-center gap-1 mt-1 text-white/70 text-sm">
                          <Images className="w-3.5 h-3.5" />
                          <span>{group.images.length} photo{group.images.length !== 1 ? "s" : ""}</span>
                        </div>
                      </div>

                      {/* Hover ring */}
                      <div className="absolute inset-0 ring-2 ring-primary/0 group-hover:ring-primary/60 rounded-xl transition-all duration-300" />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Topic gallery */}
              {activeGroup && (
                <motion.div
                  key={activeGroup.topic}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35 }}
                >
                  {/* Back button + topic title */}
                  <div className="flex items-center gap-4 mb-10">
                    <button
                      onClick={() => setActiveGroup(null)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-sm font-medium text-foreground/80 hover:text-foreground"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <div>
                      <h2 className="font-playfair text-2xl md:text-3xl font-bold text-foreground">
                        {activeGroup.topic}
                      </h2>
                      <p className="text-sm text-foreground/50 mt-0.5">
                        {activeGroup.images.length} photo{activeGroup.images.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {/* Images grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeGroup.images.map((image, index) => (
                      <motion.div
                        key={image.src}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.06 }}
                        className="group relative aspect-square overflow-hidden rounded-lg border border-border shadow-sm hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => setSelectedIndex(index)}
                      >
                        <img
                          src={image.src}
                          alt={image.alt}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                          <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            View
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={selectedImage.alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIndex(null)}
          >
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-10"
              aria-label="Close image"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Prev arrow */}
            {selectedIndex !== null && selectedIndex > 0 && (
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-10"
                aria-label="Previous image"
                onClick={(e) => { e.stopPropagation(); setSelectedIndex((i) => (i !== null ? i - 1 : i)); }}
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
            )}

            {/* Next arrow */}
            {activeGroup && selectedIndex !== null && selectedIndex < activeGroup.images.length - 1 && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-10"
                aria-label="Next image"
                onClick={(e) => { e.stopPropagation(); setSelectedIndex((i) => (i !== null ? i + 1 : i)); }}
              >
                <ArrowLeft className="w-5 h-5 text-white rotate-180" />
              </button>
            )}

            <motion.img
              key={selectedImage.src}
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="max-w-full max-h-full object-contain rounded-lg"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            />

            {/* Counter */}
            {activeGroup && selectedIndex !== null && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
                {selectedIndex + 1} / {activeGroup.images.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Gallery;
