import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GlassCard } from "@/components/GlassCard";
import { LoadingCard } from "@/components/LoadingCard";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Youtube, 
  Upload, 
  BarChart3, 
  Users, 
  Eye, 
  ThumbsUp, 
  MessageCircle, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  ArrowRight,
  Plus,
  ExternalLink,
  Play,
  Clock,
  Award,
  Settings,
  Bell,
  Search,
  Filter,
  RefreshCw,
  Star,
  Heart,
  Share2,
  Download,
  Edit,
  Trash2,
  MoreVertical,
  ChevronRight,
  Activity,
  Flame,
  Globe,
  Smartphone,
  Video,
  DollarSign,
  Shield,
  Crown,
  Sparkles,
  Timer,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Info
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ConnectedChannels } from "@/components/ConnectedChannels";
import { ConnectYouTubeChannel } from "@/components/ConnectYouTubeChannel";
import youtubeService from "@/services/youtubeService";
import { YouTubeChannel, YouTubeVideo } from "@/types/youtube";
import Footer from "@/components/Footer";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [channels, setChannels] = useState<YouTubeChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentVideos, setRecentVideos] = useState<YouTubeVideo[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'success', message: 'Channel analytics updated', time: '2 min ago' },
    { id: 2, type: 'info', message: 'New feature: Video scheduler available', time: '1 hour ago' },
    { id: 3, type: 'warning', message: 'Upload quota: 80% used', time: '3 hours ago' }
  ]);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalSubscribers: 0,
    totalVideos: 0,
    avgEngagement: 0,
    monthlyGrowth: 0,
    watchTime: 0,
    revenue: 0,
    topPerformingChannel: null as YouTubeChannel | null
  });

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const connectedChannels = await youtubeService.getConnectedChannels();
        setChannels(connectedChannels);
        
        // Fetch recent videos from all channels
        const allVideos: YouTubeVideo[] = [];
        for (const channel of connectedChannels) {
          try {
            const videos = await youtubeService.getChannelVideos(channel.channelId, 10);
            allVideos.push(...videos);
          } catch (error) {
            console.error(`Error fetching videos for channel ${channel.channelId}:`, error);
          }
        }
        
        // Sort by publish date and take the most recent
        const sortedVideos = allVideos.sort((a, b) => 
          new Date(b.snippet.publishedAt).getTime() - new Date(a.snippet.publishedAt).getTime()
        );
        setRecentVideos(sortedVideos.slice(0, 5));
        
        // Calculate comprehensive stats
        let views = 0;
        let subscribers = 0;
        let videos = 0;
        let totalEngagement = 0;
        let topChannel = connectedChannels[0];
        
        connectedChannels.forEach(channel => {
          views += channel.viewCount;
          subscribers += channel.subscriberCount;
          videos += channel.videoCount;
          
          // Find top performing channel
          if (channel.subscriberCount > (topChannel?.subscriberCount || 0)) {
            topChannel = channel;
          }
        });
        
        // Calculate engagement rate from recent videos
        if (allVideos.length > 0) {
          totalEngagement = allVideos.reduce((sum, video) => {
            const videoViews = parseInt(video.statistics?.viewCount || "0");
            const videoLikes = parseInt(video.statistics?.likeCount || "0");
            const videoComments = parseInt(video.statistics?.commentCount || "0");
            
            if (videoViews > 0) {
              return sum + ((videoLikes + videoComments) / videoViews) * 100;
            }
            return sum;
          }, 0) / allVideos.length;
        }
        
        // Mock data for new metrics (in a real app, these would come from YouTube Analytics API)
        const mockMonthlyGrowth = Math.random() * 30 + 5; // 5-35% growth
        const mockWatchTime = Math.random() * 10000 + 5000; // 5K-15K hours
        const mockRevenue = Math.random() * 5000 + 1000; // $1K-6K
        
        setStats({
          totalViews: views,
          totalSubscribers: subscribers,
          totalVideos: videos,
          avgEngagement: Math.round(totalEngagement * 100) / 100,
          monthlyGrowth: Math.round(mockMonthlyGrowth * 100) / 100,
          watchTime: Math.round(mockWatchTime),
          revenue: Math.round(mockRevenue),
          topPerformingChannel: topChannel || null
        });
      } catch (error) {
        console.error("Error fetching channels:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchChannels();
    }
  }, [user]);

  const handleChannelConnected = () => {
    // Refresh channels list
    setLoading(true);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Simulate refresh delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      window.location.reload();
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
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

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getEngagementColor = (rate: number): string => {
    if (rate >= 5) return 'text-green-500';
    if (rate >= 3) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (growth < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Just now';
  };

  // Mock chart data (in a real app, this would come from analytics)
  const getAnalyticsData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      views: Math.floor(Math.random() * 10000) + 5000,
      subscribers: Math.floor(Math.random() * 100) + 50,
      engagement: Math.floor(Math.random() * 10) + 2
    }));
  };

  const chartData = getAnalyticsData();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-background/90">
        <div className="text-center p-8 rounded-2xl glass-card">
          <h2 className="text-2xl font-bold mb-4">Please sign in</h2>
          <p className="text-muted-foreground mb-6">You need to be logged in to access your dashboard</p>
          <Button onClick={() => navigate('/auth')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background/95 to-background/90">
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Enhanced Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-3 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-xl border border-red-500/30">
                  <BarChart3 className="h-8 w-8 text-red-500" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                  Creator Dashboard
                </h1>
                <p className="text-muted-foreground mt-1 flex items-center gap-2">
                  <span>Welcome back, {user.name}</span>
                  <Badge variant="outline" className="gap-1">
                    <Crown className="h-3 w-3" />
                    Pro
                  </Badge>
                </p>
              </div>
            </div>
            
            {/* Header Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/compare')}
                className="gap-2"
              >
                <Target className="h-4 w-4" />
                Compare
              </Button>
              <Button 
                variant="hero" 
                onClick={() => navigate('/upload')}
                className="gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              >
                <Upload className="h-4 w-4" />
                Upload Video
              </Button>
            </div>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass-card border-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                    <p className="text-3xl font-bold text-blue-600">{formatNumber(stats.totalViews)}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      {getGrowthIcon(stats.monthlyGrowth)}
                      +{stats.monthlyGrowth}% this month
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-xl">
                    <Eye className="h-8 w-8 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0 bg-gradient-to-br from-purple-500/10 to-purple-600/5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Subscribers</p>
                    <p className="text-3xl font-bold text-purple-600">{formatNumber(stats.totalSubscribers)}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      {getGrowthIcon(stats.monthlyGrowth * 0.8)}
                      +{(stats.monthlyGrowth * 0.8).toFixed(1)}% this month
                    </p>
                  </div>
                  <div className="p-3 bg-purple-500/10 rounded-xl">
                    <Users className="h-8 w-8 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0 bg-gradient-to-br from-green-500/10 to-green-600/5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Engagement Rate</p>
                    <p className={`text-3xl font-bold ${getEngagementColor(stats.avgEngagement)}`}>
                      {stats.avgEngagement.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Heart className="h-3 w-3" />
                      Industry avg: 3.2%
                    </p>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-xl">
                    <ThumbsUp className="h-8 w-8 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0 bg-gradient-to-br from-orange-500/10 to-orange-600/5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Est. Revenue</p>
                    <p className="text-3xl font-bold text-orange-600">{formatCurrency(stats.revenue)}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      {getGrowthIcon(stats.monthlyGrowth * 1.2)}
                      This month
                    </p>
                  </div>
                  <div className="p-3 bg-orange-500/10 rounded-xl">
                    <DollarSign className="h-8 w-8 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Weekly Performance
                </CardTitle>
                <CardDescription>Views and subscriber growth over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="day" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px' 
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="views" 
                        stroke="#3B82F6" 
                        fillOpacity={1} 
                        fill="url(#colorViews)" 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Channel Performance
                </CardTitle>
                <CardDescription>Subscriber distribution across channels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {channels.slice(0, 4).map((channel, index) => (
                    <div key={channel._id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/20">
                      <div className="relative">
                        {channel.thumbnailUrl ? (
                          <img 
                            src={channel.thumbnailUrl} 
                            alt={channel.title} 
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Youtube className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        {index === 0 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                            <Crown className="h-2 w-2 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm truncate">{channel.title}</p>
                        <p className="text-xs text-muted-foreground">{formatNumber(channel.subscriberCount)} subscribers</p>
                      </div>
                      <div className="text-right">
                        <Progress 
                          value={(channel.subscriberCount / Math.max(...channels.map(c => c.subscriberCount))) * 100} 
                          className="w-16 h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Connected Channels - Enhanced */}
            <div className="lg:col-span-2">
              <Card className="glass-card border-0 shadow-xl">
                <CardHeader className="border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-500/10 rounded-lg">
                        <Youtube className="h-6 w-6 text-red-500" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Connected Channels</CardTitle>
                        <CardDescription>Manage your YouTube channels and content</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="gap-1">
                        <Shield className="h-3 w-3" />
                        {channels.length} Active
                      </Badge>
                      <ConnectYouTubeChannel onChannelConnected={handleChannelConnected} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="p-6 space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="flex items-center gap-4 p-4 bg-secondary/20 rounded-lg">
                            <div className="w-16 h-16 bg-secondary rounded-full"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-secondary rounded w-3/4"></div>
                              <div className="h-3 bg-secondary rounded w-1/2"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : channels.length === 0 ? (
                    <div className="text-center py-16 px-6">
                      <div className="mx-auto w-20 h-20 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center mb-6">
                        <Youtube className="h-10 w-10 text-red-500" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3">No channels connected yet</h3>
                      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                        Connect your first YouTube channel to start managing your content and accessing powerful analytics
                      </p>
                      <ConnectYouTubeChannel onChannelConnected={handleChannelConnected} />
                    </div>
                  ) : (
                    <div className="p-6 space-y-4">
                      {channels.map((channel, index) => (
                        <div 
                          key={channel._id} 
                          className="group relative p-5 rounded-xl bg-gradient-to-r from-secondary/20 to-secondary/10 border border-border/30 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                        >
                          {/* Top Performer Badge */}
                          {index === 0 && (
                            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              Top Performer
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                {channel.thumbnailUrl ? (
                                  <img 
                                    src={channel.thumbnailUrl} 
                                    alt={channel.title} 
                                    className="w-16 h-16 rounded-full object-cover border-3 border-primary/20 group-hover:border-primary/40 transition-all"
                                  />
                                ) : (
                                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500/20 to-red-600/20 flex items-center justify-center border-3 border-primary/20">
                                    <Youtube className="h-8 w-8 text-primary" />
                                  </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                                  <CheckCircle className="h-3 w-3 text-white" />
                                </div>
                              </div>
                              
                              <div className="flex-1">
                                <h3 className="font-bold text-lg flex items-center gap-2 group-hover:text-primary transition-colors">
                                  {channel.title}
                                  <Badge variant="secondary" className="text-xs">
                                    {channel.videoCount} videos
                                  </Badge>
                                </h3>
                                
                                <div className="flex flex-wrap gap-4 mt-2">
                                  <div className="flex items-center gap-1 text-sm">
                                    <Users className="h-4 w-4 text-purple-500" />
                                    <span className="font-medium">{formatNumber(channel.subscriberCount)}</span>
                                    <span className="text-muted-foreground">subscribers</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-sm">
                                    <Eye className="h-4 w-4 text-blue-500" />
                                    <span className="font-medium">{formatNumber(channel.viewCount)}</span>
                                    <span className="text-muted-foreground">views</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-sm">
                                    <Calendar className="h-4 w-4 text-green-500" />
                                    <span className="text-muted-foreground">Since {new Date(channel.publishedAt).getFullYear()}</span>
                                  </div>
                                </div>
                                
                                {/* Performance Indicator */}
                                <div className="flex items-center gap-2 mt-2">
                                  <div className="flex items-center gap-1">
                                    <Flame className="h-4 w-4 text-orange-500" />
                                    <span className="text-xs font-medium">Performance: </span>
                                    <Badge 
                                      variant={channel.subscriberCount > 100000 ? "default" : channel.subscriberCount > 10000 ? "secondary" : "outline"}
                                      className="text-xs"
                                    >
                                      {channel.subscriberCount > 100000 ? 'Excellent' : channel.subscriberCount > 10000 ? 'Good' : 'Growing'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => navigate(`/channel/${channel.channelId}`)}
                                className="gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <BarChart3 className="h-4 w-4" />
                                Analytics
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate('/upload')}
                                className="gap-1"
                              >
                                <Upload className="h-4 w-4" />
                                Upload
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="secondary" 
                    className="w-full justify-between h-12 text-base hover:bg-primary/10"
                    onClick={() => navigate('/upload')}
                  >
                    <div className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Upload Video
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="w-full justify-between h-12 text-base hover:bg-primary/10"
                    onClick={() => navigate('/compare')}
                  >
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Channel Compare
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="w-full justify-between h-12 text-base hover:bg-primary/10"
                  >
                    <div className="flex items-center gap-2">
                      <Timer className="h-5 w-5" />
                      Schedule Posts
                    </div>
                    <Badge variant="outline" className="text-xs">Soon</Badge>
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="w-full justify-between h-12 text-base hover:bg-primary/10"
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Settings
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest updates and notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors"
                      >
                        <div className={`p-2 rounded-lg ${
                          notification.type === 'success' ? 'bg-green-500/20 text-green-500' :
                          notification.type === 'warning' ? 'bg-yellow-500/20 text-yellow-500' :
                          'bg-blue-500/20 text-blue-500'
                        }`}>
                          {notification.type === 'success' ? <CheckCircle className="h-4 w-4" /> :
                           notification.type === 'warning' ? <AlertTriangle className="h-4 w-4" /> :
                           <Info className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{notification.message}</p>
                          <p className="text-xs text-muted-foreground">{notification.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Tips */}
              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Growth Tips
                  </CardTitle>
                  <CardDescription>Personalized suggestions for your channels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-green-500/10 to-green-500/5 rounded-lg border border-green-500/20">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Upload Consistency</h4>
                        <p className="text-xs text-muted-foreground mt-1">Post 2-3 times per week for optimal growth</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-500/10 to-blue-500/5 rounded-lg border border-blue-500/20">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <MessageCircle className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Engage with Community</h4>
                        <p className="text-xs text-muted-foreground mt-1">Respond to comments within 2 hours</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-500/10 to-purple-500/5 rounded-lg border border-purple-500/20">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Optimize Thumbnails</h4>
                        <p className="text-xs text-muted-foreground mt-1">Use bright colors and clear faces</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Videos Section */}
          {recentVideos.length > 0 && (
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-primary" />
                  Recent Uploads
                </CardTitle>
                <CardDescription>Your latest video content across all channels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {recentVideos.map((video) => (
                    <div key={video.id} className="group relative">
                      <div className="relative overflow-hidden rounded-lg bg-secondary/20 aspect-video">
                        <img 
                          src={video.snippet.thumbnails.medium?.url || '/placeholder.svg'} 
                          alt={video.snippet.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {getTimeAgo(video.snippet.publishedAt)}
                        </div>
                      </div>
                      <div className="mt-2">
                        <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                          {video.snippet.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          <span>{formatNumber(parseInt(video.statistics?.viewCount || "0"))}</span>
                          <ThumbsUp className="h-3 w-3 ml-2" />
                          <span>{formatNumber(parseInt(video.statistics?.likeCount || "0"))}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;