import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const { checkAuthStatus } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
  // Check authentication status after Google OAuth redirect
  await checkAuthStatus();
  // After a successful login, send users to the Connect flow so they can attach their YouTube channel
  navigate('/connect');
      } catch (error) {
        console.error('Error handling Google OAuth callback:', error);
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate, checkAuthStatus]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Processing Google Login...</h2>
        <p>Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
};

export default GoogleCallback;