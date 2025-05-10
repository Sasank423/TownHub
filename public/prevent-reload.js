// This script prevents page reloads when clicking on elements inside forms
// It's loaded globally in the HTML file

document.addEventListener('DOMContentLoaded', function() {
  // Capture all click events at the document level
  document.addEventListener('click', function(e) {
    // Find if the click was inside a form
    const form = e.target.closest('form');
    if (form) {
      // If it's a button or link inside a form, prevent the default form submission
      const isButton = e.target.tagName === 'BUTTON' || e.target.closest('button');
      const isLink = e.target.tagName === 'A' || e.target.closest('a');
      const isTabTrigger = e.target.closest('[role="tab"]');
      
      if (isButton || isLink || isTabTrigger) {
        // Only prevent default for non-submit buttons
        if (!isButton || e.target.type !== 'submit') {
          e.preventDefault();
          e.stopPropagation();
          console.log('Prevented form submission from:', e.target);
        }
      }
    }
  }, true);
  
  // Also prevent form submissions directly
  document.addEventListener('submit', function(e) {
    // Check if the submission was triggered by a submit button
    const submitter = e.submitter;
    if (!submitter || submitter.type !== 'submit') {
      e.preventDefault();
      e.stopPropagation();
      console.log('Prevented form submission');
    }
  }, true);
  
  console.log('Reload prevention script loaded');
});
