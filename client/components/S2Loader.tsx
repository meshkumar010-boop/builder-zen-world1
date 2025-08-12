import { cn } from "@/lib/utils";

interface S2LoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
  variant?: "default" | "minimal" | "pulse" | "glow";
}

const sizeClasses = {
  sm: {
    container: "w-8 h-8",
    text: "text-xs mt-2",
  },
  md: {
    container: "w-12 h-12",
    text: "text-sm mt-3",
  },
  lg: {
    container: "w-16 h-16",
    text: "text-base mt-4",
  },
  xl: {
    container: "w-24 h-24",
    text: "text-lg mt-6",
  },
};

function S2Loader({
  size = "md",
  className = "",
  text,
  variant = "default",
}: S2LoaderProps) {
  const { container, text: textSize } = sizeClasses[size];

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      {/* S2 Logo Loading Animation */}
      <div className={cn("relative", container)}>
        {variant === "default" && (
          <div className="relative w-full h-full">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></div>

            {/* Inner S2 shape */}
            <div className="absolute inset-2 flex items-center justify-center">
              <div className="relative">
                {/* S2 Text with gradient and animation */}
                <div className="font-poppins font-bold text-primary text-xl relative z-10 animate-pulse">
                  S2
                </div>

                {/* Glowing background */}
                <div className="absolute inset-0 bg-primary/20 rounded-lg blur-sm animate-ping"></div>
              </div>
            </div>

            {/* Floating dots around the loader */}
            <div className="absolute inset-0">
              <div
                className="absolute top-0 left-1/2 w-1 h-1 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: "0s" }}
              ></div>
              <div
                className="absolute top-1/2 right-0 w-1 h-1 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="absolute bottom-0 left-1/2 w-1 h-1 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></div>
              <div
                className="absolute top-1/2 left-0 w-1 h-1 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: "0.6s" }}
              ></div>
            </div>
          </div>
        )}

        {variant === "minimal" && (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="font-poppins font-bold text-primary text-2xl animate-pulse">
              S2
            </div>
            <div className="absolute inset-0 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        )}

        {variant === "pulse" && (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="font-poppins font-bold text-primary text-2xl animate-ping">
              S2
            </div>
            <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse"></div>
          </div>
        )}

        {variant === "glow" && (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Multiple glowing layers */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-orange-500 to-primary rounded-full animate-spin blur-sm opacity-50"></div>
            <div
              className="absolute inset-1 bg-gradient-to-r from-orange-500 via-primary to-orange-500 rounded-full animate-spin blur-sm opacity-40"
              style={{ animationDirection: "reverse", animationDuration: "3s" }}
            ></div>

            {/* Center S2 */}
            <div className="relative z-10 font-poppins font-bold text-2xl bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent animate-pulse">
              S2
            </div>

            {/* Pulsing glow */}
            <div className="absolute inset-2 bg-primary/20 rounded-full animate-ping"></div>
          </div>
        )}
      </div>

      {/* Loading text */}
      {text && (
        <p
          className={cn(
            "text-muted-foreground animate-pulse font-medium",
            textSize,
          )}
        >
          {text}
        </p>
      )}
    </div>
  );
}

// Pre-configured variants for common use cases
export const S2LoaderSmall = ({
  className,
  text,
}: {
  className?: string;
  text?: string;
}) => (
  <S2Loader size="sm" variant="minimal" className={className} text={text} />
);

export const S2LoaderLarge = ({
  className,
  text,
}: {
  className?: string;
  text?: string;
}) => <S2Loader size="lg" variant="glow" className={className} text={text} />;

export const S2LoaderFullscreen = ({
  text = "Loading...",
}: {
  text?: string;
}) => {
  // Use a non-fixed approach to avoid DOM removal conflicts
  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 min-h-screen">
      <S2Loader size="xl" variant="glow" text={text} />
    </div>
  );
};

// Loading skeleton for product cards
export const S2ProductCardSkeleton = () => (
  <div className="bg-card border border-border rounded-lg overflow-hidden animate-pulse">
    <div className="h-64 bg-muted relative">
      <div className="absolute inset-0 flex items-center justify-center">
        <S2Loader size="md" variant="minimal" />
      </div>
    </div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-muted rounded w-3/4"></div>
      <div className="h-4 bg-muted rounded w-1/2"></div>
      <div className="flex justify-between items-center">
        <div className="h-6 bg-muted rounded w-1/3"></div>
        <div className="h-8 bg-muted rounded w-16"></div>
      </div>
    </div>
  </div>
);

// Export both named and default
export { S2Loader };
export default S2Loader;
