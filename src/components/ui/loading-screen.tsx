
import React from "react";
import { LoadingSpinner } from "./loading-spinner";
import { BookOpen } from "lucide-react";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background bg-opacity-95 z-50">
      <div className="flex flex-col items-center justify-center space-y-6 animate-fade-in">
        <div className="relative animate-float">
          <BookOpen className="h-16 w-16 text-primary" strokeWidth={1.5} />
        </div>
        <LoadingSpinner size="lg" className="mt-4" />
        <h2 className="text-xl font-playfair mt-2 font-medium text-gradient-blue-green">
          Loading TownBook Hub
        </h2>
      </div>
    </div>
  );
};

export { LoadingScreen };
