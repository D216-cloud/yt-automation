 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface GlassCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const GlassCard = ({ 
  title, 
  description, 
  children, 
  className = "",
  hoverable = true 
}: GlassCardProps) => {
  return (
    <Card className={`glass-card overflow-hidden ${hoverable ? 'hover-lift' : ''} ${className}`}>
      {(title || description) && (
        <CardHeader className="pb-3">
          {title && <CardTitle className="text-foreground text-xl">{title}</CardTitle>}
          {description && <CardDescription className="text-muted-foreground">{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={!title && !description ? "p-6" : "pt-0"}>
        {children}
      </CardContent>
    </Card>
  );
};