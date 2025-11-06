import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Youtube, RefreshCw, Upload, Calendar, Users, Video, Eye, Trash2 } from "lucide-react";
import youtubeService from "@/services/youtubeService";
import { YouTubeChannel } from "@/types/youtube";

interface ConnectedChannelsProps {
  onChannelsUpdate?: (channels: YouTubeChannel[]) => void;
}

export const ConnectedChannels = ({ onChannelsUpdate }: ConnectedChannelsProps) => {
  const [channels, setChannels] = useState<YouTubeChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const fetchedChannels = await youtubeService.getConnectedChannels();
      setChannels(fetchedChannels);
      onChannelsUpdate?.(fetchedChannels);
    } catch (error) {
      console.error("Error fetching channels:", error);
      toast({
        title: "Error",
        description: "Failed to fetch connected channels",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchChannels();
    setRefreshing(false);
  };

  const handleDisconnect = async (channelId: string, channelTitle: string) => {
    try {
      await youtubeService.disconnectChannel(channelId);
      toast({
        title: "Success",
        description: `Disconnected ${channelTitle}`,
      });
      // Refresh the channels list
      await fetchChannels();
    } catch (error) {
      console.error("Error disconnecting channel:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect channel",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <span className="text-muted-foreground">Loading connected channels...</span>
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="text-center p-4">
        <Youtube className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground mb-2">No channels connected</p>
        <p className="text-sm text-muted-foreground mb-4">
          Connect a YouTube channel to start uploading videos
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Connected Channels ({channels.length})</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      <div className="space-y-3">
        {channels.map((channel) => (
          <div 
            key={channel._id} 
            className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
          >
            {channel.thumbnailUrl ? (
              <img 
                src={channel.thumbnailUrl} 
                alt={channel.title} 
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Youtube className="h-6 w-6 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{channel.title}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>{channel.subscriberCount.toLocaleString()} subs</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Video className="h-3 w-3" />
                  <span>{channel.videoCount} videos</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="h-3 w-3" />
                  <span>{channel.viewCount.toLocaleString()} views</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Calendar className="h-3 w-3" />
                <span>
                  Joined {new Date(channel.publishedAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => handleDisconnect(channel.channelId, channel.title)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};