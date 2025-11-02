import { Music, Facebook, Instagram, Youtube, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Music className="w-6 h-6 text-accent" />
                <span className="font-playfair text-xl font-bold">Professional Flutist</span>
              </div>
              <p className="text-secondary-foreground/80 text-sm">
                Bringing the beauty of Western and Indian classical music to students and audiences worldwide.
              </p>
            </div>

            <div>
              <h3 className="font-playfair text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#about" className="text-secondary-foreground/80 hover:text-accent transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#services" className="text-secondary-foreground/80 hover:text-accent transition-colors">
                    Services
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-secondary-foreground/80 hover:text-accent transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-playfair text-lg font-bold mb-4">Services</h3>
              <ul className="space-y-2 text-sm text-secondary-foreground/80">
                <li>Flute Lessons</li>
                <li>Music Theory</li>
                <li>Performance Coaching</li>
                <li>Group Workshops</li>
              </ul>
            </div>

            <div>
              <h3 className="font-playfair text-lg font-bold mb-4">Connect</h3>
              <div className="flex gap-4">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-secondary-foreground/80 hover:text-accent transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-secondary-foreground/80 hover:text-accent transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-secondary-foreground/80 hover:text-accent transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="w-5 h-5" />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-secondary-foreground/80 hover:text-accent transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-secondary-foreground/80 hover:text-accent transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-secondary-foreground/20 pt-8 text-center text-sm text-secondary-foreground/60">
            <p>&copy; {new Date().getFullYear()} Professional Flutist. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;