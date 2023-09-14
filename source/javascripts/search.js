// Search
const modal = document.getElementById('search-modal');
const searchBtn = document.querySelector('.open_search_btn');
const closeBtn = document.querySelector('.close-modal');
const inputField = document.querySelector('#search-modal input[type="search"]');

const openSearch = () => {
  if (modal && inputField) {
    document.addEventListener("click", clickOutsideToClose);
    document.addEventListener('keydown', closeOnEscape, { once: true });
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('overlay-open');
    modal.addEventListener("transitionend", focusInputField, { once: true });
  }
};

const clickOutsideToClose = (e) => {
  if (e.target === modal) {
    closeSearch();
  }
};

const closeSearch = () => {
  if (modal && modal.getAttribute('aria-hidden') === 'false') {
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('overlay-open');
    document.removeEventListener("click", clickOutsideToClose);
    modal.addEventListener("transitionend", focusSearchButton, { once: true });
  }
};

const closeOnEscape = (event) => {
  if (event.key === 'Escape' || event.code === 27) {
    closeSearch();
  }
};

const focusInputField = () => {
  inputField.focus();
};

const focusSearchButton = () => {
  searchBtn.focus();
};

searchBtn?.addEventListener('click', openSearch);
closeBtn?.addEventListener('click', closeSearch);