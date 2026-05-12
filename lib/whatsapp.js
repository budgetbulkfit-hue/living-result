export const orderOnWhatsApp = (orderText) => {
  const phoneNumber = "917003714398";
  // Safely encode the message to prevent broken links
  const encodedText = encodeURIComponent(orderText);

  // 1. Primary: Direct App Deep Link
  const appScheme = `whatsapp://send?phone=${phoneNumber}&text=${encodedText}`;
  
  // 2. Secondary: Web Fallback
  const webFallback = `https://wa.me/${phoneNumber}?text=${encodedText}`;

  const startTime = Date.now();

  // Attempt to open the native app directly (does not trigger popup blockers)
  window.location.href = appScheme;

  // Fallback timeout (~1 second)
  const fallbackTimer = setTimeout(() => {
    const timeElapsed = Date.now() - startTime;
    if (timeElapsed < 1200 && !document.hidden) {
      window.location.href = webFallback;
    }
  }, 1000);

  // Clean up the timer immediately if the page hides (App opened successfully)
  window.addEventListener('pagehide', () => clearTimeout(fallbackTimer), { once: true });
  window.addEventListener('visibilitychange', () => {
    if (document.hidden) clearTimeout(fallbackTimer);
  }, { once: true });
};