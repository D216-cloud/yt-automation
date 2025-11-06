import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Youtube, Link as LinkIcon, Hash, Info } from "lucide-react";
import youtubeService from "@/services/youtubeService";
import { useAuth } from "@/contexts/AuthContext";

interface ConnectYouTubeChannelProps {
  onChannelConnected?: () => void;
}

export function ConnectYouTubeChannel({ onChannelConnected }: ConnectYouTubeChannelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [channelId, setChannelId] = useState("");
  const [channelUrl, setChannelUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [useUrl, setUseUrl] = useState(true); // Default to URL input
  const { toast } = useToast();
  const { user } = useAuth();

  // Extract channel ID from YouTube URL
  const extractChannelId = (url: string): string | null => {
    try {
      const parsedUrl = new URL(url);
      
      // Handle different YouTube URL formats
      if (parsedUrl.hostname === "www.youtube.com" || parsedUrl.hostname === "youtube.com") {
        // Channel URL: https://www.youtube.com/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw
        const channelMatch = parsedUrl.pathname.match(/\/channel\/([^/]+)/);
        if (channelMatch) {
          return channelMatch[1];
        }
        
        // Custom URL: https://www.youtube.com/@username
        const customMatch = parsedUrl.pathname.match(/\/@([^/]+)/);
        if (customMatch) {
          return customMatch[1];
        }
      } else if (parsedUrl.hostname === "youtu.be") {
        // Short URL: https://youtu.be/videoId
        return parsedUrl.pathname.substring(1);
      }
      
      return null;
    } catch (error) {
      return null;
    }
  };

  const handleConnect = async () => {
    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in with Google first to connect your YouTube channel.",
        variant: "destructive"
      });
      setIsOpen(false);
      return;
    }

    let idToUse = channelId;
    
    if (useUrl) {
      if (!channelUrl.trim()) {
        toast({
          title: "Error",
          description: "Please enter a YouTube channel URL",
          variant: "destructive"
        });
        return;
      }
      
      const extractedId = extractChannelId(channelUrl);
      if (!extractedId) {
        toast({
          title: "Error",
          description: "Invalid YouTube URL. Please enter a valid channel URL.",
          variant: "destructive"
        });
        return;
      }
      
      idToUse = extractedId;
    } else {
      if (!channelId.trim()) {
        toast({
          title: "Error",
          description: "Please enter a YouTube channel ID",
          variant: "destructive"
        });
        return;
      }
    }

    try {
      setIsLoading(true);
      await youtubeService.connectChannel(idToUse);
      
      toast({
        title: "Success",
        description: "YouTube channel connected successfully!"
      });
      
      setIsOpen(false);
      setChannelId("");
      setChannelUrl("");
      onChannelConnected?.();
    } catch (error) {
      console.error("Error connecting channel:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to connect YouTube channel",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="hero" className="gap-2">
          <Youtube className="h-4 w-4" />
          Connect YouTube Channel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Youtube className="h-6 w-6 text-red-500" />
            </div>
            Connect YouTube Channel
          </DialogTitle>
          <DialogDescription>
            Connect your YouTube channel to access analytics and manage your content directly from this dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex items-center justify-center p-6 bg-muted/50 rounded-xl">
            <Youtube className="h-16 w-16 text-red-500" />
          </div>
          
          {/* Toggle between URL and ID input */}
          <div className="flex space-x-3">
            <Button 
              variant={useUrl ? "default" : "outline"} 
              onClick={() => setUseUrl(true)}
              className="flex-1 gap-2"
              size="lg"
            >
              <LinkIcon className="h-4 w-4" />
              Use URL
            </Button>
            <Button 
              variant={!useUrl ? "default" : "outline"} 
              onClick={() => {setUseUrl(false); setChannelId("");}}
              className="flex-1 gap-2"
              size="lg"
            >
              <Hash className="h-4 w-4" />
              Use ID
            </Button>
          </div>
          
          {useUrl ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="channelUrl" className="text-base font-medium">
                  Channel URL
                </Label>
                <Input
                  id="channelUrl"
                  value={channelUrl}
                  onChange={(e) => setChannelUrl(e.target.value)}
                  placeholder="https://www.youtube.com/@username"
                  className="h-12 text-base"
                />
              </div>
              <div className="flex items-start gap-2 p-3 bg-blue-500/10 rounded-lg">
                <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Enter your channel URL (e.g., https://www.youtube.com/@username or https://www.youtube.com/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw)
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="channelId" className="text-base font-medium">
                  Channel ID
                </Label>
                <Input
                  id="channelId"
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  placeholder="UC_x5XG1OV2P6uZZ5FSM9Ttw"
                  className="h-12 text-base"
                />
              </div>
              <div className="flex items-start gap-2 p-3 bg-blue-500/10 rounded-lg">
                <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Enter your channel ID (starts with UC_). You can find this in your YouTube channel settings.
                </p>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="gap-3 sm:gap-0">
          <Button variant="outline" onClick={() => setIsOpen(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleConnect} disabled={isLoading} className="w-full sm:w-auto gap-2">
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Connecting...
              </>
            ) : (
              <>
                <Youtube className="h-4 w-4" />
                Connect Channel
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}