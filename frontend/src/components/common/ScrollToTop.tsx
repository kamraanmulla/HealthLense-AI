import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets scroll position to the top of the viewport and internal scroll containers
 * on every route transition. Disables browser's automatic history scroll restoration
 * to ensure newly navigated pages (e.g. My Reports after upload) always start at top.
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // 1. Disable browser's automatic history scroll restoration
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const resetAllScrollContainers = () => {
      // Standard window reset
      window.scrollTo(0, 0);

      // AppLayout primary scrollable container
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.scrollTop = 0;
        mainContent.scrollLeft = 0;
      }

      // Any generic main tag
      const mainEl = document.querySelector('main');
      if (mainEl && mainEl !== mainContent) {
        mainEl.scrollTop = 0;
      }

      // Root HTML and Body
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }
    };

    // Immediate execution
    resetAllScrollContainers();

    // After animation frame (DOM render)
    const rafId = requestAnimationFrame(() => {
      resetAllScrollContainers();
    });

    // After short delay (post Framer Motion transition start & data paint)
    const timer1 = setTimeout(resetAllScrollContainers, 50);
    const timer2 = setTimeout(resetAllScrollContainers, 150);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [pathname, search]);

  return null;
}
