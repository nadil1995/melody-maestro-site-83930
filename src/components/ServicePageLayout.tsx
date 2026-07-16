import { Link } from "react-router-dom";
import { Check, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "@/components/Footer";

export interface ServicePageProps {
  heading: string;
  subheading: string;
  intro: string[];
  featureGroups: { title: string; items: string[] }[];
  areas: string;
  faqs: { question: string; answer: string }[];
  ctaText: string;
  related: { name: string; path: string }[];
}

const ServicePageLayout = ({
  heading,
  subheading,
  intro,
  featureGroups,
  areas,
  faqs,
  ctaText,
  related,
}: ServicePageProps) => (
  <div className="min-h-screen pt-16 bg-background">
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
              {heading}
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto mb-6" />
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">{subheading}</p>
          </div>

          <div className="space-y-4 mb-12 text-foreground/80 leading-relaxed">
            {intro.filter((p) => p.trim()).map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {featureGroups.map((group, gi) => (
              <Card key={gi} className="border-border">
                <CardHeader>
                  <CardTitle className="font-playfair text-xl">{group.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {group.items.filter((item) => item.trim()).map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                        <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex items-center gap-3 bg-muted/50 border border-border rounded-lg p-4 mb-12 text-sm text-foreground/80">
            <MapPin className="w-5 h-5 text-primary shrink-0" />
            <span>{areas}</span>
          </div>

          <div className="mb-12">
            <h2 className="font-playfair text-2xl font-bold text-foreground mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqs.filter((f) => f.question.trim()).map((faq, i) => (
                <div key={i}>
                  <h3 className="font-semibold text-foreground mb-1">{faq.question}</h3>
                  <p className="text-sm text-foreground/70">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-lg p-8 text-center mb-12">
            <p className="text-lg text-foreground/80 mb-6">{ctaText}</p>
            <Button asChild size="lg">
              <Link to="/contact">Book a Lesson / Enquire</Link>
            </Button>
          </div>

          <div className="text-sm text-foreground/70">
            <span className="font-semibold text-foreground">Related services: </span>
            {related.map((r, i) => (
              <span key={r.path}>
                {i > 0 && " · "}
                <Link to={r.path} className="text-primary hover:text-accent transition-colors">
                  {r.name}
                </Link>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
    <Footer />
  </div>
);

export default ServicePageLayout;
