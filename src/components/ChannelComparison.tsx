import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Video, 
  Eye, 
  ThumbsUp, 
  TrendingUp, 
  TrendingDown,
  BarChart3, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Award,
  Zap,
  Target,
  Flame
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts';
import { YouTubeChannel, YouTubeVideo } from "@/types/youtube";
import { useToast } from "@/hooks/use-toast";
import youtubeService from "@/services/youtubeService";

interface ChannelComparisonProps {
  channels: YouTubeChannel[];
  onChannelCompare: (channelId: string) => Promise<void>;
}

interface ComparisonResult {
  channelId: string;
  title: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  engagementRate: number;
  growthRate: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  thumbnailUrl?: string;
  videos?: YouTubeVideo[];
  publishedAt?: string;
}

export const ChannelComparison = ({ channels, onChannelCompare }: ChannelComparisonProps) => {
  const [channelId, setChannelId] = useState("");
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

  const handleCompare = async () => {
    if (!channelId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a channel ID or URL",
        variant: "destructive"
      });
      return;
    }

    const extractedId = extractChannelId(channelId);
    if (!extractedId) {
      toast({
        title: "Error",
        description: "Invalid channel ID or URL. Please enter a valid YouTube channel ID or URL.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Fetch real competitor channel data
      const competitorChannel = await youtubeService.getChannelDetails(extractedId);
      const competitorVideos = await youtubeService.getChannelVideos(extractedId, 50);
      
      // Calculate real engagement rate for competitor
      const competitorEngagementRate = calculateChannelEngagementRate(competitorVideos);
      
      // Calculate real growth rate (simplified - based on recent vs older videos performance)
      const competitorGrowthRate = calculateGrowthRate(competitorVideos);
      
      // Generate real comparison results
      const realResults: ComparisonResult[] = [
        {
          channelId: extractedId,
          title: competitorChannel.title,
          subscriberCount: competitorChannel.subscriberCount,
          videoCount: competitorChannel.videoCount,
          viewCount: competitorChannel.viewCount,
          engagementRate: competitorEngagementRate,
          growthRate: competitorGrowthRate,
          thumbnailUrl: competitorChannel.thumbnailUrl,
          videos: competitorVideos,
          publishedAt: competitorChannel.publishedAt,
          strengths: generateStrengths(competitorChannel, competitorVideos, competitorEngagementRate),
          weaknesses: generateWeaknesses(competitorChannel, competitorVideos, competitorEngagementRate),
          recommendations: generateRecommendations(competitorChannel, competitorVideos, competitorEngagementRate)
        },
        // Add user's channels with real data
        ...await Promise.all(channels.map(async (channel) => {
          try {
            const channelVideos = await youtubeService.getChannelVideos(channel.channelId, 50);
            const engagementRate = calculateChannelEngagementRate(channelVideos);
            const growthRate = calculateGrowthRate(channelVideos);
            
            return {
              channelId: channel.channelId,
              title: channel.title,
              subscriberCount: channel.subscriberCount,
              videoCount: channel.videoCount,
              viewCount: channel.viewCount,
              engagementRate,
              growthRate,
              thumbnailUrl: channel.thumbnailUrl,
              videos: channelVideos,
              publishedAt: channel.publishedAt,
              strengths: generateStrengths(channel, channelVideos, engagementRate),
              weaknesses: generateWeaknesses(channel, channelVideos, engagementRate),
              recommendations: generateRecommendations(channel, channelVideos, engagementRate)
            };
          } catch (error) {
            console.error(`Error fetching data for channel ${channel.channelId}:`, error);
            // Fallback to basic channel data
            return {
              channelId: channel.channelId,
              title: channel.title,
              subscriberCount: channel.subscriberCount,
              videoCount: channel.videoCount,
              viewCount: channel.viewCount,
              engagementRate: 0,
              growthRate: 0,
              thumbnailUrl: channel.thumbnailUrl,
              videos: [],
              publishedAt: channel.publishedAt,
              strengths: ["Channel established"],
              weaknesses: ["Data unavailable"],
              recommendations: ["Refresh data"]
            };
          }
        }))
      ];
      
      setComparisonResults(realResults);
      
      toast({
        title: "Success",
        description: "Channel comparison completed with real-time data",
      });
      
    } catch (error) {
      console.error("Error comparing channels:", error);
      toast({
        title: "Error",
        description: "Failed to compare channels. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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

  // Real-time calculation functions
  const calculateEngagementRate = (video: YouTubeVideo): number => {
    const views = parseInt(video.statistics?.viewCount || "0");
    const likes = parseInt(video.statistics?.likeCount || "0");
    const comments = parseInt(video.statistics?.commentCount || "0");
    
    if (views === 0) return 0;
    return ((likes + comments) / views) * 100;
  };

  const calculateChannelEngagementRate = (videos: YouTubeVideo[]): number => {
    if (videos.length === 0) return 0;
    const totalEngagement = videos.reduce((sum, video) => sum + calculateEngagementRate(video), 0);
    return totalEngagement / videos.length;
  };

  const calculateGrowthRate = (videos: YouTubeVideo[]): number => {
    if (videos.length < 2) return 0;
    
    // Sort videos by date
    const sortedVideos = [...videos].sort((a, b) => 
      new Date(a.snippet.publishedAt).getTime() - new Date(b.snippet.publishedAt).getTime()
    );
    
    const recentVideos = sortedVideos.slice(-5); // Last 5 videos
    const olderVideos = sortedVideos.slice(0, 5); // First 5 videos
    
    const recentAvgViews = recentVideos.reduce((sum, video) => 
      sum + parseInt(video.statistics?.viewCount || "0"), 0) / recentVideos.length;
    const olderAvgViews = olderVideos.reduce((sum, video) => 
      sum + parseInt(video.statistics?.viewCount || "0"), 0) / olderVideos.length;
    
    if (olderAvgViews === 0) return 0;
    return ((recentAvgViews - olderAvgViews) / olderAvgViews) * 100;
  };

  const generateStrengths = (channel: YouTubeChannel, videos: YouTubeVideo[], engagementRate: number): string[] => {
    const strengths = [];
    
    if (channel.subscriberCount > 100000) {
      strengths.push("Strong subscriber base");
    }
    if (engagementRate > 5) {
      strengths.push("High engagement rate");
    }
    if (videos.length > 100) {
      strengths.push("Consistent content creation");
    }
    
    const avgViews = videos.length > 0 ? 
      videos.reduce((sum, video) => sum + parseInt(video.statistics?.viewCount || "0"), 0) / videos.length : 0;
    
    if (avgViews > 50000) {
      strengths.push("Good average view count");
    }
    
    return strengths.length > 0 ? strengths : ["Active channel"];
  };

  const generateWeaknesses = (channel: YouTubeChannel, videos: YouTubeVideo[], engagementRate: number): string[] => {
    const weaknesses = [];
    
    if (channel.subscriberCount < 10000) {
      weaknesses.push("Limited subscriber base");
    }
    if (engagementRate < 2) {
      weaknesses.push("Low engagement rate");
    }
    if (videos.length < 50) {
      weaknesses.push("Limited content library");
    }
    
    const avgViews = videos.length > 0 ? 
      videos.reduce((sum, video) => sum + parseInt(video.statistics?.viewCount || "0"), 0) / videos.length : 0;
    
    if (avgViews < 5000) {
      weaknesses.push("Low average view count");
    }
    
    return weaknesses.length > 0 ? weaknesses : ["Room for growth"];
  };

  const generateRecommendations = (channel: YouTubeChannel, videos: YouTubeVideo[], engagementRate: number): string[] => {
    const recommendations = [];
    
    if (channel.subscriberCount < 50000) {
      recommendations.push("Focus on subscriber growth strategies");
    }
    if (engagementRate < 3) {
      recommendations.push("Improve content engagement");
    }
    if (videos.length < 100) {
      recommendations.push("Increase upload frequency");
    }
    
    const avgViews = videos.length > 0 ? 
      videos.reduce((sum, video) => sum + parseInt(video.statistics?.viewCount || "0"), 0) / videos.length : 0;
    
    if (avgViews < 10000) {
      recommendations.push("Optimize titles and thumbnails");
    }
    
    return recommendations.length > 0 ? recommendations : ["Continue current strategy"];
  };

  const getComparisonChartData = () => {
    if (comparisonResults.length === 0) return [];
    
    return comparisonResults.map(result => ({
      name: result.title.substring(0, 15) + "...",
      subscribers: result.subscriberCount / 1000, // Convert to thousands for better chart scale
      videos: result.videoCount,
      avgViews: result.viewCount / result.videoCount / 1000, // Average views per video in thousands
      engagement: result.engagementRate,
      growth: result.growthRate,
      isOwn: result.channelId !== comparisonResults[0]?.channelId
    }));
  };

  const getRadarChartData = () => {
    if (comparisonResults.length === 0) return [];
    
    return comparisonResults.map(result => ({
      channel: result.title.substring(0, 10),
      subscribers: Math.min(100, (result.subscriberCount / 1000000) * 100), // Normalize to 0-100
      videoCount: Math.min(100, (result.videoCount / 1000) * 100), // Normalize to 0-100
      engagement: Math.min(100, result.engagementRate * 10), // Normalize to 0-100
      growth: Math.min(100, Math.max(0, result.growthRate + 50)), // Normalize -50 to +50 -> 0-100
      avgViews: Math.min(100, (result.viewCount / result.videoCount / 100000) * 100), // Normalize to 0-100
      isOwn: result.channelId !== comparisonResults[0]?.channelId
    }));
  };

  const getPerformanceScore = (result: ComparisonResult): number => {
    const subscriberScore = Math.min(100, (result.subscriberCount / 1000000) * 20);
    const engagementScore = Math.min(100, result.engagementRate * 10);
    const growthScore = Math.min(100, Math.max(0, result.growthRate + 50));
    const consistencyScore = Math.min(100, (result.videoCount / 500) * 20);
    
    return Math.round((subscriberScore + engagementScore + growthScore + consistencyScore) / 4);
  };

  const getDetailedPerformanceAnalysis = (result: ComparisonResult) => {
    // Views Score (0-20)
    const avgViews = result.viewCount / result.videoCount;
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

    // Subscribers Score (0-20)
    let subscribersScore = 0;
    if (result.subscriberCount > 10000000) subscribersScore = 20;
    else if (result.subscriberCount > 5000000) subscribersScore = 18;
    else if (result.subscriberCount > 1000000) subscribersScore = 16;
    else if (result.subscriberCount > 500000) subscribersScore = 14;
    else if (result.subscriberCount > 100000) subscribersScore = 12;
    else if (result.subscriberCount > 50000) subscribersScore = 10;
    else if (result.subscriberCount > 10000) subscribersScore = 8;
    else if (result.subscriberCount > 5000) subscribersScore = 6;
    else if (result.subscriberCount > 1000) subscribersScore = 4;
    else if (result.subscriberCount > 0) subscribersScore = 2;

    // Engagement Score (0-20)
    let engagementScore = 0;
    if (result.engagementRate > 10) engagementScore = 20;
    else if (result.engagementRate > 8) engagementScore = 18;
    else if (result.engagementRate > 6) engagementScore = 16;
    else if (result.engagementRate > 4) engagementScore = 14;
    else if (result.engagementRate > 3) engagementScore = 12;
    else if (result.engagementRate > 2) engagementScore = 10;
    else if (result.engagementRate > 1.5) engagementScore = 8;
    else if (result.engagementRate > 1) engagementScore = 6;
    else if (result.engagementRate > 0.5) engagementScore = 4;
    else if (result.engagementRate > 0) engagementScore = 2;

    // Consistency Score (0-20) - based on video count and growth rate
    let consistencyScore = 0;
    if (result.videoCount > 1000) consistencyScore = 20;
    else if (result.videoCount > 500) consistencyScore = 18;
    else if (result.videoCount > 200) consistencyScore = 16;
    else if (result.videoCount > 100) consistencyScore = 14;
    else if (result.videoCount > 50) consistencyScore = 12;
    else if (result.videoCount > 20) consistencyScore = 10;
    else if (result.videoCount > 10) consistencyScore = 8;
    else if (result.videoCount > 5) consistencyScore = 6;
    else if (result.videoCount > 0) consistencyScore = 4;

    // Viral Potential Score (0-20) - based on average views and growth
    let viralPotentialScore = 0;
    const viewsPerSub = result.subscriberCount > 0 ? avgViews / result.subscriberCount : 0;
    
    if (avgViews > 1000000) viralPotentialScore += 8;
    else if (avgViews > 500000) viralPotentialScore += 6;
    else if (avgViews > 100000) viralPotentialScore += 4;
    else if (avgViews > 50000) viralPotentialScore += 2;
    
    if (viewsPerSub > 0.5) viralPotentialScore += 6;
    else if (viewsPerSub > 0.3) viralPotentialScore += 4;
    else if (viewsPerSub > 0.1) viralPotentialScore += 2;
    
    if (result.growthRate > 50) viralPotentialScore += 6;
    else if (result.growthRate > 20) viralPotentialScore += 4;
    else if (result.growthRate > 0) viralPotentialScore += 2;

    viralPotentialScore = Math.min(20, viralPotentialScore);

    return {
      viewsScore,
      subscribersScore,
      engagementScore,
      consistencyScore,
      viralPotentialScore,
      totalScore: viewsScore + subscribersScore + engagementScore + consistencyScore + viralPotentialScore,
      avgViews: Math.round(avgViews),
      viewsPerSub: viewsPerSub.toFixed(3)
    };
  };

  const getWinnerAnalysis = () => {
    if (comparisonResults.length < 2) return null;
    
    const analyses = comparisonResults.map(result => ({
      ...result,
      analysis: getDetailedPerformanceAnalysis(result)
    }));
    
    const winner = analyses.reduce((best, current) => 
      current.analysis.totalScore > best.analysis.totalScore ? current : best
    );
    
    const reasons = [];
    const tips = [];
    
    if (winner.analysis.viewsScore >= 16) {
      reasons.push("Exceptional average views per video");
    }
    if (winner.analysis.subscribersScore >= 16) {
      reasons.push("Massive subscriber base");
    }
    if (winner.analysis.engagementScore >= 14) {
      reasons.push("Outstanding audience engagement");
    }
    if (winner.analysis.consistencyScore >= 16) {
      reasons.push("Consistent content production");
    }
    if (winner.analysis.viralPotentialScore >= 12) {
      reasons.push("High viral content potential");
    }
    
    // Generate tips for non-winners
    analyses.forEach(result => {
      if (result.channelId !== winner.channelId) {
        if (result.analysis.viewsScore < winner.analysis.viewsScore) {
          tips.push("Improve thumbnails and titles to increase views");
        }
        if (result.analysis.engagementScore < winner.analysis.engagementScore) {
          tips.push("Focus on creating more engaging content that encourages likes and comments");
        }
        if (result.analysis.consistencyScore < winner.analysis.consistencyScore) {
          tips.push("Upload content more consistently");
        }
      }
    });
    
    return {
      winner,
      reasons: reasons.slice(0, 3),
      tips: [...new Set(tips)].slice(0, 3)
    };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Channel Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="channelInput">Compare with another channel</Label>
              <div className="flex gap-2">
                <Input
                  id="channelInput"
                  placeholder="Enter YouTube channel ID or URL"
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleCompare} 
                  disabled={isLoading}
                >
                  {isLoading ? "Comparing..." : "Compare"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter a YouTube channel ID (e.g., UC_x5XG1OV2P6uZZ5FSM9Ttw) or URL to compare with your channels
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {comparisonResults.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Channel Comparison Analysis
          </h3>
          
          {/* Visual Comparison Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Key Metrics Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getComparisonChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#9CA3AF"
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        formatter={(value: number | string, name: string) => {
                          const num = Number(value) || 0;
                          if (name === 'subscribers') return [`${(num * 1000).toLocaleString()}`, 'Subscribers'];
                          if (name === 'avgViews') return [`${(num * 1000).toLocaleString()}`, 'Avg Views'];
                          if (name === 'engagement') return [`${num}%`, 'Engagement Rate'];
                          return [String(value), name];
                        }}
                      />
                      <Bar dataKey="subscribers" fill="#3B82F6" name="subscribers" />
                      <Bar dataKey="engagement" fill="#10B981" name="engagement" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Performance Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={getRadarChartData()}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis dataKey="channel" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                      <PolarRadiusAxis 
                        angle={60} 
                        domain={[0, 100]} 
                        tick={{ fontSize: 10, fill: '#9CA3AF' }}
                      />
                      <Radar
                        name="Your Channel"
                        dataKey="engagement"
                        stroke="#10B981"
                        fill="#10B981"
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                      <Radar
                        name="Competitor"
                        dataKey="subscribers"
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.1}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Overall Performance Score Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {comparisonResults.map((result, index) => {
              const analysis = getDetailedPerformanceAnalysis(result);
              const isCompetitor = index === 0;
              
              return (
                <Card key={index} className={`glass-card border-0 ${isCompetitor ? 'bg-gradient-to-br from-orange-500/5 to-red-500/5' : 'bg-gradient-to-br from-green-500/5 to-blue-500/5'}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-6 w-6" />
                      Overall Performance Score
                      <div className="ml-auto">
                        {isCompetitor ? (
                          <Badge variant="destructive" className="gap-1">
                            <Target className="h-3 w-3" />
                            Competitor
                          </Badge>
                        ) : (
                          <Badge variant="default" className="gap-1">
                            <Award className="h-3 w-3" />
                            Your Channel
                          </Badge>
                        )}
                      </div>
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">{result.title}</div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Total Score Display */}
                      <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
                        <div className="text-4xl font-bold text-primary mb-2">
                          {analysis.totalScore}/100
                        </div>
                        <div className="text-lg font-medium">
                          {analysis.totalScore > 80 ? 'Excellent Channel' : 
                           analysis.totalScore > 60 ? 'Good Performance' : 
                           analysis.totalScore > 40 ? 'Average Channel' : 'Needs Improvement'}
                        </div>
                      </div>

                      {/* Score Breakdown */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">Views</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">{analysis.viewsScore}/20</span>
                            <div className="w-20 bg-secondary rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                                style={{ width: `${(analysis.viewsScore / 20) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground ml-6">
                          Avg: {formatNumber(analysis.avgViews)} views per video
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">Subscribers</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">{analysis.subscribersScore}/20</span>
                            <div className="w-20 bg-secondary rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                                style={{ width: `${(analysis.subscribersScore / 20) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground ml-6">
                          Total: {formatNumber(result.subscriberCount)} subscribers
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium">Engagement</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">{analysis.engagementScore}/20</span>
                            <div className="w-20 bg-secondary rounded-full h-2">
                              <div 
                                className="bg-yellow-500 h-2 rounded-full transition-all duration-500" 
                                style={{ width: `${(analysis.engagementScore / 20) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground ml-6">
                          Rate: {result.engagementRate.toFixed(2)}%
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-purple-500" />
                            <span className="text-sm font-medium">Consistency</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">{analysis.consistencyScore}/20</span>
                            <div className="w-20 bg-secondary rounded-full h-2">
                              <div 
                                className="bg-purple-500 h-2 rounded-full transition-all duration-500" 
                                style={{ width: `${(analysis.consistencyScore / 20) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground ml-6">
                          Videos: {result.videoCount} total
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-red-500" />
                            <span className="text-sm font-medium">Viral Potential</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">{analysis.viralPotentialScore}/20</span>
                            <div className="w-20 bg-secondary rounded-full h-2">
                              <div 
                                className="bg-red-500 h-2 rounded-full transition-all duration-500" 
                                style={{ width: `${(analysis.viralPotentialScore / 20) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground ml-6">
                          Views/Sub Ratio: {analysis.viewsPerSub}
                        </p>
                      </div>

                      {/* Key Performance Insights */}
                      <div className="border-t pt-4">
                        <h4 className="font-semibold mb-3 text-sm">Key Performance Insights</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${analysis.totalScore > 70 ? 'bg-green-500' : analysis.totalScore > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                            <span>Overall performance: {analysis.totalScore > 70 ? 'Strong' : analysis.totalScore > 40 ? 'Moderate' : 'Weak'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${analysis.viewsScore > 15 ? 'bg-green-500' : analysis.viewsScore > 10 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                            <span>View performance: {analysis.viewsScore > 15 ? 'Excellent' : analysis.viewsScore > 10 ? 'Good' : 'Needs improvement'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${result.growthRate > 10 ? 'bg-green-500' : result.growthRate > 0 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                            <span>Growth trend: {result.growthRate > 10 ? 'Rapid growth' : result.growthRate > 0 ? 'Steady growth' : 'Declining'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Winner Analysis */}
          {(() => {
            const winnerAnalysis = getWinnerAnalysis();
            if (!winnerAnalysis) return null;
            
            return (
              <Card className="glass-card border-0 bg-gradient-to-r from-primary/5 to-accent/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-6 w-6 text-primary" />
                    Winner Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-lg flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        Top Performer: {winnerAnalysis.winner.title}
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Award className="h-4 w-4 text-primary" />
                          <span className="font-medium">Overall Score: {winnerAnalysis.winner.analysis.totalScore}/100</span>
                        </div>
                        <div className="space-y-1">
                          <h5 className="font-medium text-sm">Why they're winning:</h5>
                          <ul className="space-y-1">
                            {winnerAnalysis.reasons.map((reason, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <div className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 text-lg flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-500" />
                        Improvement Strategies
                      </h4>
                      <div className="space-y-1">
                        <h5 className="font-medium text-sm">Action items:</h5>
                        <ul className="space-y-1">
                          {winnerAnalysis.tips.map((tip, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {/* Enhanced Channel Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {comparisonResults.map((result, index) => {
              const performanceScore = getPerformanceScore(result);
              const isCompetitor = index === 0;
              
              return (
                <Card key={index} className={`${isCompetitor ? 'border-orange-500/50' : 'border-green-500/50'}`}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      <span className="truncate">{result.title}</span>
                      <div className="flex items-center gap-2">
                        {isCompetitor ? (
                          <Badge variant="destructive" className="gap-1">
                            <Target className="h-3 w-3" />
                            Competitor
                          </Badge>
                        ) : (
                          <Badge variant="default" className="gap-1">
                            <Award className="h-3 w-3" />
                            Your Channel
                          </Badge>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Performance Score */}
                      <div className="bg-secondary/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Overall Performance</span>
                          <span className="text-sm font-bold">{performanceScore}/100</span>
                        </div>
                        <Progress value={performanceScore} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {performanceScore > 80 ? 'Excellent' : performanceScore > 60 ? 'Good' : performanceScore > 40 ? 'Average' : 'Needs improvement'}
                        </p>
                      </div>

                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          <div>
                            <div className="font-medium">{formatNumber(result.subscriberCount)}</div>
                            <div className="text-xs text-muted-foreground">Subscribers</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4 text-primary" />
                          <div>
                            <div className="font-medium">{result.videoCount}</div>
                            <div className="text-xs text-muted-foreground">Videos</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-primary" />
                          <div>
                            <div className="font-medium">{formatNumber(Math.round(result.viewCount / result.videoCount))}</div>
                            <div className="text-xs text-muted-foreground">Avg Views</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-primary" />
                          <div>
                            <div className="font-medium">{result.engagementRate.toFixed(1)}%</div>
                            <div className="text-xs text-muted-foreground">Engagement</div>
                          </div>
                        </div>
                      </div>

                      {/* Growth Indicator */}
                      <div className="flex items-center gap-2 text-sm">
                        {result.growthRate > 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className={result.growthRate > 0 ? 'text-green-500' : 'text-red-500'}>
                          {result.growthRate > 0 ? '+' : ''}{result.growthRate.toFixed(1)}% growth rate
                        </span>
                      </div>

                      {/* Strengths & Weaknesses */}
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-sm flex items-center gap-1 mb-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Strengths
                          </h4>
                          <ul className="space-y-1">
                            {result.strengths.slice(0, 2).map((strength, i) => (
                              <li key={i} className="text-xs flex items-start gap-2">
                                <div className="w-1 h-1 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm flex items-center gap-1 mb-2">
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                            Improvement Areas
                          </h4>
                          <ul className="space-y-1">
                            {result.weaknesses.slice(0, 2).map((weakness, i) => (
                              <li key={i} className="text-xs flex items-start gap-2">
                                <div className="w-1 h-1 bg-yellow-500 rounded-full mt-1.5 flex-shrink-0" />
                                <span>{weakness}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm flex items-center gap-1 mb-2">
                            <TrendingUp className="h-4 w-4 text-blue-500" />
                            Recommendations
                          </h4>
                          <ul className="space-y-1">
                            {result.recommendations.slice(0, 2).map((rec, i) => (
                              <li key={i} className="text-xs flex items-start gap-2">
                                <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};