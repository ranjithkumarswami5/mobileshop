import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Twitter, Instagram, Facebook, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { Logo } from './Logo';

export function Footer() {
  const socialLinks = [
    { icon: Twitter, href: '#' },
    { icon: Instagram, href: '#' },
    { icon: Facebook, href: '#' },
  ];

  const quickLinks = [
    { label: 'Home', path: '/' },
    { label: 'Cart', path: '/cart' },
    { label: 'Profile', path: '/profile' },
    { label: 'Referral', path: '/referral' },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-card/50 border-t border-border/20 mt-16"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center md:text-left">
          {/* About Section */}
          <div className="space-y-4 flex flex-col items-center md:items-start lg:col-span-1">
            <Link to="/">
              <Logo className="h-12" />
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs">
              At Devi Sri Mobiles, we specialize in providing chip level mobile repair services with a focus on quality, affordability, and customer satisfaction.
            </p>
             <div className="flex justify-center md:justify-start space-x-4 pt-2">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-primary/10"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg text-foreground">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg text-foreground">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center justify-center md:justify-start gap-3">
                <Phone className="h-4 w-4 text-primary" />
                <a href="tel:+919640393333" className="text-muted-foreground hover:text-primary transition-colors">
                  +91 96403 93333
                </a>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-3">
                <Mail className="h-4 w-4 text-primary" />
                <a href="mailto:devisrimobiles@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
                  devisrimobiles@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Visit Us */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg text-foreground">Visit Us</h4>
            <ul className="space-y-3">
               <li className="flex items-start justify-center md:justify-start gap-3">
                <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                <address className="text-muted-foreground not-italic">
                  Main Road, Ramachandrapuram,
                  <br />
                  Konaseema Dist.
                </address>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-3">
                <Clock className="h-4 w-4 text-primary" />
                <p className="text-muted-foreground">
                  Everyday: 9:00 AM - 10:00 PM
                </p>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/20 mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Devi Sri Mobiles. All Rights Reserved. Crafted by Dualite Alpha.</p>
        </div>
      </div>
    </motion.footer>
  );
}
