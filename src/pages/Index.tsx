import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Footer from "@/components/Footer";
import { ConnectYouTubeChannel } from "@/components/ConnectYouTubeChannel";
import { 
  Chrome, 
  Upload, 
  Youtube, 
  Zap, 
  BarChart3, 
  Clock, 
  Play,
  Users,
  TrendingUp,
  ShieldCheck,
  Smartphone,
  ArrowRight,
  Sparkles,
  Rocket,
  Target,
  ChevronDown,
  ChevronUp,
  User,
  CheckCircle
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Handle scroll to show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll to section function
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleUploadClick = () => {
    if (user) {
      navigate('/upload');
    } else {
      navigate('/auth');
    }
  };

  const features = [
    {
      icon: <Upload className="h-8 w-8 text-primary" />,
      title: "Single Upload",
      description: "Upload one video to any channel with full metadata control"
    },
    {
      icon: <Zap className="h-8 w-8 text-accent" />,
      title: "Bulk Operations",
      description: "Upload multiple videos to one or many channels simultaneously"
    },
    {
      icon: <Youtube className="h-8 w-8 text-primary" />,
      title: "Multi-Channel",
      description: "Connect and manage multiple YouTube channels from one dashboard"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-accent" />,
      title: "Real-Time Analytics",
      description: "Track subscribers, views, and engagement across all channels"
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: "Automated Scheduling",
      description: "Schedule uploads in advance and automate your content calendar"
    },
    {
      icon: <Smartphone className="h-8 w-8 text-accent" />,
      title: "Mobile-First Design",
      description: "Beautiful, responsive interface that works on any device"
    }
  ];

  const benefits = [
    {
      icon: <TrendingUp className="h-6 w-6 text-green-500" />,
      title: "Grow Faster",
      description: "Automate repetitive tasks and focus on creating great content"
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-blue-500" />,
      title: "Safe & Secure",
      description: "Enterprise-grade security to protect your YouTube accounts"
    },
    {
      icon: <Users className="h-6 w-6 text-purple-500" />,
      title: "Community Support",
      description: "Join thousands of creators growing their channels"
    }
  ];

  const steps = [
    {
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
      title: "Connect Your Channel",
      description: "Link your YouTube account in seconds with our secure OAuth integration"
    },
    {
      icon: <Upload className="h-8 w-8 text-primary" />,
      title: "Upload Content",
      description: "Upload videos to multiple channels simultaneously with one click"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      title: "Analyze Performance",
      description: "Track metrics and get insights to grow your audience faster"
    }
  ];

  const testimonials = [
    {
      name: "Alex Johnson",
      role: "Tech Review Channel",
      content: "YTB Pulse Pro helped me grow my channel from 1K to 50K subscribers in just 6 months!",
      avatar: "AJ"
    },
    {
      name: "Sarah Williams",
      role: "Cooking Channel",
      content: "The scheduling feature saves me hours every week. I can plan content for the entire month.",
      avatar: "SW"
    },
    {
      name: "Mike Chen",
      role: "Gaming Channel",
      content: "Managing 3 channels used to be a nightmare. Now it's seamless with this platform.",
      avatar: "MC"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90">
      {/* User Section - Fixed position */}
      <div className="fixed top-4 right-4 z-50">
        {user && (
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
          >
            <User className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button 
            variant="hero" 
            size="icon"
            onClick={scrollToTop}
            className="rounded-full shadow-lg"
          >
            <ChevronUp className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-16 md:py-0">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/95 to-background" />
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              <span>New: Automated Channel Growth Tools</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                YouTube Automation
              </span>
              <br />
              <span className="text-foreground">
                Made Simple
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload to multiple channels, automate your workflow, and scale your YouTube presence with our premium platform
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              {!user ? (
                <>
                  <Button 
                    variant="hero" 
                    size="lg"
                    onClick={() => navigate('/auth')}
                    className="w-full sm:w-auto group"
                  >
                    <Chrome className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                    Login with Google
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="lg"
                    onClick={handleUploadClick}
                    className="w-full sm:w-auto"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    View Demo
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="hero" 
                    size="lg"
                    onClick={() => navigate('/dashboard')}
                    className="w-full sm:w-auto"
                  >
                    Go to Dashboard
                  </Button>
                  <ConnectYouTubeChannel />
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-background/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started with YouTube automation in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 glass-card-enhanced"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to automate and scale your YouTube operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <GlassCard 
                key={index}
                title={feature.title} 
                description={feature.description}
                className="glass-card-enhanced hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="pt-4">
                  <div className="p-4 bg-primary/10 rounded-lg inline-block">
                    {feature.icon}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-background/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                Why Choose Us
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Trusted by thousands of creators to grow their YouTube channels
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 glass-card-enhanced"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    {benefit.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                Creator Success Stories
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hear from creators who have transformed their YouTube presence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <GlassCard 
                key={index}
                className="glass-card-enhanced"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-bold text-primary">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-muted-foreground italic">"{testimonial.content}"</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-red-600/10 to-red-700/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center p-8 md:p-12 rounded-2xl bg-gradient-to-br from-background/40 to-background/20 border border-glass-border/50 backdrop-blur-xl glass-card-enhanced">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                Ready to Scale Your YouTube?
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of creators automating their YouTube workflow
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="hero" 
                size="lg"
                onClick={() => navigate('/auth')}
                className="group w-full sm:w-auto"
              >
                <Rocket className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                Get Started Now
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/compare')}
                className="w-full sm:w-auto"
              >
                Compare Channels
                <Target className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
