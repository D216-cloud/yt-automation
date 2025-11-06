import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GlassCard } from "@/components/GlassCard";
import { LoadingCard } from "@/components/LoadingCard";
import VideoDetailsModal from "@/components/VideoDetailsModal";
import { 
  Youtube, 
  Users, 
  Eye, 
  ThumbsUp, 
  MessageCircle, 
  Calendar, 
  Play,
  TrendingUp,
  TrendingDown,
  Clock,
  ExternalLink,
  ArrowLeft,
  BarChart3,
  Target,
  RefreshCw,
  Trash2,
  Plus,
  Zap,
  Heart,
  Share2,
  Award,
  Flame
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import youtubeService from "@/services/youtubeService";
import { YouTubeChannel, YouTubeVideo } from "@/types/youtube";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const ChannelDetails = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [channel, setChannel] = useState<YouTubeChannel | null>(null);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        if (!channelId) return;
        
        // Fetch real channel data and videos
        const channelData = await youtubeService.getChannelDetails(channelId);
        const channelVideos = await youtubeService.getChannelVideos(channelId, 50);
        
        setChannel(channelData);
        setVideos(channelVideos);
      } catch (error) {
        console.error("Error fetching channel data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChannelData();
  }, [channelId]);

  const handleRefreshData = async () => {
    try {
      setRefreshing(true);
      if (!channelId) return;
      
      // Fetch fresh data
      const channelData = await youtubeService.getChannelDetails(channelId);
      const channelVideos = await youtubeService.getChannelVideos(channelId, 50);
      
      setChannel(channelData);
      setVideos(channelVideos);
    } catch (error) {
      console.error("Error refreshing channel data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteChannel = async () => {
    if (!channelId) return;
    
    try {
      await youtubeService.disconnectChannel(channelId);
      toast({
        title: "Success",
        description: "Channel disconnected successfully",
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect channel",
        variant: "destructive",
      });
      console.error("Error disconnecting channel:", error);
    }
  };

  const handleViewDetails = (video: YouTubeVideo) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const formatNumber = (num: string | number | undefined | null): string => {
    // Handle undefined or null values
    if (num === undefined || num === null) {
      return '0';
    }
    
    const number = typeof num === 'string' ? parseInt(num) : num;
    
    // Handle NaN values
    if (isNaN(number)) {
      return '0';
    }
    
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + 'M';
    }
    if (number >= 1000) {
      return (number / 1000).toFixed(1) + 'K';
    }
    return number.toString();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTimeSincePublished = (dateString: string): string => {
    const publishedDate = new Date(dateString);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - publishedDate.getTime());
    
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 365) {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    } else if (diffDays > 30) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    }
  };

  const getCurrentDateTime = (): string => {
    const now = new Date();
    return now.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    });
  };

  const formatDuration = (duration: string): string => {
    if (!duration) return "0:00";
    
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return "0:00";
    
    const hours = match[1] ? parseInt(match[1].slice(0, -1)) : 0;
    const minutes = match[2] ? parseInt(match[2].slice(0, -1)) : 0;
    const seconds = match[3] ? parseInt(match[3].slice(0, -1)) : 0;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Enhanced analytics calculations
  const calculateEngagementRate = (video: YouTubeVideo): number => {
    const views = parseInt(video.statistics?.viewCount || "0");
    const likes = parseInt(video.statistics?.likeCount || "0");
    const comments = parseInt(video.statistics?.commentCount || "0");
    
    if (views === 0) return 0;
    return ((likes + comments) / views) * 100;
  };

  const getChannelEngagementRate = (): number => {
    if (videos.length === 0) return 0;
    const totalEngagement = videos.reduce((sum, video) => sum + calculateEngagementRate(video), 0);
    return totalEngagement / videos.length;
  };

  const getPerformanceMetrics = () => {
    if (videos.length === 0) return { viewsGrowth: 0, likesGrowth: 0, avgViews: 0, avgLikes: 0 };
    
    const avgViews = videos.reduce((sum, video) => sum + parseInt(video.statistics?.viewCount || "0"), 0) / videos.length;
    const avgLikes = videos.reduce((sum, video) => sum + parseInt(video.statistics?.likeCount || "0"), 0) / videos.length;
    
    // Sort videos by date to calculate growth trends
    const sortedVideos = [...videos].sort((a, b) => 
      new Date(a.snippet.publishedAt).getTime() - new Date(b.snippet.publishedAt).getTime()
    );
    
    const recentVideos = sortedVideos.slice(-5);
    const olderVideos = sortedVideos.slice(0, 5);
    
    const recentAvgViews = recentVideos.reduce((sum, video) => sum + parseInt(video.statistics?.viewCount || "0"), 0) / recentVideos.length;
    const olderAvgViews = olderVideos.reduce((sum, video) => sum + parseInt(video.statistics?.viewCount || "0"), 0) / olderVideos.length;
    
    const viewsGrowth = olderAvgViews > 0 ? ((recentAvgViews - olderAvgViews) / olderAvgViews) * 100 : 0;
    
    return { viewsGrowth, likesGrowth: 0, avgViews, avgLikes };
  };

  const getViewsChartData = () => {
    return videos.slice(-10).map((video, index) => ({
      name: `Video ${index + 1}`,
      views: parseInt(video.statistics?.viewCount || "0"),
      likes: parseInt(video.statistics?.likeCount || "0"),
      comments: parseInt(video.statistics?.commentCount || "0"),
      engagement: calculateEngagementRate(video),
      title: video.snippet.title.substring(0, 20) + "..."
    }));
  };

  const getEngagementData = () => {
    const avgEngagement = getChannelEngagementRate();
    return [
      { name: 'Engagement Rate', value: avgEngagement, color: '#8884d8' },
      { name: 'Remaining', value: 100 - avgEngagement, color: '#e0e0e0' }
    ];
  };

  const getTopPerformingVideos = () => {
    return [...videos]
      .sort((a, b) => parseInt(b.statistics?.viewCount || "0") - parseInt(a.statistics?.viewCount || "0"))
      .slice(0, 5);
  };

  const getDetailedAnalytics = () => {
    if (videos.length === 0) return null;

    const totalViews = videos.reduce((sum, video) => sum + parseInt(video.statistics?.viewCount || "0"), 0);
    const totalLikes = videos.reduce((sum, video) => sum + parseInt(video.statistics?.likeCount || "0"), 0);
    const totalComments = videos.reduce((sum, video) => sum + parseInt(video.statistics?.commentCount || "0"), 0);
    
    // Performance calculations
    const avgViewsPerVideo = Math.round(totalViews / videos.length);
    const avgLikesPerVideo = Math.round(totalLikes / videos.length);
    const avgCommentsPerVideo = Math.round(totalComments / videos.length);
    
    // Engagement metrics
    const overallEngagementRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0;
    const avgLikeRate = totalViews > 0 ? (totalLikes / totalViews) * 100 : 0;
    const avgCommentRate = totalViews > 0 ? (totalComments / totalViews) * 100 : 0;
    
    // Upload frequency analysis
    const sortedVideos = [...videos].sort((a, b) => 
      new Date(b.snippet.publishedAt).getTime() - new Date(a.snippet.publishedAt).getTime()
    );
    
    let uploadFrequency = "Irregular";
    if (sortedVideos.length >= 2) {
      const daysBetweenUploads = [];
      for (let i = 0; i < Math.min(sortedVideos.length - 1, 10); i++) {
        const date1 = new Date(sortedVideos[i].snippet.publishedAt);
        const date2 = new Date(sortedVideos[i + 1].snippet.publishedAt);
        const diffDays = Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24);
        daysBetweenUploads.push(diffDays);
      }
      const avgDaysBetween = daysBetweenUploads.reduce((sum, days) => sum + days, 0) / daysBetweenUploads.length;
      
      if (avgDaysBetween <= 1) uploadFrequency = "Daily";
      else if (avgDaysBetween <= 3) uploadFrequency = "Every 2-3 days";
      else if (avgDaysBetween <= 7) uploadFrequency = "Weekly";
      else if (avgDaysBetween <= 14) uploadFrequency = "Bi-weekly";
      else if (avgDaysBetween <= 30) uploadFrequency = "Monthly";
      else uploadFrequency = "Irregular";
    }
    
    // Content performance distribution
    const viewRanges = {
      viral: videos.filter(v => parseInt(v.statistics?.viewCount || "0") > 1000000).length,
      popular: videos.filter(v => {
        const views = parseInt(v.statistics?.viewCount || "0");
        return views > 100000 && views <= 1000000;
      }).length,
      moderate: videos.filter(v => {
        const views = parseInt(v.statistics?.viewCount || "0");
        return views > 10000 && views <= 100000;
      }).length,
      low: videos.filter(v => parseInt(v.statistics?.viewCount || "0") <= 10000).length
    };
    
    // Growth trend analysis
    const recentVideos = sortedVideos.slice(0, Math.min(10, sortedVideos.length));
    const olderVideos = sortedVideos.slice(-Math.min(10, sortedVideos.length));
    
    const recentAvgViews = recentVideos.reduce((sum, v) => sum + parseInt(v.statistics?.viewCount || "0"), 0) / recentVideos.length;
    const olderAvgViews = olderVideos.reduce((sum, v) => sum + parseInt(v.statistics?.viewCount || "0"), 0) / olderVideos.length;
    
    const viewGrowthTrend = olderAvgViews > 0 ? ((recentAvgViews - olderAvgViews) / olderAvgViews) * 100 : 0;
    
    // Best performing day/time analysis
    const uploadDays = videos.map(video => {
      const date = new Date(video.snippet.publishedAt);
      return date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    });
    
    const dayFrequency = uploadDays.reduce((acc, day) => {
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const bestDay = Object.entries(dayFrequency).reduce((best, [day, count]) => 
      count > best.count ? { day: parseInt(day), count } : best
    , { day: 0, count: 0 });
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return {
      totalViews,
      totalLikes,
      totalComments,
      avgViewsPerVideo,
      avgLikesPerVideo,
      avgCommentsPerVideo,
      overallEngagementRate,
      avgLikeRate,
      avgCommentRate,
      uploadFrequency,
      viewRanges,
      viewGrowthTrend,
      bestUploadDay: dayNames[bestDay.day],
      contentConsistency: Math.min(100, (dayFrequency[bestDay.day] / videos.length) * 100),
      channelAge: getTimeSincePublished(channel.publishedAt),
      videosPerMonth: (videos.length / (Date.now() - new Date(channel.publishedAt).getTime())) * (1000 * 60 * 60 * 24 * 30)
    };
  };

  // Real Performance Scoring System
  const getRealPerformanceScore = () => {
    if (!detailedAnalytics || videos.length === 0) {
      return {
        viewsScore: 0,
        subscribersScore: 0,
        engagementScore: 0,
        consistencyScore: 0,
        viralPotentialScore: 0,
        overallScore: 0
      };
    }

    // Views Score (0-20) - based on average views per video
    const avgViews = detailedAnalytics.avgViewsPerVideo;
    let viewsScore = 0;
    if (avgViews > 1000000) viewsScore = 20;
    else if (avgViews > 500000) viewsScore = 18;
    else if (avgViews > 100000) viewsScore = 16;
    else if (avgViews > 50000) viewsScore = 14;
    else if (avgViews > 10000) viewsScore = 12;
    else if (avgViews > 5000) viewsScore = 10;
    else if (avgViews > 1000) viewsScore = 8;
    else if (avgViews > 500) viewsScore = 6;
    else if (avgViews > 100) viewsScore = 4;
    else if (avgViews > 0) viewsScore = 2;

    // Subscribers Score (0-20) - based on subscriber count
    const subs = channel.subscriberCount;
    let subscribersScore = 0;
    if (subs > 10000000) subscribersScore = 20;
    else if (subs > 5000000) subscribersScore = 18;
    else if (subs > 1000000) subscribersScore = 16;
    else if (subs > 500000) subscribersScore = 14;
    else if (subs > 100000) subscribersScore = 12;
    else if (subs > 50000) subscribersScore = 10;
    else if (subs > 10000) subscribersScore = 8;
    else if (subs > 5000) subscribersScore = 6;
    else if (subs > 1000) subscribersScore = 4;
    else if (subs > 0) subscribersScore = 2;

    // Engagement Score (0-20) - based on engagement rate
    const engagement = detailedAnalytics.overallEngagementRate;
    let engagementScore = 0;
    if (engagement > 10) engagementScore = 20;
    else if (engagement > 8) engagementScore = 18;
    else if (engagement > 6) engagementScore = 16;
    else if (engagement > 4) engagementScore = 14;
    else if (engagement > 3) engagementScore = 12;
    else if (engagement > 2) engagementScore = 10;
    else if (engagement > 1.5) engagementScore = 8;
    else if (engagement > 1) engagementScore = 6;
    else if (engagement > 0.5) engagementScore = 4;
    else if (engagement > 0) engagementScore = 2;

    // Consistency Score (0-20) - based on upload frequency and regularity
    const uploadFreq = detailedAnalytics.uploadFrequency;
    let consistencyScore = 0;
    if (uploadFreq === "Daily") consistencyScore = 20;
    else if (uploadFreq === "Every 2-3 days") consistencyScore = 18;
    else if (uploadFreq === "Weekly") consistencyScore = 16;
    else if (uploadFreq === "Bi-weekly") consistencyScore = 12;
    else if (uploadFreq === "Monthly") consistencyScore = 8;
    else consistencyScore = 4;

    // Viral Potential Score (0-20) - based on viral videos ratio and growth
    const viralRatio = detailedAnalytics.viewRanges.viral / videos.length;
    const popularRatio = detailedAnalytics.viewRanges.popular / videos.length;
    const growthTrend = detailedAnalytics.viewGrowthTrend;
    
    let viralPotentialScore = 0;
    if (viralRatio > 0.1) viralPotentialScore += 8; // 10%+ viral videos
    else if (viralRatio > 0.05) viralPotentialScore += 6; // 5%+ viral videos
    else if (viralRatio > 0.02) viralPotentialScore += 4; // 2%+ viral videos
    
    if (popularRatio > 0.3) viralPotentialScore += 6; // 30%+ popular videos
    else if (popularRatio > 0.2) viralPotentialScore += 4; // 20%+ popular videos
    else if (popularRatio > 0.1) viralPotentialScore += 2; // 10%+ popular videos
    
    if (growthTrend > 50) viralPotentialScore += 6; // Strong growth
    else if (growthTrend > 20) viralPotentialScore += 4; // Good growth
    else if (growthTrend > 0) viralPotentialScore += 2; // Positive growth

    viralPotentialScore = Math.min(20, viralPotentialScore);

    const overallScore = viewsScore + subscribersScore + engagementScore + consistencyScore + viralPotentialScore;

    return {
      viewsScore,
      subscribersScore,
      engagementScore,
      consistencyScore,
      viralPotentialScore,
      overallScore
    };
  };

  // Get Viral Tips based on performance analysis
  const getViralTips = () => {
    if (!detailedAnalytics) return [];
    
    const tips = [];
    const performanceScore = getRealPerformanceScore();
    
    // Views-based tips
    if (performanceScore.viewsScore < 10) {
      tips.push({
        icon: <Eye className="h-4 w-4" />,
        title: "Improve Thumbnails & Titles",
        description: "Create eye-catching thumbnails and compelling titles. Use bright colors, clear faces, and curiosity-driven text.",
        priority: "high"
      });
    }
    
    // Engagement-based tips
    if (performanceScore.engagementScore < 12) {
      tips.push({
        icon: <Heart className="h-4 w-4" />,
        title: "Boost Engagement",
        description: "Ask questions, create polls, respond to comments within the first hour, and use call-to-actions.",
        priority: "high"
      });
    }
    
    // Consistency tips
    if (performanceScore.consistencyScore < 15) {
      tips.push({
        icon: <Calendar className="h-4 w-4" />,
        title: "Upload Consistently",
        description: `Your current frequency: ${detailedAnalytics.uploadFrequency}. Try uploading at least weekly on the same day.`,
        priority: "medium"
      });
    }
    
    // Viral potential tips
    if (performanceScore.viralPotentialScore < 10) {
      tips.push({
        icon: <TrendingUp className="h-4 w-4" />,
        title: "Follow Trends",
        description: "Create content around trending topics, use trending sounds/music, and participate in challenges.",
        priority: "high"
      });
    }
    
    // Best upload time tip
    tips.push({
      icon: <Clock className="h-4 w-4" />,
      title: "Optimal Upload Time",
      description: `Your best performing day is ${detailedAnalytics.bestUploadDay}. Upload between 2-4 PM or 7-9 PM for maximum reach.`,
      priority: "medium"
    });
    
    return tips;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-background/90">
        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold">Channel Details</h1>
            </div>
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-background/90">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Channel not found</h2>
            <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculate average metrics
  const metrics = getPerformanceMetrics();
  const engagementRate = getChannelEngagementRate();
  const topVideos = getTopPerformingVideos();
  const chartData = getViewsChartData();
  const engagementData = getEngagementData();
  const detailedAnalytics = getDetailedAnalytics();
  const performanceScore = getRealPerformanceScore();
  const viralTips = getViralTips();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-background/90">
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
          {/* Header with Current Time */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Channel Analytics</h1>
                <div className="flex flex-col gap-1">
                  <p className="text-muted-foreground">Advanced insights for {channel.title}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Current Time: {getCurrentDateTime()}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleRefreshData}
                disabled={refreshing}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh Data'}
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
                variant="outline" 
                onClick={() => navigate('/upload')}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Upload
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteChannel}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          {/* Channel Overview */}
          <Card className="glass-card border-0">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                {channel.thumbnailUrl ? (
                  <img 
                    src={channel.thumbnailUrl} 
                    alt={channel.title} 
                    className="w-24 h-24 rounded-full object-cover border-2 border-primary/20"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                    <Youtube className="h-12 w-12 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    {channel.title}
                    <Badge variant="secondary">
                      <Award className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {channel.description}
                  </CardDescription>
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="font-medium">{formatNumber(channel.subscriberCount)} subscribers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Play className="h-5 w-5 text-primary" />
                      <span className="font-medium">{formatNumber(channel.videoCount)} videos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-primary" />
                      <span className="font-medium">{formatNumber(channel.viewCount)} views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      <span className="font-medium">{engagementRate.toFixed(2)}% engagement</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Created: {formatDateTime(channel.publishedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Channel Age: {getTimeSincePublished(channel.publishedAt)}</span>
                    </div>
                    {detailedAnalytics && (
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span>Upload Frequency: {detailedAnalytics.uploadFrequency}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => window.open(`https://www.youtube.com/channel/${channel.channelId}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                  View on YouTube
                </Button>
                <Button variant="outline" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Detailed Analytics
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <GlassCard 
              title="Avg. Views" 
              description={formatNumber(metrics.avgViews)}
              className="glass-card-enhanced"
            >
              <div className="pt-4 flex items-center justify-between">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Eye className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex items-center gap-1">
                  {metrics.viewsGrowth > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm ${metrics.viewsGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {Math.abs(metrics.viewsGrowth).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="pt-2">
                <Progress value={Math.min(100, (metrics.avgViews / 100000) * 100)} className="h-2" />
              </div>
            </GlassCard>
            
            <GlassCard 
              title="Engagement Rate" 
              description={`${engagementRate.toFixed(2)}%`}
              className="glass-card-enhanced"
            >
              <div className="pt-4 flex items-center justify-between">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Heart className="h-5 w-5 text-green-500" />
                </div>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <div className="pt-2">
                <Progress value={Math.min(100, engagementRate * 10)} className="h-2" />
              </div>
            </GlassCard>
            
            <GlassCard 
              title="Subscribers" 
              description={formatNumber(channel.subscriberCount)}
              className="glass-card-enhanced"
            >
              <div className="pt-4 flex items-center justify-between">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <div className="pt-2">
                <Progress value={Math.min(100, (channel.subscriberCount / 1000000) * 100)} className="h-2" />
              </div>
            </GlassCard>
            
            <GlassCard 
              title="Total Videos" 
              description={formatNumber(channel.videoCount)}
              className="glass-card-enhanced"
            >
              <div className="pt-4 flex items-center justify-between">
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <Play className="h-5 w-5 text-red-500" />
                </div>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <div className="pt-2">
                <Progress value={Math.min(100, (channel.videoCount / 1000) * 100)} className="h-2" />
              </div>
            </GlassCard>
          </div>

          {/* Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Video Performance Chart */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Video Performance
                </CardTitle>
                <CardDescription>
                  Views and engagement for recent videos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#9CA3AF"
                        fontSize={12}
                      />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        formatter={(value: number | string | undefined | null) => formatNumber(value)}
                        labelFormatter={(label, payload) => {
                          if (payload && payload[0]) {
                            return payload[0].payload.title;
                          }
                          return label;
                        }}
                      />
                      <Bar dataKey="views" fill="#3B82F6" name="Views" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Engagement Rate Chart */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Engagement Overview
                </CardTitle>
                <CardDescription>
                  Average engagement rate across all videos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={engagementData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={60}
                            dataKey="value"
                          >
                            {engagementData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{engagementRate.toFixed(1)}%</div>
                          <div className="text-xs text-muted-foreground">Engagement</div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <Zap className="h-4 w-4 text-green-500" />
                        <span>
                          {engagementRate > 5 ? 'Excellent' : engagementRate > 3 ? 'Good' : engagementRate > 1 ? 'Average' : 'Low'} engagement
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Videos */}
          {topVideos.length > 0 && (
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Top Performing Videos
                </CardTitle>
                <CardDescription>
                  Your most successful content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topVideos.map((video, index) => (
                    <div 
                      key={video.id} 
                      className="flex flex-col md:flex-row gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                          #{index + 1}
                        </div>
                        <div className="relative md:w-32 flex-shrink-0">
                          <img 
                            src={video.snippet.thumbnails.medium?.url || '/placeholder.svg'} 
                            alt={video.snippet.title} 
                            className="w-full h-18 md:h-16 object-cover rounded-lg"
                          />
                          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                            {formatDuration(video.contentDetails.duration)}
                          </div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-2">{video.snippet.title}</h3>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <span>{formatNumber(video.statistics.viewCount)} views</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                            <span>{formatNumber(video.statistics.likeCount)} likes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Zap className="h-4 w-4 text-muted-foreground" />
                            <span>{calculateEngagementRate(video).toFixed(2)}% engagement</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(video)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed Analytics Section */}
          {detailedAnalytics && (
            <>
              {/* Overall Performance Score */}
              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-6 w-6" />
                    Overall Performance Score
                  </CardTitle>
                  <CardDescription>
                    Real-time analysis based on your actual channel data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Score Breakdown */}
                    <div className="space-y-4">
                      <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
                        <div className="text-4xl font-bold text-primary mb-2">
                          {performanceScore.overallScore}/100
                        </div>
                        <div className="text-lg font-medium">
                          {performanceScore.overallScore > 80 ? 'Excellent Channel' : 
                           performanceScore.overallScore > 60 ? 'Good Performance' : 
                           performanceScore.overallScore > 40 ? 'Average Channel' : 'Needs Improvement'}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">Views</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">{performanceScore.viewsScore}/20</span>
                            <div className="w-20 bg-secondary rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                                style={{ width: `${(performanceScore.viewsScore / 20) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground ml-6">
                          Avg: {formatNumber(detailedAnalytics.avgViewsPerVideo)} views per video
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">Subscribers</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">{performanceScore.subscribersScore}/20</span>
                            <div className="w-20 bg-secondary rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                                style={{ width: `${(performanceScore.subscribersScore / 20) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground ml-6">
                          Total: {formatNumber(channel.subscriberCount)} subscribers
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium">Engagement</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">{performanceScore.engagementScore}/20</span>
                            <div className="w-20 bg-secondary rounded-full h-2">
                              <div 
                                className="bg-yellow-500 h-2 rounded-full transition-all duration-500" 
                                style={{ width: `${(performanceScore.engagementScore / 20) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground ml-6">
                          Rate: {detailedAnalytics.overallEngagementRate.toFixed(2)}%
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-purple-500" />
                            <span className="text-sm font-medium">Consistency</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">{performanceScore.consistencyScore}/20</span>
                            <div className="w-20 bg-secondary rounded-full h-2">
                              <div 
                                className="bg-purple-500 h-2 rounded-full transition-all duration-500" 
                                style={{ width: `${(performanceScore.consistencyScore / 20) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground ml-6">
                          Upload: {detailedAnalytics.uploadFrequency}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Flame className="h-4 w-4 text-red-500" />
                            <span className="text-sm font-medium">Viral Potential</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">{performanceScore.viralPotentialScore}/20</span>
                            <div className="w-20 bg-secondary rounded-full h-2">
                              <div 
                                className="bg-red-500 h-2 rounded-full transition-all duration-500" 
                                style={{ width: `${(performanceScore.viralPotentialScore / 20) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground ml-6">
                          Viral videos: {detailedAnalytics.viewRanges.viral}/{videos.length} ({((detailedAnalytics.viewRanges.viral / videos.length) * 100).toFixed(1)}%)
                        </p>
                      </div>
                    </div>

                    {/* Content Performance Distribution */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">Content Performance Distribution</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Flame className="h-4 w-4 text-red-500" />
                            <span className="text-sm font-medium">Viral (1M+ views)</span>
                          </div>
                          <Badge variant="destructive">{detailedAnalytics.viewRanges.viral} videos</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-medium">Popular (100K-1M views)</span>
                          </div>
                          <Badge variant="secondary">{detailedAnalytics.viewRanges.popular} videos</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">Moderate (10K-100K views)</span>
                          </div>
                          <Badge variant="outline">{detailedAnalytics.viewRanges.moderate} videos</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-500/10 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium">Low (&lt;10K views)</span>
                          </div>
                          <Badge variant="outline">{detailedAnalytics.viewRanges.low} videos</Badge>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <h4 className="font-semibold mb-3">Key Insights</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span>Growth Trend: {detailedAnalytics.viewGrowthTrend > 0 ? '+' : ''}{detailedAnalytics.viewGrowthTrend.toFixed(1)}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            <span>Best Upload Day: {detailedAnalytics.bestUploadDay}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-purple-500" />
                            <span>Channel Age: {detailedAnalytics.channelAge}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Viral Success Tips */}
              {viralTips.length > 0 && (
                <Card className="glass-card border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-6 w-6" />
                      Viral Success Tips
                    </CardTitle>
                    <CardDescription>
                      Personalized recommendations based on your channel analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {viralTips.map((tip, index) => (
                        <div 
                          key={index} 
                          className={`p-4 rounded-lg border-l-4 ${
                            tip.priority === 'high' ? 'bg-red-500/10 border-red-500' : 'bg-blue-500/10 border-blue-500'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 ${tip.priority === 'high' ? 'text-red-500' : 'text-blue-500'}`}>
                              {tip.icon}
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">{tip.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">{tip.description}</p>
                              <Badge 
                                variant={tip.priority === 'high' ? 'destructive' : 'secondary'} 
                                className="mt-2 text-xs"
                              >
                                {tip.priority} priority
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Videos Section */}
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Recent Videos
              </CardTitle>
              <CardDescription>
                Latest uploads from this channel
              </CardDescription>
            </CardHeader>
            <CardContent>
              {videos.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No videos found for this channel</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {videos.map((video) => (
                    <div 
                      key={video.id} 
                      className="flex flex-col md:flex-row gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 hover:shadow-md transition-all"
                    >
                      <div className="relative md:w-64 flex-shrink-0">
                        <img 
                          src={video.snippet.thumbnails.medium?.url || '/placeholder.svg'} 
                          alt={video.snippet.title} 
                          className="w-full h-36 md:h-32 object-cover rounded-lg"
                        />
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {formatDuration(video.contentDetails.duration)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{video.snippet.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {video.snippet.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <span>{formatNumber(video.statistics.viewCount)} views</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                            <span>{formatNumber(video.statistics.likeCount)} likes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4 text-muted-foreground" />
                            <span>{formatNumber(video.statistics.commentCount)} comments</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Zap className="h-4 w-4 text-muted-foreground" />
                            <span>{calculateEngagementRate(video).toFixed(2)}% engagement</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Published: {formatDateTime(video.snippet.publishedAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{getTimeSincePublished(video.snippet.publishedAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Button 
                          variant="outline" 
                          onClick={() => handleViewDetails(video)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Video Details Modal */}
      {selectedVideo && (
        <VideoDetailsModal 
          video={selectedVideo} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
      
      <Footer />
    </div>
  );
};

export default ChannelDetails;