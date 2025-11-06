import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Youtube, 
  Eye, 
  ThumbsUp, 
  MessageCircle, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Heart, 
  MessageSquare, 
  Share2,
  Award,
  Flame,
  Hash,
  Tag,
  BarChart3,
  Target,
  Zap,
  PlayCircle,
  Timer,
  Globe
} from "lucide-react";
import { YouTubeVideo } from "@/types/youtube";

interface VideoDetailsModalProps {
  video: YouTubeVideo | null;
  isOpen: boolean;
  onClose: () => void;
}

const VideoDetailsModal = ({ video, isOpen, onClose }: VideoDetailsModalProps) => {
  const formatNumber = (num: string): string => {
    const number = parseInt(num);
    if (isNaN(number)) return "0";
    
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + 'M';
    }
    if (number >= 1000) {
      return (number / 1000).toFixed(1) + 'K';
    }
    return number.toString();
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

  const getViralIndicators = (video: YouTubeVideo) => {
    const indicators = [];
    const viewCount = parseInt(video.statistics?.viewCount || "0");
    const likeCount = parseInt(video.statistics?.likeCount || "0");
    const commentCount = parseInt(video.statistics?.commentCount || "0");
    
    // High view count
    if (viewCount > 100000) {
      indicators.push({ 
        icon: <Eye className="h-4 w-4" />, 
        text: "High view count", 
        description: "Over 100K views indicates strong audience reach" 
      });
    }
    
    // High engagement rate
    if (viewCount > 0 && (likeCount / viewCount) > 0.1) {
      indicators.push({ 
        icon: <Heart className="h-4 w-4" />, 
        text: "High engagement", 
        description: "Likes-to-views ratio above 10% shows strong audience interest" 
      });
    }
    
    // High comment count
    if (commentCount > 1000) {
      indicators.push({ 
        icon: <MessageSquare className="h-4 w-4" />, 
        text: "Active discussion", 
        description: "Over 1,000 comments indicate strong audience engagement" 
      });
    }
    
    // Rapid growth
    const publishedDate = new Date(video.snippet.publishedAt);
    const daysSincePublished = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSincePublished < 30 && viewCount > 50000) {
      indicators.push({ 
        icon: <TrendingUp className="h-4 w-4" />, 
        text: "Rapid growth", 
        description: "High views within 30 days of publishing" 
      });
    }
    
    return indicators;
  };

  const getViralScore = (video: YouTubeVideo) => {
    const viewCount = parseInt(video.statistics?.viewCount || "0");
    const likeCount = parseInt(video.statistics?.likeCount || "0");
    const commentCount = parseInt(video.statistics?.commentCount || "0");
    
    // Simple viral score calculation
    const engagementRate = viewCount > 0 ? (likeCount + commentCount) / viewCount : 0;
    const score = Math.min(100, Math.round((engagementRate * 500) + (viewCount / 1000)));
    
    if (score > 80) return { score, level: "Viral", color: "text-red-500" };
    if (score > 60) return { score, level: "Popular", color: "text-orange-500" };
    if (score > 40) return { score, level: "Moderate", color: "text-yellow-500" };
    return { score, level: "Low", color: "text-gray-500" };
  };

  const extractHashtags = (description: string): string[] => {
    if (!description) return [];
    const hashtagRegex = /#[\w]+/g;
    const hashtags = description.match(hashtagRegex) || [];
    return [...new Set(hashtags)].slice(0, 10); // Remove duplicates and limit to 10
  };

  const getVideoCategory = (video: YouTubeVideo): string => {
    // This would normally come from YouTube's category data
    // For now, we'll simulate category detection based on title/description
    const title = video.snippet.title.toLowerCase();
    const description = video.snippet.description?.toLowerCase() || "";
    
    if (title.includes('gaming') || title.includes('gameplay') || description.includes('gaming')) {
      return 'Gaming';
    } else if (title.includes('music') || title.includes('song') || description.includes('music')) {
      return 'Music';
    } else if (title.includes('tutorial') || title.includes('how to') || description.includes('tutorial')) {
      return 'Education';
    } else if (title.includes('vlog') || title.includes('daily') || description.includes('vlog')) {
      return 'Vlogs';
    } else if (title.includes('review') || description.includes('review')) {
      return 'Reviews';
    } else if (title.includes('comedy') || title.includes('funny') || description.includes('comedy')) {
      return 'Comedy';
    } else if (title.includes('tech') || title.includes('technology') || description.includes('tech')) {
      return 'Technology';
    } else if (title.includes('news') || description.includes('news')) {
      return 'News';
    } else if (title.includes('sports') || description.includes('sports')) {
      return 'Sports';
    } else {
      return 'Entertainment';
    }
  };

  const getEngagementMetrics = (video: YouTubeVideo) => {
    const viewCount = parseInt(video.statistics?.viewCount || "0");
    const likeCount = parseInt(video.statistics?.likeCount || "0");
    const commentCount = parseInt(video.statistics?.commentCount || "0");
    
    const likeRate = viewCount > 0 ? (likeCount / viewCount) * 100 : 0;
    const commentRate = viewCount > 0 ? (commentCount / viewCount) * 100 : 0;
    const totalEngagementRate = likeRate + commentRate;
    
    return {
      likeRate: Math.min(100, likeRate),
      commentRate: Math.min(100, commentRate),
      totalEngagementRate: Math.min(100, totalEngagementRate),
      viewsPerDay: getViewsPerDay(video),
      retentionEstimate: getRetentionEstimate(video)
    };
  };

  const getViewsPerDay = (video: YouTubeVideo): number => {
    const publishedDate = new Date(video.snippet.publishedAt);
    const daysSincePublished = Math.max(1, (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24));
    const viewCount = parseInt(video.statistics?.viewCount || "0");
    return Math.round(viewCount / daysSincePublished);
  };

  const getRetentionEstimate = (video: YouTubeVideo): number => {
    // Estimate retention based on engagement patterns
    const viewCount = parseInt(video.statistics?.viewCount || "0");
    const likeCount = parseInt(video.statistics?.likeCount || "0");
    const commentCount = parseInt(video.statistics?.commentCount || "0");
    
    // Higher engagement typically correlates with better retention
    const engagementScore = viewCount > 0 ? ((likeCount + commentCount * 3) / viewCount) * 100 : 0;
    return Math.min(100, Math.max(20, engagementScore * 10 + 30)); // Estimated retention percentage
  };

  const getPerformanceInsights = (video: YouTubeVideo) => {
    const insights = [];
    const viewCount = parseInt(video.statistics?.viewCount || "0");
    const likeCount = parseInt(video.statistics?.likeCount || "0");
    const commentCount = parseInt(video.statistics?.commentCount || "0");
    const publishedDate = new Date(video.snippet.publishedAt);
    const daysSincePublished = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Performance insights based on metrics
    if (viewCount > 100000) {
      insights.push({ icon: <Eye className="h-4 w-4" />, text: "High reach achieved", type: "success" });
    }
    
    if (likeCount / viewCount > 0.05) {
      insights.push({ icon: <Heart className="h-4 w-4" />, text: "Excellent like ratio", type: "success" });
    }
    
    if (commentCount > 1000) {
      insights.push({ icon: <MessageSquare className="h-4 w-4" />, text: "Strong community engagement", type: "success" });
    }
    
    if (daysSincePublished < 7 && viewCount > 10000) {
      insights.push({ icon: <TrendingUp className="h-4 w-4" />, text: "Fast initial growth", type: "success" });
    }
    
    if (viewCount < 1000 && daysSincePublished > 30) {
      insights.push({ icon: <Target className="h-4 w-4" />, text: "Consider optimizing title/thumbnail", type: "warning" });
    }
    
    return insights;
  };

  if (!video) return null;

  const viralIndicators = getViralIndicators(video);
  const viralScore = getViralScore(video);
  const hashtags = extractHashtags(video.snippet.description || "");
  const category = getVideoCategory(video);
  const engagementMetrics = getEngagementMetrics(video);
  const performanceInsights = getPerformanceInsights(video);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-start gap-3">
            <div className="bg-red-600 p-2 rounded-lg">
              <Youtube className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold line-clamp-2">{video.snippet.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-muted-foreground">{video.snippet.channelTitle}</p>
                <Badge variant="outline" className="gap-1">
                  <Tag className="h-3 w-3" />
                  {category}
                </Badge>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Video Thumbnail */}
          <div className="relative rounded-lg overflow-hidden">
            <img 
              src={video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url} 
              alt={video.snippet.title} 
              className="w-full aspect-video object-cover"
            />
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-sm px-2 py-1 rounded flex items-center gap-1">
              <PlayCircle className="h-3 w-3" />
              {formatDuration(video.contentDetails?.duration || "")}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-4 gap-4 py-4 border-y">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                <span className="font-semibold">{formatNumber(video.statistics?.viewCount || "0")}</span>
              </div>
              <p className="text-sm text-muted-foreground">Views</p>
              <p className="text-xs text-muted-foreground">{engagementMetrics.viewsPerDay}/day</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <ThumbsUp className="h-5 w-5 text-primary" />
                <span className="font-semibold">{formatNumber(video.statistics?.likeCount || "0")}</span>
              </div>
              <p className="text-sm text-muted-foreground">Likes</p>
              <p className="text-xs text-muted-foreground">{engagementMetrics.likeRate.toFixed(2)}% rate</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                <span className="font-semibold">{formatNumber(video.statistics?.commentCount || "0")}</span>
              </div>
              <p className="text-sm text-muted-foreground">Comments</p>
              <p className="text-xs text-muted-foreground">{engagementMetrics.commentRate.toFixed(2)}% rate</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <span className="font-semibold">{engagementMetrics.totalEngagementRate.toFixed(1)}%</span>
              </div>
              <p className="text-sm text-muted-foreground">Engagement</p>
              <p className="text-xs text-muted-foreground">Total rate</p>
            </div>
          </div>

          {/* Performance Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Viral Score & Engagement */}
            <div className="space-y-4">
              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-red-500" />
                    <span className="font-semibold">Viral Score</span>
                  </div>
                  <Badge variant="secondary" className={viralScore.color}>
                    {viralScore.score}/100 - {viralScore.level}
                  </Badge>
                </div>
                <Progress value={viralScore.score} className="h-2 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Based on engagement metrics and view velocity
                </p>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Engagement Breakdown</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Like Rate</span>
                      <span>{engagementMetrics.likeRate.toFixed(3)}%</span>
                    </div>
                    <Progress value={Math.min(100, engagementMetrics.likeRate * 20)} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Comment Rate</span>
                      <span>{engagementMetrics.commentRate.toFixed(3)}%</span>
                    </div>
                    <Progress value={Math.min(100, engagementMetrics.commentRate * 50)} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Est. Retention</span>
                      <span>{engagementMetrics.retentionEstimate.toFixed(1)}%</span>
                    </div>
                    <Progress value={engagementMetrics.retentionEstimate} className="h-2" />
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Insights */}
            <div className="space-y-4">
              {performanceInsights.length > 0 && (
                <div className="bg-secondary/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Performance Insights</span>
                  </div>
                  <div className="space-y-2">
                    {performanceInsights.map((insight, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className={`${insight.type === 'success' ? 'text-green-500' : 'text-yellow-500'}`}>
                          {insight.icon}
                        </div>
                        <span>{insight.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {hashtags.length > 0 && (
                <div className="bg-secondary/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Hash className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Hashtags Used</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {hashtags.map((hashtag, index) => (
                      <Badge key={index} variant="outline" className="gap-1">
                        <Hash className="h-3 w-3" />
                        {hashtag.substring(1)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Video Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Published {new Date(video.snippet.publishedAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <Timer className="h-4 w-4" />
                <span>Duration: {formatDuration(video.contentDetails?.duration || "")}</span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="h-4 w-4" />
                <span>Category: {category}</span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>Daily Views: {engagementMetrics.viewsPerDay.toLocaleString()}</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <div className="max-h-32 overflow-y-auto">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {video.snippet.description || "No description available"}
                </p>
              </div>
            </div>
          </div>

          {/* Viral Analysis */}
          {viralIndicators.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Why This Video Performed Well
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {viralIndicators.map((indicator, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                    <div className="mt-0.5 text-primary">
                      {indicator.icon}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{indicator.text}</p>
                      <p className="text-xs text-muted-foreground">{indicator.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button variant="default" onClick={() => window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank')}>
              Watch on YouTube
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoDetailsModal;