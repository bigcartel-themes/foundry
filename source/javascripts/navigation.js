const categoryNavHeadings = document.querySelectorAll('.category-nav-heading');
const dropdowns = document.querySelectorAll('.category-dropdown');

categoryNavHeadings.forEach(function(categoryNavHeading) {
  categoryNavHeading.addEventListener('click', function(e) {
    e.stopPropagation();

    let thisButton = e.currentTarget;
    const dropdown = document.getElementById(thisButton.getAttribute('aria-controls'));
    const isExpanded = thisButton.getAttribute('aria-expanded') === 'true';

    categoryNavHeading.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
    dropdown.setAttribute('aria-hidden', isExpanded ? 'true' : 'false');

    document.addEventListener('keydown', function toggleDropdownOnEscape(e) {
      if (e.key === 'Escape' && dropdown.getAttribute('aria-hidden') === 'false') {
        categoryNavHeading.setAttribute('aria-expanded', 'false');
        dropdown.setAttribute('aria-hidden', 'true');
        document.removeEventListener('keydown', toggleDropdownOnEscape);
      }
    });
  });
});

document.addEventListener('click', function(e) {
  const target = e.target;
  const isDropdown = target.classList.contains('category-dropdown') || target.closest('.category-dropdown');

  if (!isDropdown) {
    dropdowns.forEach(function(dropdown) {
      const dropdownButton = document.querySelector(`[aria-controls="${dropdown.id}"]`);

      if (dropdown.getAttribute('aria-hidden') === 'false') {
        dropdownButton.setAttribute('aria-expanded', 'false');
        dropdown.setAttribute('aria-hidden', 'true');
      }
    });
  }
});