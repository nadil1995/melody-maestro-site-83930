import AboutSection from "@/components/About";
import Footer from "@/components/Footer";
import { usePageTracking } from "@/hooks/usePageTracking";

const About = () => {
  usePageTracking("About");

  return (
    <div className="min-h-screen pt-16">
      <AboutSection />
      <Footer />
    </div>
  );
};

export default About;
