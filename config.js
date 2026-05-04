(function () {
  const defaults = {
    apiUrl: 'https://living-result-backend.onrender.com/api',
    googleWebAppUrl: '',
  };

  const injectedConfig = window.__APP_CONFIG__ || {};
  window.APP_CONFIG = { ...defaults, ...injectedConfig };
})();
