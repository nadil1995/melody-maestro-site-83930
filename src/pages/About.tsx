import AboutSection from "@/components/About";
import Footer from "@/components/Footer";
import { usePageTracking } from "@/hooks/usePageTracking";
import { useSEO } from "@/hooks/useSEO";

const About = () => {
  usePageTracking("About");
  useSEO({
    title: "About Lashikala Hettiarachchi | Flautist & Composer | LTCL Qualified",
    description:
      "Meet Lashikala Hettiarachchi — LTCL & Visharad qualified flautist and composer based in Croydon, UK. Master's in Music Management, member of Just Flute Orchestra UK and Viraaga Orchestra.",
    path: "/about",
  });

  return (
    <div className="min-h-screen pt-16">
      <AboutSection />
      <Footer />
    </div>
  );
};

export default About;
