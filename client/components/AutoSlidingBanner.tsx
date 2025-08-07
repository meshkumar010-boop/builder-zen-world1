import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface BannerSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundColor?: string;
  textColor?: string;
}

interface AutoSlidingBannerProps {
  slides: BannerSlide[];
  autoSlideInterval?: number; // in milliseconds
  className?: string;
}

export default function AutoSlidingBanner({ 
  slides, 
  autoSlideInterval = 4000,
  className = "" 
}: AutoSlidingBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-slide functionality
  useEffect(() => {
    if (isAutoPlaying && slides.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, autoSlideInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isAutoPlaying, slides.length, autoSlideInterval]);

  // Pause auto-slide on hover
  const handleMouseEnter = () => {
    setIsAutoPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleMouseLeave = () => {
    setIsAutoPlaying(true);
  };

  // Touch/swipe functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
    if (isRightSwipe) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  // Manual navigation
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 3000); // Resume auto-play after 3 seconds
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  if (!slides || slides.length === 0) {
    return null;
  }

  const currentBanner = slides[currentSlide];

  return (
    <div
      className={`relative h-48 sm:h-56 md:h-72 lg:h-80 xl:h-96 overflow-hidden rounded-xl md:rounded-2xl shadow-2xl ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `url('${currentBanner.imageUrl}')`,
          backgroundColor: currentBanner.backgroundColor || '#1a1a1a'
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 w-full">
          <div className="max-w-full sm:max-w-2xl">
            {/* Subtitle */}
            <div className="mb-2 sm:mb-3">
              <span
                className="inline-block px-2 sm:px-3 md:px-4 py-1 sm:py-2 bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full text-xs sm:text-sm font-medium animate-bounce-in"
                style={{ color: currentBanner.textColor || '#ffffff' }}
              >
                {currentBanner.subtitle}
              </span>
            </div>

            {/* Main Title */}
            <h2
              className="font-poppins font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl leading-tight mb-2 sm:mb-3 md:mb-4 animate-slide-up"
              style={{ color: currentBanner.textColor || '#ffffff' }}
            >
              {currentBanner.title}
            </h2>

            {/* Description */}
            <p
              className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed mb-3 sm:mb-4 md:mb-6 max-w-full sm:max-w-lg animate-fade-in opacity-90"
              style={{ color: currentBanner.textColor || '#ffffff' }}
            >
              {currentBanner.description}
            </p>

            {/* CTA Button */}
            {currentBanner.ctaText && (
              <div className="animate-scale-in">
                {currentBanner.ctaLink ? (
                  <a href={currentBanner.ctaLink}>
                    <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-md sm:rounded-lg font-semibold text-sm sm:text-base md:text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-pulse-glow">
                      {currentBanner.ctaText}
                    </button>
                  </a>
                ) : (
                  <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-md sm:rounded-lg font-semibold text-sm sm:text-base md:text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-pulse-glow">
                    {currentBanner.ctaText}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1.5 sm:space-x-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-white scale-125 shadow-lg'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-20">
        <div 
          className="h-full bg-primary transition-all ease-linear"
          style={{
            width: `${((currentSlide + 1) / slides.length) * 100}%`,
            transition: isAutoPlaying ? `width ${autoSlideInterval}ms linear` : 'width 0.3s ease'
          }}
        />
      </div>

      {/* Hidden Navigation Arrows (for accessibility, can be shown on hover if needed) */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300 z-20"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300 z-20"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Slide Counter */}
      <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 bg-black/30 backdrop-blur-sm text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm z-20">
        {currentSlide + 1} / {slides.length}
      </div>
    </div>
  );
}
