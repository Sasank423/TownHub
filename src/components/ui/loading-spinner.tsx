
import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "accent";
  className?: string;
}

const LoadingSpinner = ({ 
  size = "md", 
  color = "primary",
  className = "" 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4"
  };
  
  const colorClasses = {
    primary: "border-primary",
    secondary: "border-secondary",
    accent: "border-accent"
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} border-t-transparent ${colorClasses[color]}`}
        role="status"
        aria-label="loading"
      />
      <div className="mt-4 space-x-1">
        <span className="loading-dot"></span>
        <span className="loading-dot"></span>
        <span className="loading-dot"></span>
      </div>
    </div>
  );
};

export { LoadingSpinner };
