import Hero from "@/components/Hero";
import Services from "@/components/Services";
import MyWork from "@/components/mywork";
import News from "@/components/News";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { usePageTracking } from "@/hooks/usePageTracking";
import { useCanonical } from "@/hooks/useCanonical";

const Index = () => {
  usePageTracking("Home");
  useCanonical("/");

  return (
    <div className="min-h-screen pt-16">
      <Hero />
      <Services />
      <MyWork />
      {/* <Testimonials /> */}
      <News />
      {/* <Publications /> */}
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;