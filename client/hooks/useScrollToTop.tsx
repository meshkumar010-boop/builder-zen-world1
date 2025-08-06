import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Hook to scroll to top when component mounts or route changes
 * @param behavior - 'auto' for instant scroll, 'smooth' for animated scroll
 * @param trigger - 'mount' to scroll on component mount, 'route' to scroll on route change
 */
export function useScrollToTop(
  behavior: "auto" | "smooth" = "auto",
  trigger: "mount" | "route" | "both" = "mount",
) {
  const location = useLocation();

  useEffect(() => {
    if (trigger === "mount" || trigger === "both") {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior,
      });
    }
  }, []); // Only on mount

  useEffect(() => {
    if (trigger === "route" || trigger === "both") {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior,
      });
    }
  }, [location.pathname, behavior]); // On route change
}

/**
 * Hook to manually scroll to top
 */
export function useScrollTo() {
  const scrollToTop = (behavior: "auto" | "smooth" = "auto") => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior,
    });
  };

  const scrollToElement = (
    elementId: string,
    behavior: "auto" | "smooth" = "smooth",
  ) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior,
        block: "start",
      });
    }
  };

  return { scrollToTop, scrollToElement };
}
