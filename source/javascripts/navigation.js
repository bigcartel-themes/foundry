const navHeadings = document.querySelectorAll('.nav-heading');
const dropdowns = document.querySelectorAll('.nav-dropdown');

// Function to close all dropdowns
function closeAllDropdowns() {
  navHeadings.forEach(heading => {
    heading.setAttribute('aria-expanded', 'false');
  });
  
  dropdowns.forEach(dropdown => {
    dropdown.setAttribute('aria-hidden', 'true');
  });
}

// Create one escape key handler for the document
function handleEscapeKey(e) {
  if (e.key === 'Escape') {
    closeAllDropdowns();
    document.removeEventListener('keydown', handleEscapeKey);
  }
}

navHeadings.forEach(function(navHeading) {
  navHeading.addEventListener('click', function(e) {
    e.stopPropagation();

    const thisButton = e.currentTarget;
    const dropdownId = thisButton.getAttribute('aria-controls');
    const dropdown = document.getElementById(dropdownId);
    
    if (!dropdown) {
      console.warn(`Dropdown with ID "${dropdownId}" not found`);
      return;
    }
    
    const isExpanded = thisButton.getAttribute('aria-expanded') === 'true';

    // First close all dropdowns
    closeAllDropdowns();
    
    // If this dropdown wasn't already open, open it
    if (!isExpanded) {
      navHeading.setAttribute('aria-expanded', 'true');
      dropdown.setAttribute('aria-hidden', 'false');
      
      // Set up a single escape key handler
      document.removeEventListener('keydown', handleEscapeKey);
      document.addEventListener('keydown', handleEscapeKey);
    }
  });
});

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
  const target = e.target;
  const isDropdown = target.classList.contains('nav-dropdown') || 
                     target.closest('.nav-dropdown') || 
                     target.classList.contains('nav-heading') ||
                     target.closest('.nav-heading');

  if (!isDropdown) {
    closeAllDropdowns();
  }
});