import { Lock, ArrowRight, Zap, Lightbulb, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Connect = () => {
  const { connectYouTubeChannel, user } = useAuth();
  const navigate = useNavigate();
  const [isTorchOn, setIsTorchOn] = useState(false);

  const handleConnect = async () => {
    // Kick off YouTube OAuth (handled by backend)
    await connectYouTubeChannel();
  };

  const handleSkip = () => {
    // Turn on the torch when skipping
    setIsTorchOn(true);
    // Navigate after a short delay to show the torch effect
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-[80vh] flex items-center bg-gradient-to-br from-background to-background/90 overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column: text + CTAs */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-sm font-medium mb-4">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Secure Connection</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight text-foreground">
              Unlock
              <br />
              Personalized
              <br />
              Insights
            </h1>
            <p className="text-muted-foreground mb-4 text-lg">
              Let's kickstart your journey with tailored data insights.
            </p>
            <p className="text-muted-foreground mb-8 text-lg">
              Connect your YouTube channel to get personalized analytics and strategic recommendations for exponential growth.
            </p>

            {/* Benefits section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Growth Tools</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Audience Insights</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Secure Access</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
              <Button
                variant="default"
                className="flex items-center justify-center bg-white text-black px-6 py-4 shadow-lg rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                onClick={handleConnect}
                aria-label="Connect your YouTube channel"
              >
                {/* Inline Google G to ensure it shows reliably */}
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white mr-3">
                  <svg viewBox="0 0 48 48" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.07 1.52 7.46 2.78l5.45-5.45C33.95 4 29.3 2 24 2 14.98 2 7.4 7.79 4.1 15.46l6.34 4.93C12.77 14.1 18.77 9.5 24 9.5z"/>
                    <path fill="#34A853" d="M46.5 24c0-1.6-.14-3.12-.41-4.59H24v8.7h12.7c-.55 3.1-2.6 5.73-5.56 7.41l8.46 6.57C44.6 37.3 46.5 31.05 46.5 24z"/>
                    <path fill="#4A90E2" d="M10.44 29.39A14.98 14.98 0 0 1 12 24c0-1.3.18-2.56.51-3.75L6.17 15.31A23.98 23.98 0 0 0 2 24c0 3.75.9 7.3 2.5 10.49l5.94-5.1z"/>
                    <path fill="#FBBC05" d="M24 46c6.5 0 11.97-2.16 15.96-5.87l-8.46-6.57C29.93 34.39 27.2 35.5 24 35.5c-5.23 0-11.23-4.6-13.56-11.39l-6.34 4.93C7.4 40.21 14.98 46 24 46z"/>
                  </svg>
                </span>
                <span className="mr-3 font-semibold">Connect Your Channel</span>
                <ArrowRight className="h-5 w-5 opacity-70" />
              </Button>

              <Button 
                variant="outline" 
                onClick={handleSkip} 
                className="px-6 py-4 rounded-full border-2 border-primary hover:bg-primary/10 flex items-center gap-2 transition-all duration-300 hover:scale-105"
              >
                <Zap className="h-5 w-5" />
                Skip For Now
              </Button>
            </div>
          </div>

          {/* Right column: graphic with torch effect */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Torch beam effect - only visible when torch is on */}
              {isTorchOn && (
                <>
                  {/* Main beam */}
                  <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-32 h-64 bg-gradient-to-t from-yellow-300/80 via-yellow-400/60 to-transparent rounded-full blur-2xl animate-pulse"></div>
                  {/* Secondary glow */}
                  <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-24 h-56 bg-gradient-to-t from-orange-400/60 to-transparent rounded-full blur-3xl animate-ping"></div>
                </>
              )}
              
              {/* Torch icon at the bottom */}
              <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 z-10">
                <Button 
                  variant="default"
                  size="lg"
                  className={`rounded-full p-5 shadow-2xl transition-all duration-300 transform ${
                    isTorchOn 
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 scale-110 ring-4 ring-yellow-400/50' 
                      : 'bg-gradient-to-br from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800'
                  }`}
                  onClick={() => setIsTorchOn(!isTorchOn)}
                >
                  <Lightbulb className={`h-7 w-7 transition-colors duration-300 ${isTorchOn ? 'text-yellow-900' : 'text-yellow-300'}`} />
                </Button>
                <div className="text-center mt-3 text-sm text-muted-foreground font-medium">
                  Click to {isTorchOn ? 'turn off' : 'turn on'} torch
                </div>
              </div>
              
              {/* Main circle with lock */}
              <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-full bg-gradient-to-br from-background to-muted/20 border-2 border-primary/30 flex items-center justify-center shadow-2xl">
                {/* Torch light effect on the lock - only when torch is on */}
                {isTorchOn && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-gradient-radial from-yellow-400/40 via-orange-400/20 to-transparent blur-lg animate-pulse"></div>
                    <div className="absolute inset-0 rounded-full bg-yellow-300/30 blur-3xl animate-ping"></div>
                  </>
                )}
                
                <div className="w-56 h-56 md:w-72 md:h-72 rounded-full bg-gradient-to-br from-muted to-muted/80 flex items-center justify-center shadow-xl relative overflow-hidden border border-primary/20">
                  {/* Lock icon with glow effect when torch is on */}
                  <Lock 
                    className={`transition-all duration-700 ${
                      isTorchOn 
                        ? 'text-yellow-500 scale-125 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]' 
                        : 'text-primary'
                    }`} 
                    size={72} 
                  />
                  
                  {/* Unlock message that appears when torch is on */}
                  {isTorchOn && (
                    <div className="absolute -bottom-10 text-center animate-bounce">
                      <p className="text-lg font-bold text-yellow-500 drop-shadow-[0_0_5px_rgba(234,179,8,0.8)]">
                        Unlock First!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connect;