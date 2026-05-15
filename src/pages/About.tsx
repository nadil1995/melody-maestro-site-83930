import AboutSection from "@/components/About";
import Footer from "@/components/Footer";
import { usePageTracking } from "@/hooks/usePageTracking";
import { useCanonical } from "@/hooks/useCanonical";

const About = () => {
  usePageTracking("About");
  useCanonical("/about");

  return (
    <div className="min-h-screen pt-16">
      <AboutSection />
      <Footer />
    </div>
  );
};

export default About;
