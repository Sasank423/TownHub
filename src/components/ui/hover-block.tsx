import React from "react";
import { cn } from "@/lib/utils";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";

interface HoverBlockProps {
  children: React.ReactNode;
  className?: string;
  previewContent?: React.ReactNode;
  hoverEffect?: "glow" | "scale" | "lift" | "vibrant" | null;
  delayDuration?: number;
}

const HoverBlock = ({
  children,
  className,
  previewContent,
  hoverEffect = "glow",
  delayDuration = 300,
}: HoverBlockProps) => {
  // Define effect classes based on the hoverEffect prop
  const effectClasses = {
    glow: "transition-all duration-300 hover:shadow-glow border border-transparent hover:border-primary/20",
    scale: "transition-all duration-300 hover:scale-[1.03] hover:z-10",
    lift: "transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:z-10",
    vibrant: "transition-all duration-300 hover:shadow-vibrant hover:border-primary/30 border border-transparent",
    null: "",
  };

  const effect = hoverEffect ? effectClasses[hoverEffect] : "";

  // If there's preview content, wrap it in HoverCard
  if (previewContent) {
    return (
      <HoverCard openDelay={delayDuration} closeDelay={100}>
        <HoverCardTrigger asChild>
          <div className={cn("rounded-lg", effect, className)}>
            {children}
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-80 p-4 bg-card/95 backdrop-blur-sm border border-primary/10 animate-fade-in">
          {previewContent}
        </HoverCardContent>
      </HoverCard>
    );
  }

  // Otherwise, just apply the hover effect
  return (
    <div className={cn("rounded-lg", effect, className)}>
      {children}
    </div>
  );
};

export { HoverBlock };
