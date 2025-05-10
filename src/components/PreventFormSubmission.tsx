
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * This component prevents form submissions when clicking on links or buttons
 * within forms. It's used to fix the page refresh issue when navigating between tabs.
 */
export const PreventFormSubmission: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Function to handle click events on the document
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Find the closest link or button
      const link = target.closest('a');
      const button = target.closest('button');
      
      // Find if we're inside a form
      const form = target.closest('form');
      
      // If we're inside a form and clicking a link or button without type="submit"
      if (form && (link || (button && button.type !== 'submit'))) {
        // Prevent the default form submission
        e.preventDefault();
        
        // If it's a link with href, navigate programmatically
        if (link && link.href) {
          const url = new URL(link.href);
          const pathname = url.pathname;
          
          // Use React Router's navigate instead of changing location
          navigate(pathname + url.search);
        }
      }
    };
    
    // Add event listener
    document.addEventListener('click', handleClick, true);
    
    // Listen for custom location change events 
    const handleLocationChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.href) {
        navigate(customEvent.detail.href);
      }
    };
    
    window.addEventListener('locationchange', handleLocationChange);
    
    // Clean up
    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('locationchange', handleLocationChange);
    };
  }, [navigate]);
  
  return <>{children}</>;
};
