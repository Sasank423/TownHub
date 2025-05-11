
import React from "react";
import { Book as BookIcon } from "lucide-react";
import { HoverBlock } from "./ui/hover-block";
import { Link } from "react-router-dom";

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  coverImage?: string;
  available?: boolean;
  className?: string;
}

export const BookCard = ({ 
  id, 
  title, 
  author, 
  coverImage, 
  available = true,
  className 
}: BookCardProps) => {
  const previewContent = (
    <div className="space-y-2">
      <h3 className="text-md font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">by {author}</p>
      <div className="flex items-center mt-2">
        <div className={`h-2 w-2 rounded-full mr-2 ${available ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="text-xs">{available ? 'Available' : 'Unavailable'}</span>
      </div>
    </div>
  );

  return (
    <HoverBlock 
      previewContent={previewContent}
      hoverEffect="vibrant" 
      className={`bg-card transition-all duration-300 ${className}`}
    >
      <Link to={`/books/${id}`} className="block h-full">
        <div className="p-4 flex flex-col h-full">
          <div className="flex-1 mb-3 flex items-center justify-center">
            {coverImage ? (
              <img 
                src={coverImage} 
                alt={title} 
                className="h-32 object-cover shadow-book-cover transform transition-transform duration-300 group-hover:scale-105" 
              />
            ) : (
              <div className="h-32 w-24 bg-secondary/20 flex items-center justify-center rounded">
                <BookIcon className="h-12 w-12 text-primary/50" />
              </div>
            )}
          </div>
          <h3 className="font-medium text-sm line-clamp-1">{title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-1">by {author}</p>
          <div className="mt-2 flex items-center">
            <div className={`h-1.5 w-1.5 rounded-full mr-1.5 ${available ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-muted-foreground">{available ? 'Available' : 'Unavailable'}</span>
          </div>
        </div>
      </Link>
    </HoverBlock>
  );
};
