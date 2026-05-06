(function () {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  const defaults = {
    apiUrl: isLocal ? 'http://localhost:5000/api' : 'https://living-result-backend.onrender.com/api',
    googleWebAppUrl: 'https://script.google.com/macros/s/AKfycbwWTolkQqA0LXgLwTYj8vnWMoEHQeonlhCc7-8RDEXgnGzZG6C22wK_RInl6Gkh0t3o8A/exec', // <-- PASTE YOUR URL HERE
  };

  const injectedConfig = window.__APP_CONFIG__ || {};
  window.APP_CONFIG = { ...defaults, ...injectedConfig };
})();
