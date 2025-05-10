
export const initPreventRefresh = () => {
  // This utility adds functionality to prevent page refreshes when clicking links inside forms
  document.addEventListener('click', (event) => {
    // Check if the clicked element is a link or inside a link
    const linkElement = event.target.closest('a');
    
    if (linkElement) {
      // Check if we're inside a form
      const formElement = linkElement.closest('form');
      
      if (formElement) {
        // Prevent default behavior (which would cause a page reload)
        event.preventDefault();
        
        // Extract the href from the link
        const href = linkElement.getAttribute('href');
        
        // If a proper href exists, navigate programmatically
        if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
          window.location.href = href;
        }
      }
    }
  });
};
