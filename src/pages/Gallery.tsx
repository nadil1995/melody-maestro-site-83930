import { useState } from "react";
import Footer from "@/components/Footer";
import heroFlute from "@/assets/hero-flute.jpg";
import musicNotes from "@/assets/music-notes.jpg";

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const galleryItems = [
    {
      src: heroFlute,
      alt: "Concert Flute Performance",
      title: "Concert Performance",
    },
    {
      src: musicNotes,
      alt: "Music Notes and Flute",
      title: "Music Preparation",
    },
    {
      src: heroFlute,
      alt: "Orchestra Performance",
      title: "Orchestra Rehearsal",
    },
    {
      src: musicNotes,
      alt: "Classical Composition",
      title: "Classical Studies",
    },
    {
      src: heroFlute,
      alt: "Solo Recital",
      title: "Solo Recital",
    },
    {
      src: musicNotes,
      alt: "Teaching Session",
      title: "Teaching Session",
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
                <div
                  key={index}
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Gallery item"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Gallery;
