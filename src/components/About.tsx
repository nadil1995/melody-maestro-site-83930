import { Music2, Users, Award } from "lucide-react";
import lashi1 from "@/assets/Lashikala-playing-Indian-flute.jpg";
import lashi2 from "@/assets/Lashikala-playing-western-flute.jpg";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const About = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [80, -80]);

  return (
    <section id="about" className="py-24 bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <motion.div
        className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"
        style={{ y: y1 }}
      />
      <motion.div
        className="absolute bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
        style={{ y: y2 }}
      />

      <div className="container mx-auto px-4 relative z-10" ref={ref}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
              About the Artist
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto" />
          </motion.div>

          <div className="grid md:grid-cols-1 gap-12 items-center mb-16">
            {/* Left column: text */}
            <div className="space-y-6">
              <motion.p
                className="text-lg text-foreground/80 leading-relaxed"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6 }}
              >
                I am a classically trained flautist and composer based in the United Kingdom, dedicated to exploring diverse musical traditions and creating meaningful connections through music.
Education
              </motion.p>
              <motion.p
                className="text-lg text-foreground/80 leading-relaxed"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                I hold a Master's degree in International Music Management from the University for the Creative Arts, UK, and a Bachelor's degree from the University of the Visual and Performing Arts, Sri Lanka. My qualifications include the Licentiate of Trinity College London (LTCL) and Visharad from Bhatkhande Sangeet Vidyapith, Lucknow.
Western Classical Music
              </motion.p>

              <motion.div
                className="flex justify-center md:justify-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8 }}
              >
                <img
                  src={lashi2}
                  alt="Flautist performing on stage"
                  className="rounded-2xl shadow-2xl border border-border w-full max-w-md object-cover hover:scale-105 transition-transform duration-500"
                />
              </motion.div>

              <motion.p
                className="text-lg text-foreground/80 leading-relaxed"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
               Currently, I perform as a member of the Just Flute Orchestra, UK. My career in Sri Lanka includes serving as Principal Flautist for the Gustav Mahler Society and the National Unity Orchestra, as well as performing with the National Symphony Orchestra as a part-time member. I began my orchestral journey with the Colombo Wind Orchestra and the National Youth Orchestra.
Indian Classical Music
              </motion.p>
              <motion.p
                className="text-lg text-foreground/80 leading-relaxed"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
               I have been recognized four times by the National Youth Awards (2012, 2015, 2017, and 2019), receiving first place in the North Indian Classical Instrumental - Flute category. This tradition remains central to my artistic practice.
Light Music & Media
              </motion.p>
              <motion.p
                className="text-lg text-foreground/80 leading-relaxed"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
              I have contributed to Sri Lanka's light music industry, performing as a flautist for television channels including Rupavahini and providing artist backing for various productions. As a member of Viraaga Orchestra I am dedicated to bring Sri Lankan music for British Sri Lankans who lives in UK.
Compositions & Arrangements
              </motion.p>
              <motion.p
                className="text-lg text-foreground/80 leading-relaxed"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
              As a composer, I create works that bridge Eastern and Western musical traditions. My original composition "Ambivalence of Life" blends Indian classical ragas with Western harmony, written for flute, violin, viola, and cello. I have also arranged the famous Sri Lankan song "Me Nagaraya" for four bamboo flutes in SATB formation, celebrating my cultural heritage through creative interpretation.
Research
              </motion.p>
              <motion.p
                className="text-lg text-foreground/80 leading-relaxed"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
              My academic interests have led me to complete two research projects: "Identification and Comparison of Thaats and Church Modes" and "Evaluating Environmental Sustainability Practices in the Live Music Industry in Sri Lanka."
              </motion.p>

              <motion.div
                className="flex justify-center md:justify-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <img
                  src={lashi1}
                  alt="Flautist performing on stage"
                  className="rounded-2xl shadow-2xl border border-border w-full max-w-md object-cover hover:scale-105 transition-transform duration-500"
                />
              </motion.div>

              <motion.p
                className="text-lg text-foreground/80 leading-relaxed"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
My ambition is to share my musical knowledge and contribute to the wider community by creating works that celebrate the unique characteristics of South Asian music while integrating them with Western musical traditions. Through composition, performance, and collaboration, I aim to build bridges between cultures and create meaningful musical experiences that honor both traditions.
              </motion.p>


            </div>

            {/* Right column: image */}

            {/*  */}

          </div>


          {/* Cards below */}
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              className="bg-card p-6 rounded-lg border border-border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-start gap-4">
                <motion.div
                  className="bg-primary/10 p-3 rounded-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Music2 className="w-6 h-6 text-primary" />
                </motion.div>
                <div>
                  <h3 className="font-playfair text-xl font-semibold mb-2">Dual Traditions</h3>
                  <p className="text-muted-foreground">
                    Expert in both Western and Indian classical music performance and pedagogy
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-card p-6 rounded-lg border border-border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-start gap-4">
                <motion.div
                  className="bg-accent/10 p-3 rounded-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Users className="w-6 h-6 text-accent" />
                </motion.div>
                <div>
                  <h3 className="font-playfair text-xl font-semibold mb-2">Orchestra Experience</h3>
                  <p className="text-muted-foreground">
                    Performed with renowned orchestras in diverse concert settings
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-card p-6 rounded-lg border border-border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-start gap-4">
                <motion.div
                  className="bg-secondary/10 p-3 rounded-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Award className="w-6 h-6 text-secondary" />
                </motion.div>
                <div>
                  <h3 className="font-playfair text-xl font-semibold mb-2">Dedicated Teaching</h3>
                  <p className="text-muted-foreground">
                    Committed to nurturing the next generation of musicians with personalized instruction
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;
 