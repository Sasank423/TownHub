import React, { useEffect } from 'react';

/**
 * This component prevents form submissions when clicking on links or buttons
 * within forms. It's used to fix the page refresh issue when navigating between tabs.
 */
export const PreventFormSubmission: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
          // Use a small timeout to ensure the event is fully handled
          setTimeout(() => {
            window.location.href = link.href;
          }, 10);
        }
      }
    };
    
    // Add event listener
    document.addEventListener('click', handleClick, true);
    
    // Clean up
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, []);
  
  return <>{children}</>;
};
