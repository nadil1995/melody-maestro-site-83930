import { motion } from "framer-motion";
import { Play, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
}

interface MyWorkProps {
  videos?: Video[];
}

const MyWork = ({ videos = [] }: MyWorkProps) => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  // Default videos if none provided
  const defaultVideos: Video[] = [
    {
      id: "AUU_BHV8Ybs",
      title: "Tambourin - François-Joseph Gossec - ලශිකලා හෙට්ටිආරච්චි",
      description: "Classical flute performance of Tambourin by François-Joseph Gossec",
    },
    {
      id: "pLrLe7IcKe8",
      title: "Me Nagaraya SATB Flute Cover by Lflauto",
      description: "Flute cover of Me Nagaraya in SATB arrangement",
    },
    {
      id: "DEQcQHEFjlM",
      title: "Raag Brindavani",
      description: "indian flute performance of Raag Brindavani",
    },
  ];

  const displayVideos = videos.length > 0 ? videos : defaultVideos;

  const getYouTubeThumbnail = (videoId: string) => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const getYouTubeEmbedUrl = (videoId: string) => {
    return `https://www.youtube.com/embed/${videoId}`;
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
              My Work
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Watch my performances and musical journey
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto mt-6" />
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayVideos.map((video, index) => (
              <motion.div
                key={video.id + index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="border-border hover:shadow-xl transition-all duration-300 group overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={video.thumbnail || getYouTubeThumbnail(video.id)}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                        <button
                          onClick={() => setSelectedVideo(video)}
                          className="w-16 h-16 bg-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                          aria-label={`Play ${video.title}`}
                        >
                          <Play className="w-8 h-8 text-primary-foreground ml-1" fill="currentColor" />
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-playfair text-xl font-semibold text-foreground mb-2 line-clamp-2">
                        {video.title}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {video.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Video Modal */}
          {selectedVideo && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVideo(null)}
            >
              <motion.div
                className="relative w-full max-w-5xl"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="absolute -top-12 right-0 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                  aria-label="Close video"
                >
                  <X className="w-6 h-6 text-white" />
                </button>

                <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl bg-black">
                  <iframe
                    src={`${getYouTubeEmbedUrl(selectedVideo.id)}?autoplay=1`}
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>

                <div className="mt-4 text-center">
                  <h3 className="font-playfair text-xl md:text-2xl font-bold text-white mb-2">
                    {selectedVideo.title}
                  </h3>
                  <p className="text-white/80 text-sm md:text-base">
                    {selectedVideo.description}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MyWork;
