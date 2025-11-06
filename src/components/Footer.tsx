import { Link } from "react-router-dom";
import { Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border/40 bg-background/50 backdrop-blur">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-to-r from-red-600 to-red-700 w-8 h-8 rounded-lg flex items-center justify-center">
                <Youtube className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                YTB Pulse Pro
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              Automate and scale your YouTube presence with our premium platform.
            </p>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link to="/features" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Features</Link></li>
              <li><Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Pricing</Link></li>
              <li><Link to="/compare" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Channel Comparison</Link></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Integrations</a></li>
            </ul>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Documentation</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Tutorials</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Blog</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Community</a></li>
            </ul>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Terms of Service</Link></li>
              <li><a href="mailto:support@ytbpulsepro.com" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Support</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border/40 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} YTB Pulse Pro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;