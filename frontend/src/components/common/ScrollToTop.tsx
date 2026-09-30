import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets scroll position to the top of the viewport and internal scroll containers
 * on every route transition.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Standard window scroll reset
    window.scrollTo(0, 0);

    // 2. Target the main content area in AppLayout
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTop = 0;
    }

    const mainContainer = document.getElementById('main-content');
    if (mainContainer) {
      mainContainer.scrollTop = 0;
    }

    // 3. Fallback for document root and body
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
}
