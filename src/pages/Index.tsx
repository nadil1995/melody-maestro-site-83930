import Hero from "@/components/Hero";
import Services from "@/components/Services";
import MyWork from "@/components/mywork";
import News from "@/components/News";
import Publications from "@/components/Publications";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { usePageTracking } from "@/hooks/usePageTracking";

const Index = () => {
  usePageTracking("Home");

  return (
    <div className="min-h-screen pt-16">
      <Hero />
      <Services />
      <MyWork />
      <News />
      {/* <Publications /> */}
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;