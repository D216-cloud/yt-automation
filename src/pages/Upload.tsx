import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/GlassCard";
import { LoadingCard } from "@/components/LoadingCard";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload as UploadIcon, 
  Youtube, 
  Calendar, 
  Tag, 
  Eye, 
  Users, 
  ThumbsUp, 
  Play,
  Plus,
  Trash2,
  Clock,
  Target,
  Zap,
  Info,
  AlertCircle,
  X,
  BarChart3
} from "lucide-react";
import { ConnectedChannels } from "@/components/ConnectedChannels";
import { ConnectYouTubeChannel } from "@/components/ConnectYouTubeChannel";
import youtubeService from "@/services/youtubeService";
import { YouTubeChannel } from "@/types/youtube";
import Footer from "@/components/Footer";

const UploadPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [channels, setChannels] = useState<YouTubeChannel[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [schedule, setSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const connectedChannels = await youtubeService.getConnectedChannels();
        setChannels(connectedChannels);
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

    fetchChannels();
  }, [toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type.startsWith("video/")) {
        setFile(selectedFile);
        // Auto-generate title from filename
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a video file",
          variant: "destructive"
        });
      }
    }
  };

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannels(prev => 
      prev.includes(channelId) 
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a video file to upload",
        variant: "destructive"
      });
      return;
    }

    if (selectedChannels.length === 0) {
      toast({
        title: "No channels selected",
        description: "Please select at least one channel to upload to",
        variant: "destructive"
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your video",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);
      
      // In a real implementation, you would upload to each selected channel
      // For now, we'll just show a success message
      toast({
        title: "Upload initiated",
        description: `Your video is being uploaded to ${selectedChannels.length} channel(s)`,
      });
      
      // Reset form
      setFile(null);
      setTitle("");
      setDescription("");
      setTags("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your video",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-background/90">
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                <UploadIcon className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                Upload Video
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">Upload videos to your YouTube channels</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/compare')}
              >
                <Target className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Main Content - Stacked on Mobile, Side-by-Side on Desktop */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column - Video Details */}
            <div className="lg:w-2/3 space-y-6">
              {/* Video Upload Card */}
              <Card className="glass-card border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <Play className="h-5 w-5 text-primary" />
                    Video Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* File Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="video" className="text-base">Video File</Label>
                    <div 
                      className="border-2 border-dashed border-muted rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors bg-muted/30"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Input
                        id="video"
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="video/*"
                      />
                      {file ? (
                        <div className="flex flex-col items-center">
                          <div className="p-2 bg-primary/10 rounded-full mb-3">
                            <Play className="h-8 w-8 text-primary" />
                          </div>
                          <p className="font-medium text-base truncate max-w-xs">{file.name}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFile(null);
                              if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="p-2 bg-muted rounded-full mb-3">
                            <UploadIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <p className="font-medium text-base">Click to select a video</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            MP4, MOV, AVI, or other video formats
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-base">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter a compelling title for your video"
                      className="h-11"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-base">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your video content, include relevant links, and call-to-actions"
                      rows={4}
                    />
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label htmlFor="tags" className="text-base">Tags</Label>
                    <Input
                      id="tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="Enter tags separated by commas"
                      className="h-11"
                    />
                    <div className="flex items-start gap-2 p-3 bg-blue-500/10 rounded-lg">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        Tags help people find your video. Include 5-10 relevant tags for better discoverability.
                      </p>
                    </div>
                  </div>

                  {/* Privacy and Schedule - Stacked on Mobile */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-base">Privacy</Label>
                      <Select value={privacy} onValueChange={setPrivacy}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select privacy" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="unlisted">Unlisted</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-base">Schedule Upload</Label>
                        <Switch checked={schedule} onCheckedChange={setSchedule} />
                      </div>
                      {schedule && (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label htmlFor="scheduleDate" className="text-sm">Date</Label>
                            <Input
                              id="scheduleDate"
                              type="date"
                              value={scheduleDate}
                              onChange={(e) => setScheduleDate(e.target.value)}
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="scheduleTime" className="text-sm">Time</Label>
                            <Input
                              id="scheduleTime"
                              type="time"
                              value={scheduleTime}
                              onChange={(e) => setScheduleTime(e.target.value)}
                              className="h-9"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload Button */}
                  <Button 
                    onClick={handleUpload}
                    disabled={uploading || !file}
                    className="w-full py-5 text-base gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <UploadIcon className="h-4 w-4" />
                        Upload to Selected Channels
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Upload Tips */}
              <Card className="glass-card border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <Zap className="h-5 w-5 text-primary" />
                    Upload Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-2 p-3 bg-blue-500/10 rounded-lg">
                      <div className="p-2 bg-blue-500/20 rounded-lg mt-0.5">
                        <Zap className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Optimize Title</h4>
                        <p className="text-xs text-muted-foreground mt-1">Include keywords near the beginning</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-green-500/10 rounded-lg">
                      <div className="p-2 bg-green-500/20 rounded-lg mt-0.5">
                        <Eye className="h-4 w-4 text-green-500" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Engaging Thumbnail</h4>
                        <p className="text-xs text-muted-foreground mt-1">Use bright colors and clear text</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-purple-500/10 rounded-lg">
                      <div className="p-2 bg-purple-500/20 rounded-lg mt-0.5">
                        <Users className="h-4 w-4 text-purple-500" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Description Length</h4>
                        <p className="text-xs text-muted-foreground mt-1">Aim for 200-300 words</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Channel Selection */}
            <div className="lg:w-1/3 space-y-6">
              {/* Channel Selection Card */}
              <Card className="glass-card border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2 text-lg md:text-xl">
                    <div className="flex items-center gap-2">
                      <Youtube className="h-5 w-5 text-primary" />
                      Select Channels
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {selectedChannels.length} selected
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <LoadingCard key={i} />
                      ))}
                    </div>
                  ) : channels.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                        <Youtube className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-medium mb-2">No channels connected</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Connect a YouTube channel to start uploading
                      </p>
                      <ConnectYouTubeChannel onChannelConnected={() => window.location.reload()} />
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                      {channels.map((channel) => (
                        <div 
                          key={channel._id} 
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedChannels.includes(channel.channelId) 
                              ? 'bg-primary/10 border-primary shadow-sm' 
                              : 'bg-secondary/50 border-muted hover:bg-secondary'
                          }`}
                          onClick={() => handleChannelSelect(channel.channelId)}
                        >
                          {channel.thumbnailUrl ? (
                            <img 
                              src={channel.thumbnailUrl} 
                              alt={channel.title} 
                              className="w-10 h-10 rounded-full object-cover border border-primary/20"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                              <Youtube className="h-4 w-4 text-primary" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{channel.title}</p>
                            <div className="flex gap-2 mt-1">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Users className="h-3 w-3" />
                                <span>{formatNumber(channel.subscriberCount)} subs</span>
                              </div>
                            </div>
                          </div>
                          {selectedChannels.includes(channel.channelId) && (
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Selected Channels Summary */}
              {selectedChannels.length > 0 && (
                <Card className="glass-card border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                      <Play className="h-5 w-5 text-primary" />
                      Upload Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                      {channels
                        .filter(channel => selectedChannels.includes(channel.channelId))
                        .map(channel => (
                          <div key={channel._id} className="flex items-center justify-between p-2 rounded-lg bg-primary/5">
                            <div className="flex items-center gap-2">
                              {channel.thumbnailUrl ? (
                                <img 
                                  src={channel.thumbnailUrl} 
                                  alt={channel.title} 
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Youtube className="h-3 w-3 text-primary" />
                                </div>
                              )}
                              <span className="text-sm font-medium truncate max-w-[120px]">{channel.title}</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {formatNumber(channel.subscriberCount)} subs
                            </Badge>
                          </div>
                        ))
                      }
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              <Card className="glass-card border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Channel Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-blue-500/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Total Views</span>
                      </div>
                      <span className="font-bold text-sm">1.2M</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-purple-500/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">Subscribers</span>
                      </div>
                      <span className="font-bold text-sm">45.3K</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-green-500/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Avg. Engagement</span>
                      </div>
                      <span className="font-bold text-sm">8.7%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UploadPage;