import { Card } from "@/components/ui/card";

interface LoadingCardProps {
  className?: string;
}

export const LoadingCard = ({ className = "" }: LoadingCardProps) => {
  return (
    <Card className={`glass-card p-6 ${className}`}>
      <div className="space-y-4 animate-pulse">
        <div className="h-4 bg-muted rounded shimmer w-3/4"></div>
        <div className="h-3 bg-muted rounded shimmer w-1/2"></div>
        <div className="space-y-2">
          <div className="h-2 bg-muted rounded shimmer"></div>
          <div className="h-2 bg-muted rounded shimmer w-5/6"></div>
        </div>
      </div>
    </Card>
  );
};

export const SkeletonCard = ({ className = "" }: LoadingCardProps) => {
  return (
    <Card className={`glass-card p-6 hover-lift ${className}`}>
      <div className="space-y-3">
        <div className="skeleton h-6 w-3/4"></div>
        <div className="skeleton h-4 w-1/2"></div>
        <div className="skeleton h-20 w-full mt-4"></div>
      </div>
    </Card>
  );
};
