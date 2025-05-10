/**
 * This script prevents page refreshes when clicking on links or buttons within forms.
 * It should be imported and executed once at the application bootstrap.
 */

// Function to initialize the page refresh prevention
export function initPreventRefresh() {
  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupEventListeners);
  } else {
    setupEventListeners();
  }
}

// Set up the event listeners
function setupEventListeners() {
  // Capture clicks at the document level
  document.addEventListener('click', handleClick, true);
  
  // Capture form submissions
  document.addEventListener('submit', handleSubmit, true);
}

// Handle click events
function handleClick(event) {
  const target = event.target;
  
  // Find if we're inside a form
  const form = target.closest('form');
  if (!form) return;
  
  // Find if we clicked a link or a non-submit button
  const link = target.closest('a');
  const button = target.closest('button');
  
  if (link || (button && button.type !== 'submit')) {
    // If it's a navigation element inside a form, prevent default form behavior
    event.stopPropagation();
    
    // If it's a link with href, handle navigation manually
    if (link && link.href && !link.href.startsWith('javascript:')) {
      event.preventDefault();
      setTimeout(() => {
        window.location.href = link.href;
      }, 0);
    }
  }
}

// Handle form submissions
function handleSubmit(event) {
  // Only allow form submission from explicit submit buttons or form.submit() calls
  const submitter = event.submitter;
  
  // If the submission wasn't triggered by a submit button, prevent it
  if (!submitter || submitter.type !== 'submit') {
    event.preventDefault();
    event.stopPropagation();
  }
}
