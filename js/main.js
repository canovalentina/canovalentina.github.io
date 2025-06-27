// main.js

//menu
toggle = document.querySelectorAll('.toggle')[0];
nav = document.querySelectorAll('nav')[0];
toggle_open_text = 'menu';
toggle_close_text = 'close';
toggle.addEventListener(
  'click',
  function () {
    nav.classList.toggle('open');
    if (nav.classList.contains('open')) {
      toggle.innerHTML = toggle_close_text;
    } else {
      toggle.innerHTML = toggle_open_text;
    }
  },
  false
);
setTimeout(function () {
  nav.classList.toggle('open');
}, 800);
//end menu
