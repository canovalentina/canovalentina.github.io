// main.js

// Set current year in footer
const yearElement = document.getElementById('year');
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

// Dark mode toggle
const darkModeToggle = document.querySelector('.dark-mode-toggle');
if (darkModeToggle) {
  const lightOption = darkModeToggle.querySelector('.light-option');
  const darkOption = darkModeToggle.querySelector('.dark-option');

  function updateToggleButton() {
    const isDark = document.body.classList.contains('dark-mode');
    if (lightOption && darkOption) {
      lightOption.classList.toggle('active', !isDark);
      darkOption.classList.toggle('active', isDark);
    }
  }

  const savedMode = localStorage.getItem('darkMode');
  if (savedMode === 'true') {
    document.body.classList.add('dark-mode');
  }
  updateToggleButton();

  darkModeToggle.addEventListener('click', function () {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    updateToggleButton();
  });
}

//menu
toggle = document.querySelectorAll('.toggle')[0];
nav = document.querySelectorAll('nav')[0];
toggle_open_text = 'menu';
toggle_close_text = 'close';

function updateMenuState() {
  const isOpen = nav.classList.contains('open');
  toggle.innerHTML = isOpen ? toggle_close_text : toggle_open_text;
  toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

toggle.addEventListener(
  'click',
  function (e) {
    e.preventDefault();
    nav.classList.toggle('open');
    updateMenuState();
  },
  false
);

// Auto-open menu after delay, but not on home page
if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
  setTimeout(function () {
    nav.classList.toggle('open');
    updateMenuState();
  }, 800);
}
//end menu
