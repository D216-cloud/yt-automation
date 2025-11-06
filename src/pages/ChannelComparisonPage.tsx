import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  Video, 
  Eye, 
  ThumbsUp, 
  MessageCircle,
  TrendingUp, 
  TrendingDown,
  BarChart3, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Search,
  Calendar,
  Clock,
  Flame,
  Share2,
  Award,
  Zap,
  Target,
  Lightbulb,
  Rocket,
  ChartNoAxesCombined,
  RefreshCw,
  Play,
  Hash,
  Link as LinkIcon,
  Crown,
  Star,
  Activity,
  DollarSign,
  Sparkles,
  Timer,
  BookOpen,
  Info,
  Heart,
  Globe,
  Smartphone,
  Shield,
  Bell,
  Settings,
  ChevronRight,
  MoreVertical,
  ExternalLink,
  Plus,
  Loader2,
  GitCompare
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { useToast } from "@/hooks/use-toast";
import youtubeService from "@/services/youtubeService";
import { YouTubeChannel, YouTubeVideo } from "@/types/youtube";
import Footer from "@/components/Footer";

interface ChannelData {
  id: string;
  title: string;
  thumbnail: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  engagementRate: number;
  growthRate: number;
  uploadFrequency: string;
  avgUploadTime: string;
  viralVideos: number;
  publishedAt: string;
  bestPerformingVideo?: {
    title: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    thumbnail: string;
    publishedAt: string;
  };
  recentUploads: Array<{
    title: string;
    viewCount: number;
    uploadDate: string;
    thumbnail: string;
    likeCount: number;
    commentCount: number;
  }>;
  topKeywords: string[];
  avgWatchTime: number;
  revenue: number;
  monthlyGrowth: number;
}

interface ComparisonData {
  channel1: ChannelData;
  channel2: ChannelData;
}

interface ViralScore {
  score: number;
  level: string;
  color: string;
}

// Add new interface for detailed scoring
interface ChannelScore {
  totalScore: number;
  metrics: {
    views: number;
    subscribers: number;
    engagement: number;
    consistency: number;
    viralPotential: number;
  };
}

// Simple GlassCard component used across this page (wraps existing Card components)
interface GlassCardProps {
  title?: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
  [key: string]: unknown;
}

const GlassCard = ({ title, description, className, children, ...props }: GlassCardProps) => {
  return (
    <Card className={`p-6 bg-white/5 backdrop-blur-sm border border-primary/10 rounded-xl ${className || ""}`} {...props}>
      {title && (
        <CardHeader className="pb-2">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

const ChannelComparisonPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [channel1Id, setChannel1Id] = useState("");
  const [channel2Id, setChannel2Id] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [notifications] = useState([
    { id: 1, type: 'success', message: 'Comparison data updated', time: '1 min ago' },
    { id: 2, type: 'info', message: 'New competitive insights available', time: '5 min ago' },
    { id: 3, type: 'warning', message: 'Channel growth slowing', time: '15 min ago' }
  ]);

  const extractChannelId = (input: string): string | null => {
    try {
      // Handle direct channel ID
      if (input.startsWith("UC") && input.length === 24) {
        return input;
      }
      
      // Handle YouTube URLs
      const url = new URL(input);
      if (url.hostname === "www.youtube.com" || url.hostname === "youtube.com") {
        // Channel URL: https://www.youtube.com/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw
        const channelMatch = url.pathname.match(/\/channel\/([^/]+)/);
        if (channelMatch) {
          return channelMatch[1];
        }
        
        // Custom URL: https://www.youtube.com/@username
        const customMatch = url.pathname.match(/\/@([^/]+)/);
        if (customMatch) {
          // For custom URLs, we'd need to fetch the channel ID via API
          // For now, we'll just return null as we don't have that functionality
          return null;
        }
      } else if (url.hostname === "youtu.be") {
        // This is a video URL, not a channel URL
        return null;
      }
      
      return null;
    } catch (error) {
      // Handle non-URL inputs (might be channel ID directly)
      if (input.startsWith("UC") && input.length === 24) {
        return input;
      }
      return null;
    }
  };

  const fetchChannelData = async (channelId: string): Promise<ChannelData> => {
    try {
      // Fetch channel details
      const channelDetails: YouTubeChannel = await youtubeService.getChannelDetails(channelId);
      
      // Fetch channel videos
      const videos: YouTubeVideo[] = await youtubeService.getChannelVideos(channelId, 50);
      
      // Calculate comprehensive metrics
      const totalViews = videos.reduce((sum, video) => sum + parseInt(video.statistics?.viewCount || "0"), 0);
      const totalLikes = videos.reduce((sum, video) => sum + parseInt(video.statistics?.likeCount || "0"), 0);
      const totalComments = videos.reduce((sum, video) => sum + parseInt(video.statistics?.commentCount || "0"), 0);
      
      // Enhanced engagement rate calculation
      const engagementRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0;
      
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
      
      // Viral videos analysis (multiple thresholds)
      const viralVideos = videos.filter(video => {
        const views = parseInt(video.statistics?.viewCount || "0");
        const avgChannelViews = totalViews / videos.length;
        return views > Math.max(100000, avgChannelViews * 2); // Dynamic viral threshold
      }).length;
      
      // Best performing video with enhanced data
      const bestPerformingVideo = videos.length > 0 ? 
        videos.reduce((best, video) => {
          const currentViews = parseInt(video.statistics?.viewCount || "0");
          const bestViews = parseInt(best?.statistics?.viewCount || "0");
          return currentViews > bestViews ? video : best;
        }) : null;
      
      // Enhanced recent uploads with more data
      const recentUploads = videos.slice(0, 10).map(video => ({
        title: video.snippet.title,
        viewCount: parseInt(video.statistics?.viewCount || "0"),
        uploadDate: video.snippet.publishedAt,
        thumbnail: video.snippet.thumbnails?.medium?.url || "",
        likeCount: parseInt(video.statistics?.likeCount || "0"),
        commentCount: parseInt(video.statistics?.commentCount || "0")
      }));
      
      // Average upload time analysis
      const uploadTimes = videos.map(video => new Date(video.snippet.publishedAt).getHours());
      const avgHour = uploadTimes.length > 0 ? 
        Math.round(uploadTimes.reduce((sum, hour) => sum + hour, 0) / uploadTimes.length) : 12;
      const avgUploadTime = `${avgHour}:00`;
      
      // Extract top keywords from video titles
      const allTitles = videos.map(v => v.snippet.title.toLowerCase()).join(' ');
      const words = allTitles.split(/\s+/).filter(word => word.length > 3);
      const wordFreq = words.reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const topKeywords = Object.entries(wordFreq)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([word]) => word);
      
      // Growth rate calculation (comparing recent vs older videos)
      const recentVideos = sortedVideos.slice(0, Math.min(10, sortedVideos.length));
      const olderVideos = sortedVideos.slice(-Math.min(10, sortedVideos.length));
      
      const recentAvgViews = recentVideos.reduce((sum, v) => sum + parseInt(v.statistics?.viewCount || "0"), 0) / recentVideos.length;
      const olderAvgViews = olderVideos.reduce((sum, v) => sum + parseInt(v.statistics?.viewCount || "0"), 0) / olderVideos.length;
      
      const growthRate = olderAvgViews > 0 ? ((recentAvgViews - olderAvgViews) / olderAvgViews) * 100 : 0;
      
      // Mock additional metrics (in real app, these would come from YouTube Analytics API)
      const mockWatchTime = Math.random() * 5000 + 1000; // 1K-6K hours
      const mockRevenue = Math.random() * 3000 + 500; // $500-3.5K
      const mockMonthlyGrowth = Math.random() * 25 + 5; // 5-30%
      
      return {
        id: channelId,
        title: channelDetails.title,
        thumbnail: channelDetails.thumbnailUrl,
        subscriberCount: channelDetails.subscriberCount,
        videoCount: channelDetails.videoCount,
        viewCount: totalViews,
        engagementRate: parseFloat(engagementRate.toFixed(2)),
        growthRate: parseFloat(growthRate.toFixed(2)),
        uploadFrequency,
        avgUploadTime,
        viralVideos,
        publishedAt: channelDetails.publishedAt,
        bestPerformingVideo: bestPerformingVideo ? {
          title: bestPerformingVideo.snippet.title,
          viewCount: parseInt(bestPerformingVideo.statistics?.viewCount || "0"),
          likeCount: parseInt(bestPerformingVideo.statistics?.likeCount || "0"),
          commentCount: parseInt(bestPerformingVideo.statistics?.commentCount || "0"),
          thumbnail: bestPerformingVideo.snippet.thumbnails?.medium?.url || "",
          publishedAt: bestPerformingVideo.snippet.publishedAt
        } : undefined,
        recentUploads,
        topKeywords,
        avgWatchTime: Math.round(mockWatchTime),
        revenue: Math.round(mockRevenue),
        monthlyGrowth: Math.round(mockMonthlyGrowth * 100) / 100
      };
    } catch (error) {
      console.error("Error fetching channel data:", error);
      throw new Error("Failed to fetch channel data");
    }
  };

  const handleCompare = async () => {
    if (!channel1Id.trim() || !channel2Id.trim()) {
      toast({
        title: "Error",
        description: "Please enter both channel IDs or URLs",
        variant: "destructive"
      });
      return;
    }

    const extractedId1 = extractChannelId(channel1Id);
    const extractedId2 = extractChannelId(channel2Id);
    
    if (!extractedId1 || !extractedId2) {
      toast({
        title: "Error",
        description: "Invalid channel ID or URL. Please enter valid YouTube channel IDs or URLs.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Fetch data for both channels
      const [channel1Data, channel2Data] = await Promise.all([
        fetchChannelData(extractedId1),
        fetchChannelData(extractedId2)
      ]);
      
      setComparisonData({
        channel1: channel1Data,
        channel2: channel2Data
      });
    } catch (error) {
      console.error("Error comparing channels:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to compare channels. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!channel1Id.trim() || !channel2Id.trim() || !comparisonData) {
      return;
    }

    const extractedId1 = extractChannelId(channel1Id);
    const extractedId2 = extractChannelId(channel2Id);
    
    if (!extractedId1 || !extractedId2) {
      toast({
        title: "Error",
        description: "Invalid channel ID or URL. Please enter valid YouTube channel IDs or URLs.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsRefreshing(true);
      
      // Fetch fresh data for both channels
      const [channel1Data, channel2Data] = await Promise.all([
        fetchChannelData(extractedId1),
        fetchChannelData(extractedId2)
      ]);
      
      setComparisonData({
        channel1: channel1Data,
        channel2: channel2Data
      });
      
      toast({
        title: "Success",
        description: "Channel data refreshed successfully",
      });
    } catch (error) {
      console.error("Error refreshing channels:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to refresh channel data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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

  const getPerformanceLevel = (score: number): { label: string; color: string; icon: typeof Crown } => {
    if (score >= 80) return { label: 'Excellent', color: 'text-green-500', icon: Crown };
    if (score >= 60) return { label: 'Good', color: 'text-blue-500', icon: Star };
    if (score >= 40) return { label: 'Average', color: 'text-yellow-500', icon: Target };
    return { label: 'Needs Work', color: 'text-red-500', icon: AlertCircle };
  };

  // Mock chart data for analytics
  const getComparisonChartData = () => {
    if (!comparisonData) return [];
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      channel1Views: Math.floor(Math.random() * 10000) + 5000,
      channel2Views: Math.floor(Math.random() * 10000) + 5000,
      channel1Subs: Math.floor(Math.random() * 100) + 50,
      channel2Subs: Math.floor(Math.random() * 100) + 50,
    }));
  };

  const getRadarData = () => {
    if (!comparisonData) return [];
    
    return [
      {
        metric: 'Views',
        channel1: Math.min(100, (comparisonData.channel1.viewCount / 1000000) * 20),
        channel2: Math.min(100, (comparisonData.channel2.viewCount / 1000000) * 20),
      },
      {
        metric: 'Subscribers',
        channel1: Math.min(100, (comparisonData.channel1.subscriberCount / 100000) * 20),
        channel2: Math.min(100, (comparisonData.channel2.subscriberCount / 100000) * 20),
      },
      {
        metric: 'Engagement',
        channel1: Math.min(100, comparisonData.channel1.engagementRate * 10),
        channel2: Math.min(100, comparisonData.channel2.engagementRate * 10),
      },
      {
        metric: 'Consistency',
        channel1: Math.min(100, comparisonData.channel1.videoCount / 5),
        channel2: Math.min(100, comparisonData.channel2.videoCount / 5),
      },
      {
        metric: 'Viral Potential',
        channel1: Math.min(100, comparisonData.channel1.viralVideos * 10),
        channel2: Math.min(100, comparisonData.channel2.viralVideos * 10),
      }
    ];
  };

  const getViralScore = (channel: ChannelData): ViralScore => {
    // More sophisticated viral score calculation
    const engagementScore = channel.engagementRate * 10;
    const viralVideoScore = channel.viralVideos * 5;
    const frequencyScore = channel.uploadFrequency.includes("times per week") ? 
      parseInt(channel.uploadFrequency) * 3 : 0;
    
    const score = Math.min(100, Math.round(engagementScore + viralVideoScore + frequencyScore));
    
    if (score > 80) return { score, level: "Viral", color: "text-red-500" };
    if (score > 60) return { score, level: "Popular", color: "text-orange-500" };
    if (score > 40) return { score, level: "Moderate", color: "text-yellow-500" };
    return { score, level: "Low", color: "text-gray-500" };
  };

  // Enhanced viral score calculation with detailed breakdown
  const calculateChannelScore = (channel: ChannelData): ChannelScore => {
    // Calculate individual metric scores (0-20 each for 100 total)
    const viewScore = Math.min(20, Math.round((channel.viewCount / 1000000) * 5)); // 5 points per million views
    const subscriberScore = Math.min(20, Math.round((channel.subscriberCount / 100000) * 5)); // 5 points per 100K subs
    const engagementScore = Math.min(20, Math.round(channel.engagementRate * 2)); // 2 points per 1% engagement
    const consistencyScore = Math.min(20, channel.uploadFrequency.includes("times per week") ? 
      parseInt(channel.uploadFrequency) * 4 : 0); // 4 points per upload per week
    const viralScore = Math.min(20, channel.viralVideos * 2); // 2 points per viral video
    
    const totalScore = viewScore + subscriberScore + engagementScore + consistencyScore + viralScore;
    
    return {
      totalScore: Math.min(100, totalScore),
      metrics: {
        views: viewScore,
        subscribers: subscriberScore,
        engagement: engagementScore,
        consistency: consistencyScore,
        viralPotential: viralScore
      }
    };
  };

  const getGrowthInsights = (channel1: ChannelData, channel2: ChannelData) => {
    const insights = [];
    
    // Upload timing insight
    if (channel1.avgUploadTime !== channel2.avgUploadTime) {
      const betterTiming = parseInt(channel1.avgUploadTime) > parseInt(channel2.avgUploadTime) ? 
        { channel: "Channel 1", time: channel1.avgUploadTime } : 
        { channel: "Channel 2", time: channel2.avgUploadTime };
      
      insights.push({
        title: "Upload Timing",
        description: `${betterTiming.channel} uploads at ${betterTiming.time}, which may reach more viewers during peak hours.`,
        recommendation: `Consider adjusting your upload time to ${betterTiming.time} for better visibility.`,
        betterChannel: betterTiming.channel
      });
    }
    
    // Viral video insight
    if (channel1.viralVideos !== channel2.viralVideos) {
      const betterChannel = channel1.viralVideos > channel2.viralVideos ? "Channel 1" : "Channel 2";
      const diff = Math.abs(channel1.viralVideos - channel2.viralVideos);
      
      insights.push({
        title: "Viral Content",
        description: `${betterChannel} has ${diff} more viral videos, significantly boosting subscriber growth.`,
        recommendation: `Analyze your viral videos to understand what works, then create more content in that style.`,
        betterChannel
      });
    }
    
    // Engagement insight
    if (Math.abs(channel1.engagementRate - channel2.engagementRate) > 1) {
      const betterChannel = channel1.engagementRate > channel2.engagementRate ? "Channel 1" : "Channel 2";
      
      insights.push({
        title: "Audience Engagement",
        description: `${betterChannel} has a higher engagement rate (${Math.max(channel1.engagementRate, channel2.engagementRate).toFixed(2)}%), indicating stronger audience connection.`,
        recommendation: `Respond to comments within 2 hours of posting to boost engagement and improve recommendation chances.`,
        betterChannel
      });
    }
    
    // View count insight
    if (Math.abs(channel1.viewCount - channel2.viewCount) > 100000) {
      const betterChannel = channel1.viewCount > channel2.viewCount ? "Channel 1" : "Channel 2";
      const diff = Math.abs(channel1.viewCount - channel2.viewCount);
      
      insights.push({
        title: "View Count Advantage",
        description: `${betterChannel} has ${formatNumber(diff)} more total views, indicating stronger content reach.`,
        recommendation: `Analyze high-performing videos from the leading channel to understand successful content patterns.`,
        betterChannel
      });
    }
    
    // Subscriber count insight
    if (Math.abs(channel1.subscriberCount - channel2.subscriberCount) > 10000) {
      const betterChannel = channel1.subscriberCount > channel2.subscriberCount ? "Channel 1" : "Channel 2";
      const diff = Math.abs(channel1.subscriberCount - channel2.subscriberCount);
      
      insights.push({
        title: "Subscriber Base",
        description: `${betterChannel} has ${formatNumber(diff)} more subscribers, indicating stronger audience loyalty.`,
        recommendation: `Focus on consistent upload schedules and community engagement to build subscriber loyalty.`,
        betterChannel
      });
    }
    
    return insights;
  };

  // Enhanced tips for why channels get lots of views
  const getViewGrowthTips = (channel: ChannelData) => {
    const tips = [];
    
    // High view count
    if (channel.viewCount > 1000000) {
      tips.push({
        title: "Massive Reach",
        description: "This channel has over 1M total views, indicating strong content discovery and audience engagement.",
        tip: "Continue creating content that resonates with your audience and leverage social sharing to maintain growth."
      });
    }
    
    // High engagement rate
    if (channel.engagementRate > 10) {
      tips.push({
        title: "High Engagement",
        description: `With ${channel.engagementRate.toFixed(2)}% engagement rate, viewers actively interact with content.`,
        tip: "High engagement signals to YouTube's algorithm that your content is valuable, leading to better recommendations."
      });
    }
    
    // Consistent upload frequency
    if (channel.uploadFrequency.includes("times per week") && parseInt(channel.uploadFrequency) >= 3) {
      tips.push({
        title: "Consistent Publishing",
        description: `Publishing ${channel.uploadFrequency} keeps audience engaged and coming back for more.`,
        tip: "Consistency builds viewer expectations and improves your channel's visibility in YouTube's algorithm."
      });
    }
    
    // Viral videos
    if (channel.viralVideos > 5) {
      tips.push({
        title: "Viral Content Strategy",
        description: `${channel.viralVideos} viral videos have significantly boosted channel visibility.`,
        tip: "Analyze what made these videos successful (titles, thumbnails, topics) and replicate those elements."
      });
    }
    
    // High view per video ratio
    if (channel.videoCount > 0 && (channel.viewCount / channel.videoCount) > 50000) {
      tips.push({
        title: "High-Quality Content",
        description: "Average views per video exceed 50K, indicating strong content quality and audience retention.",
        tip: "Focus on production value, storytelling, and addressing audience pain points to maintain high view rates."
      });
    }
    
    return tips;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Channel Comparison
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Compare YouTube channels side by side with real-time analytics
            </p>
          </div>

          {/* Channel Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Channel 1 Selection */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Users className="h-8 w-8 text-blue-400" />
                  <h3 className="text-xl font-bold text-white">Channel 1</h3>
                </div>
                <Input
                  placeholder="Enter Channel ID or URL"
                  value={channel1Id}
                  onChange={(e) => setChannel1Id(e.target.value)}
                  className="bg-white/10 border-white/30 text-white placeholder-gray-400 mb-4"
                />
                <Button
                  onClick={handleCompare}
                  disabled={isLoading || !channel1Id.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                  Load Channel
                </Button>
              </CardContent>
            </Card>

            {/* Channel 2 Selection */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Users className="h-8 w-8 text-purple-400" />
                  <h3 className="text-xl font-bold text-white">Channel 2</h3>
                </div>
                <Input
                  placeholder="Enter Channel ID or URL"
                  value={channel2Id}
                  onChange={(e) => setChannel2Id(e.target.value)}
                  className="bg-white/10 border-white/30 text-white placeholder-gray-400 mb-4"
                />
                <Button
                  onClick={handleCompare}
                  disabled={isLoading || !channel2Id.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                  Load Channel
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Compare Button */}
          <div className="text-center">
            <Button
              onClick={handleCompare}
              disabled={isLoading || !channel1Id.trim() || !channel2Id.trim()}
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-8 py-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Comparing Channels...
                </>
              ) : (
                <>
                  <GitCompare className="h-5 w-5 mr-2" />
                  Compare Channels
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Comparison Results */}
      {comparisonData && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Winner Banner */}
          <Card className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-lg border-yellow-500/30 mb-8">
            <CardContent className="p-6 text-center">
              <Crown className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">
                🏆 {calculateChannelScore(comparisonData.channel1).totalScore > calculateChannelScore(comparisonData.channel2).totalScore 
                     ? comparisonData.channel1.title 
                     : comparisonData.channel2.title} Wins!
              </h2>
              <p className="text-gray-300">
                Leading with {Math.max(
                  calculateChannelScore(comparisonData.channel1).totalScore,
                  calculateChannelScore(comparisonData.channel2).totalScore
                )}% overall performance score
              </p>
            </CardContent>
          </Card>

          {/* Real-Time Analytics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300">
              <CardContent className="p-4 text-center">
                <Eye className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white mb-1">
                  {formatNumber(comparisonData.channel1.viewCount)}
                </div>
                <div className="text-sm text-gray-400 mb-2">vs</div>
                <div className="text-2xl font-bold text-white">
                  {formatNumber(comparisonData.channel2.viewCount)}
                </div>
                <div className="text-xs text-gray-300 mt-1">Total Views</div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white mb-1">
                  {formatNumber(comparisonData.channel1.subscriberCount)}
                </div>
                <div className="text-sm text-gray-400 mb-2">vs</div>
                <div className="text-2xl font-bold text-white">
                  {formatNumber(comparisonData.channel2.subscriberCount)}
                </div>
                <div className="text-xs text-gray-300 mt-1">Subscribers</div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white mb-1">
                  {comparisonData.channel1.engagementRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400 mb-2">vs</div>
                <div className="text-2xl font-bold text-white">
                  {comparisonData.channel2.engagementRate.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-300 mt-1">Engagement Rate</div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300">
              <CardContent className="p-4 text-center">
                <Zap className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white mb-1">
                  {comparisonData.channel1.viralVideos}
                </div>
                <div className="text-sm text-gray-400 mb-2">vs</div>
                <div className="text-2xl font-bold text-white">
                  {comparisonData.channel2.viralVideos}
                </div>
                <div className="text-xs text-gray-300 mt-1">Viral Videos</div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Analytics Section */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Performance Radar Chart */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <BarChart3 className="h-6 w-6 mr-2 text-blue-400" />
                  Performance Comparison
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={getRadarData()}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                      <Radar
                        name="Channel 1"
                        dataKey="channel1"
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Radar
                        name="Channel 2"
                        dataKey="channel2"
                        stroke="#8B5CF6"
                        fill="#8B5CF6"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Growth Trends */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <TrendingUp className="h-6 w-6 mr-2 text-green-400" />
                  Weekly Growth Trends
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getComparisonChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="day" tick={{ fill: '#9CA3AF' }} />
                      <YAxis tick={{ fill: '#9CA3AF' }} />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="channel1Views" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        name="Channel 1 Views"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="channel2Views" 
                        stroke="#8B5CF6" 
                        strokeWidth={3}
                        name="Channel 2 Views"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Channel Comparison Cards */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Channel 1 Details */}
            <Card className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 backdrop-blur-lg border-blue-500/30">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-6">
                  {comparisonData.channel1.thumbnail && (
                    <img 
                      src={comparisonData.channel1.thumbnail}
                      alt={comparisonData.channel1.title}
                      className="w-16 h-16 rounded-full border-2 border-blue-400"
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-white">{comparisonData.channel1.title}</h3>
                    <Badge className="bg-blue-600/20 text-blue-300 border-blue-400">Channel 1</Badge>
                  </div>
                </div>

                {/* Performance Score */}
                <div className="bg-white/10 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Performance Score</span>
                    <span className="text-2xl font-bold text-white">
                      {calculateChannelScore(comparisonData.channel1).totalScore}/100
                    </span>
                  </div>
                  <Progress 
                    value={calculateChannelScore(comparisonData.channel1).totalScore} 
                    className="h-3 bg-gray-700"
                  />
                </div>

                {/* Quick Stats */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-green-400" />
                      <span className="text-gray-300">Est. Revenue</span>
                    </div>
                    <span className="text-white font-bold">{formatCurrency(comparisonData.channel1.revenue || 0)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-orange-400" />
                      <span className="text-gray-300">Avg Watch Time</span>
                    </div>
                    <span className="text-white font-bold">{comparisonData.channel1.avgWatchTime || 'N/A'}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-blue-400" />
                      <span className="text-gray-300">Upload Frequency</span>
                    </div>
                    <span className="text-white font-bold">{comparisonData.channel1.uploadFrequency} per week</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      {getGrowthIcon(comparisonData.channel1.monthlyGrowth || 0)}
                      <span className="text-gray-300">Monthly Growth</span>
                    </div>
                    <span className={`font-bold ${comparisonData.channel1.monthlyGrowth && comparisonData.channel1.monthlyGrowth > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {comparisonData.channel1.monthlyGrowth?.toFixed(1) || 0}%
                    </span>
                  </div>
                </div>

                {/* Top Keywords */}
                {comparisonData.channel1.topKeywords && (
                  <div className="mt-6">
                    <h4 className="text-white font-medium mb-3">Top Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {comparisonData.channel1.topKeywords.slice(0, 6).map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-blue-600/20 text-blue-300 border-blue-400">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Channel 2 Details */}
            <Card className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 backdrop-blur-lg border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-6">
                  {comparisonData.channel2.thumbnail && (
                    <img 
                      src={comparisonData.channel2.thumbnail}
                      alt={comparisonData.channel2.title}
                      className="w-16 h-16 rounded-full border-2 border-purple-400"
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-white">{comparisonData.channel2.title}</h3>
                    <Badge className="bg-purple-600/20 text-purple-300 border-purple-400">Channel 2</Badge>
                  </div>
                </div>

                {/* Performance Score */}
                <div className="bg-white/10 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Performance Score</span>
                    <span className="text-2xl font-bold text-white">
                      {calculateChannelScore(comparisonData.channel2).totalScore}/100
                    </span>
                  </div>
                  <Progress 
                    value={calculateChannelScore(comparisonData.channel2).totalScore} 
                    className="h-3 bg-gray-700"
                  />
                </div>

                {/* Quick Stats */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-green-400" />
                      <span className="text-gray-300">Est. Revenue</span>
                    </div>
                    <span className="text-white font-bold">{formatCurrency(comparisonData.channel2.revenue || 0)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-orange-400" />
                      <span className="text-gray-300">Avg Watch Time</span>
                    </div>
                    <span className="text-white font-bold">{comparisonData.channel2.avgWatchTime || 'N/A'}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-purple-400" />
                      <span className="text-gray-300">Upload Frequency</span>
                    </div>
                    <span className="text-white font-bold">{comparisonData.channel2.uploadFrequency} per week</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      {getGrowthIcon(comparisonData.channel2.monthlyGrowth || 0)}
                      <span className="text-gray-300">Monthly Growth</span>
                    </div>
                    <span className={`font-bold ${comparisonData.channel2.monthlyGrowth && comparisonData.channel2.monthlyGrowth > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {comparisonData.channel2.monthlyGrowth?.toFixed(1) || 0}%
                    </span>
                  </div>
                </div>

                {/* Top Keywords */}
                {comparisonData.channel2.topKeywords && (
                  <div className="mt-6">
                    <h4 className="text-white font-medium mb-3">Top Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {comparisonData.channel2.topKeywords.slice(0, 6).map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-purple-600/20 text-purple-300 border-purple-400">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Best Performing Videos Comparison */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {comparisonData.channel1.bestPerformingVideo && (
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <Star className="h-5 w-5 mr-2 text-yellow-400" />
                    Best Video - Channel 1
                  </h3>
                  <div className="space-y-4">
                    <h4 className="text-white font-medium line-clamp-2">
                      {comparisonData.channel1.bestPerformingVideo.title}
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-blue-600/20 rounded-lg p-3">
                        <Eye className="h-6 w-6 text-blue-400 mx-auto mb-1" />
                        <div className="text-white font-bold">
                          {formatNumber(comparisonData.channel1.bestPerformingVideo.viewCount)}
                        </div>
                        <div className="text-xs text-gray-400">Views</div>
                      </div>
                      <div className="bg-green-600/20 rounded-lg p-3">
                        <ThumbsUp className="h-6 w-6 text-green-400 mx-auto mb-1" />
                        <div className="text-white font-bold">
                          {formatNumber(comparisonData.channel1.bestPerformingVideo.likeCount)}
                        </div>
                        <div className="text-xs text-gray-400">Likes</div>
                      </div>
                      <div className="bg-purple-600/20 rounded-lg p-3">
                        <MessageCircle className="h-6 w-6 text-purple-400 mx-auto mb-1" />
                        <div className="text-white font-bold">
                          {formatNumber(comparisonData.channel1.bestPerformingVideo.commentCount)}
                        </div>
                        <div className="text-xs text-gray-400">Comments</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {comparisonData.channel2.bestPerformingVideo && (
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <Star className="h-5 w-5 mr-2 text-yellow-400" />
                    Best Video - Channel 2
                  </h3>
                  <div className="space-y-4">
                    <h4 className="text-white font-medium line-clamp-2">
                      {comparisonData.channel2.bestPerformingVideo.title}
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-blue-600/20 rounded-lg p-3">
                        <Eye className="h-6 w-6 text-blue-400 mx-auto mb-1" />
                        <div className="text-white font-bold">
                          {formatNumber(comparisonData.channel2.bestPerformingVideo.viewCount)}
                        </div>
                        <div className="text-xs text-gray-400">Views</div>
                      </div>
                      <div className="bg-green-600/20 rounded-lg p-3">
                        <ThumbsUp className="h-6 w-6 text-green-400 mx-auto mb-1" />
                        <div className="text-white font-bold">
                          {formatNumber(comparisonData.channel2.bestPerformingVideo.likeCount)}
                        </div>
                        <div className="text-xs text-gray-400">Likes</div>
                      </div>
                      <div className="bg-purple-600/20 rounded-lg p-3">
                        <MessageCircle className="h-6 w-6 text-purple-400 mx-auto mb-1" />
                        <div className="text-white font-bold">
                          {formatNumber(comparisonData.channel2.bestPerformingVideo.commentCount)}
                        </div>
                        <div className="text-xs text-gray-400">Comments</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Actionable Insights */}
          <Card className="bg-gradient-to-r from-emerald-600/10 to-teal-600/10 backdrop-blur-lg border-emerald-500/30">
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Lightbulb className="h-6 w-6 mr-2 text-yellow-400" />
                Actionable Insights & Growth Tips
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-blue-600/10 rounded-lg p-4 border border-blue-500/30">
                    <h4 className="font-bold text-white mb-2 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-blue-400" />
                      Content Strategy
                    </h4>
                    <p className="text-gray-300 text-sm mb-3">
                      The leading channel uploads {Math.max(
                        parseInt(comparisonData.channel1.uploadFrequency) || 0,
                        parseInt(comparisonData.channel2.uploadFrequency) || 0
                      )} times per week.
                      Consider matching this frequency for better audience retention.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">Consistency</Badge>
                      <Badge variant="outline" className="text-xs">Schedule</Badge>
                    </div>
                  </div>

                  <div className="bg-purple-600/10 rounded-lg p-4 border border-purple-500/30">
                    <h4 className="font-bold text-white mb-2 flex items-center">
                      <Target className="h-5 w-5 mr-2 text-purple-400" />
                      Engagement Focus
                    </h4>
                    <p className="text-gray-300 text-sm mb-3">
                      Channel with {Math.max(comparisonData.channel1.engagementRate, comparisonData.channel2.engagementRate).toFixed(1)}% 
                      engagement actively responds to comments and creates community posts.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">Community</Badge>
                      <Badge variant="outline" className="text-xs">Interaction</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-yellow-600/10 rounded-lg p-4 border border-yellow-500/30">
                    <h4 className="font-bold text-white mb-2 flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-yellow-400" />
                      Viral Potential
                    </h4>
                    <p className="text-gray-300 text-sm mb-3">
                      Analyze trending topics and optimize thumbnails. The top performer has {Math.max(comparisonData.channel1.viralVideos, comparisonData.channel2.viralVideos)} viral videos.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">Trends</Badge>
                      <Badge variant="outline" className="text-xs">Optimization</Badge>
                    </div>
                  </div>

                  <div className="bg-green-600/10 rounded-lg p-4 border border-green-500/30">
                    <h4 className="font-bold text-white mb-2 flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-green-400" />
                      Monetization
                    </h4>
                    <p className="text-gray-300 text-sm mb-3">
                      Focus on longer videos and sponsorships. Top earner generates approximately {formatCurrency(Math.max(comparisonData.channel1.revenue || 0, comparisonData.channel2.revenue || 0))} monthly.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">Revenue</Badge>
                      <Badge variant="outline" className="text-xs">Sponsorships</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ChannelComparisonPage;