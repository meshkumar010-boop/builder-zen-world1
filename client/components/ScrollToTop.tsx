import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto", // Use 'auto' for instant scroll, 'smooth' for animated
    });
  }, [pathname]);

  return null;
}

// Higher-order component wrapper for pages that need scroll restoration
export function withScrollToTop<T extends {}>(
  Component: React.ComponentType<T>,
) {
  return function ScrollToTopWrapper(props: T) {
    const { pathname } = useLocation();

    useEffect(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    }, [pathname]);

    return <Component {...props} />;
  };
}
