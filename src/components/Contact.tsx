import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, useScroll, useTransform } from "framer-motion";
import emailjs from '@emailjs/browser';
import { useAnalytics } from "@/contexts/AnalyticsContext";

const Contact = () => {
  const { toast } = useToast();
  const { trackFormSubmission, trackUserAction } = useAnalytics();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-50, 50]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // EmailJS configuration - You need to replace these with your actual EmailJS credentials
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID';
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID';
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY';

      // Send email using EmailJS
      await emailjs.send(
        serviceId,
        templateId,
        // {
        //   from_name: formData.name,
        //   from_email: formData.email,
        //   phone: formData.phone || 'Not provided',
        //   message: formData.message,
        //   to_email: 'madhuhettiarachchi4@gmail.com',
        // },
        {title: "New Contact Form Submission from " + formData.name,
name: formData.name,
message: formData.email  +  formData.phone + formData.message,
email: formData.email,
phone: formData.phone,

},

        publicKey
      );



      // Track form submission in analytics
      trackFormSubmission({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
      });

      trackUserAction('Form Submitted', 'Contact', `${formData.name} - ${formData.email}`);

      toast({
        title: "Message Sent!",
        description: "Thank you for your interest. I'll get back to you soon.",
      });

      // Reset form
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      console.error('Email sending failed:', error);
      toast({
        title: "Failed to Send",
        description: "There was an error sending your message. Please try again or email directly at madhuhettiarachchi4@gmail.com",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-background relative overflow-hidden" ref={ref}>
      {/* Decorative parallax background elements */}
      <motion.div
        className="absolute top-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
        style={{ y: y1 }}
      />
      <motion.div
        className="absolute bottom-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"
        style={{ y: y2 }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4">
              Get in Touch
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ready to begin your musical journey? Contact me to schedule a lesson or discuss your goals
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto mt-6" />
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="font-playfair text-2xl font-bold mb-6">Send a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Name *
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your full name"
                    required
                    className="bg-card"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                    required
                    className="bg-card"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="bg-card"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell me about your musical background and goals..."
                    rows={5}
                    required
                    className="bg-card"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </motion.div>

            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="font-playfair text-2xl font-bold mb-6">Contact Information</h3>

              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="border-border hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Email</h4>
                        <p className="text-muted-foreground">madhuhettiarachchi4@gmail.com </p>
                      </div>
                    </div>

                    {/* <div className="flex items-start gap-4 mb-6">
                    <div className="bg-accent/10 p-3 rounded-lg">
                      <Phone className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Phone</h4>
                      <p className="text-muted-foreground">+44 7424 912 990</p>
                    </div>
                  </div> */}

                    <div className="flex items-start gap-4">
                      <div className="bg-secondary/10 p-3 rounded-lg">
                        <MapPin className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Location</h4>
                        <p className="text-muted-foreground">Serving Croydon, London, Surrey and surrounding areas. Online lessons available worldwide</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="border-border bg-muted/50 hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <h4 className="font-playfair text-xl font-bold mb-3">Lesson Hours</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monday - Friday</span>
                        <span className="font-medium">4:00 PM - 8:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Saturday</span>
                        <span className="font-medium">10:00 AM - 4:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sunday</span>
                        <span className="font-medium">By Appointment</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;