import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Chrome, ShieldCheck, Zap, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Footer from "@/components/Footer";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      navigate("/dashboard");
    } catch (error) {
      console.error("Google sign-in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-background/90">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-xl flex items-center justify-center mb-4">
              <Chrome className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              YTB Pulse Pro
            </h1>
            <p className="text-muted-foreground mt-2">
              Professional YouTube Management Platform
            </p>
          </div>

          <Card className="glass-card border-0 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to manage your YouTube channels and automate your workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="hero" 
                className="w-full py-6 text-lg" 
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                ) : (
                  <Chrome className="mr-2 h-5 w-5" />
                )}
                Continue with Google
              </Button>
              
              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="flex items-center">
                  <div className="flex-1 border-t border-muted"></div>
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  Trusted by creators
                </div>
                <div className="flex items-center">
                  <div className="flex-1 border-t border-muted"></div>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">Secure</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">Fast</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">Reliable</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <p className="text-xs text-center text-muted-foreground">
                By signing in, you agree to our <Link to="/terms" className="underline hover:text-foreground">Terms of Service</Link> and <Link to="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
              </p>
            </CardFooter>
          </Card>
          
          <div className="text-center text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;