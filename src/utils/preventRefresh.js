
export const initPreventRefresh = () => {
  // This utility adds functionality to prevent page refreshes when clicking links inside forms
  document.addEventListener('click', (event) => {
    // Check if the clicked element is a link or inside a link
    const linkElement = event.target.closest('a');
    
    if (linkElement) {
      // Check if we're inside a form
      const formElement = linkElement.closest('form');
      
      if (formElement) {
        // Always prevent default behavior for links inside forms
        event.preventDefault();
        
        // Extract the href from the link
        const href = linkElement.getAttribute('href');
        
        // Use history API instead of directly changing location to avoid page reload
        if (href && !href.startsWith('#') && !href.startsWith('javascript:') && window.history) {
          window.history.pushState({}, '', href);
          // Dispatch a custom event that components can listen for
          window.dispatchEvent(new CustomEvent('locationchange', { detail: { href } }));
        }
      }
    }
  });
  
  // Listen for popstate events (back/forward browser buttons)
  window.addEventListener('popstate', () => {
    window.dispatchEvent(new CustomEvent('locationchange', { 
      detail: { href: window.location.pathname } 
    }));
  });
};
