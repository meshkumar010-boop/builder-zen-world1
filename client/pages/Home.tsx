import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  ArrowLeft,
  Star,
  Truck,
  Shield,
  Recycle,
  ShoppingCart,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import {
  getProducts,
  formatINR,
  getDiscountPercentage,
  type Product,
} from "@/services/products";

const features = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "Free delivery on all orders",
  },
  {
    icon: Shield,
    title: "Quality Guarantee",
    description: "15-day money back guarantee",
  },
  {
    icon: Recycle,
    title: "Sustainable",
    description: "Eco-friendly materials and practices",
  },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [promotionalSlide, setPromotionalSlide] = useState(0);
  const [countdown, setCountdown] = useState({ hours: 23, minutes: 45, seconds: 12 });
  const { addItem } = useCart();

  // Promotional banners for sliding section
  const promotionalBanners = [
    {
      type: "flash-sale",
      background: "bg-gradient-to-r from-red-500 to-pink-600",
      badge: { icon: "⚡", text: "LIMITED TIME OFFER" },
      title: "Flash Sale: Extra 25% OFF",
      description: "Use code FLASH25 at checkout for instant discount on all products. Limited time offer!",
      buttonText: "Shop Now & Save 25%",
      buttonStyle: "bg-white text-red-600 hover:bg-white/90"
    },
    {
      type: "coming-soon",
      background: "bg-gradient-to-r from-purple-600 to-blue-600",
      badge: { icon: "🎁", text: "COMING SOON" },
      title: "New Bundle Collection",
      description: "Get ready for our exclusive winter bundle collection featuring premium hoodies, t-shirts, and accessories. Pre-order now and save up to 40%!",
      buttonText: "Notify Me When Available",
      buttonStyle: "bg-white text-purple-600 hover:bg-white/90"
    },
    {
      type: "vip-membership",
      background: "bg-gradient-to-r from-amber-500 to-orange-600",
      badge: { icon: "🎆", text: "VIP EXCLUSIVE" },
      title: "Join S2 VIP Club",
      description: "Get exclusive access to early sales, special discounts, and limited edition products. Join now and get instant benefits!",
      buttonText: "Join VIP Club FREE",
      buttonStyle: "bg-white text-orange-600 hover:bg-white/90"
    }
  ];

  // Load featured products
  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const products = await getProducts();
      // Show up to 4 products as featured
      setFeaturedProducts(products.slice(0, 4));
    } catch (error) {
      console.error("Error loading featured products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-rotate carousel
  useEffect(() => {
    if (featuredProducts.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [featuredProducts.length]);

  // Real countdown timer for flash sale
  useEffect(() => {
    const countdownTimer = setInterval(() => {
      setCountdown(prev => {
        let { hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds -= 1;
        } else if (minutes > 0) {
          minutes -= 1;
          seconds = 59;
        } else if (hours > 0) {
          hours -= 1;
          minutes = 59;
          seconds = 59;
        } else {
          // Reset timer when it reaches 0
          hours = 23;
          minutes = 59;
          seconds = 59;
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, []);

  // Auto-rotate promotional banners every 3 seconds
  useEffect(() => {
    const promotionalTimer = setInterval(() => {
      setPromotionalSlide((prev) => (prev + 1) % promotionalBanners.length);
    }, 3000);
    return () => clearInterval(promotionalTimer);
  }, [promotionalBanners.length]);

  // Prevent auto-scroll when home page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <div className="min-h-screen">

      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url('https://images.pexels.com/photos/8499277/pexels-photo-8499277.jpeg?auto=compress&cs=tinysrgb&w=1600')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-primary/30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8 max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-full text-sm font-medium animate-bounce-in glass-effect">
              <span>Elevate Your Style</span>
            </div>

            {/* Main Heading - Mobile Optimized */}
            <div className="space-y-4 sm:space-y-6">
              <h1 className="font-poppins font-bold text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-white leading-tight animate-slide-up stagger-delay-1">
                Fashion That
                <span className="block bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent animate-glow">
                  Defines You
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed animate-fade-in stagger-delay-2 px-4 sm:px-0">
                Discover premium clothing that blends contemporary style with
                unmatched comfort. Where fashion meets personality.
              </p>
            </div>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6 animate-scale-in stagger-delay-3">
              <Link to="/products">
                <Button
                  size="lg"
                  className="w-full sm:w-auto group bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg shadow-2xl hover-lift animate-pulse-glow transition-all duration-300"
                >
                  Explore Collection
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                </Button>
              </Link>
              <Link to="/products">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 px-8 py-4 text-lg glass-effect hover-glow transition-all duration-300"
                >
                  Shop Now
                </Button>
              </Link>
            </div>

            {/* Social Proof Stats - Mobile Optimized */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 pt-8 sm:pt-12 max-w-2xl mx-auto animate-slide-up stagger-delay-4 px-4 sm:px-0">
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="font-poppins font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white group-hover:text-primary transition-colors duration-300">
                  9.3k
                </div>
                <div className="text-xs sm:text-sm text-white/80">Happy Customers</div>
              </div>
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="font-poppins font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white flex items-center justify-center group-hover:text-primary transition-colors duration-300">
                  4.1
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 fill-current text-yellow-400 ml-1 sm:ml-2 animate-pulse" />
                </div>
                <div className="text-xs sm:text-sm text-white/80">Customer Rating</div>
              </div>
              <div className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="font-poppins font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white group-hover:text-primary transition-colors duration-300">
                  100%
                </div>
                <div className="text-xs sm:text-sm text-white/80">Sustainable</div>
              </div>
            </div>


          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-10 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl animate-float" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-1/3 right-10 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl animate-float" style={{animationDelay: '6s'}}></div>
      </section>

      {/* Modern Auto-Sliding Promotional Banners */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-900">
        <div className="relative">
          {promotionalBanners.map((banner, index) => (
            <div
              key={index}
              className={`transition-all duration-700 transform ${
                index === promotionalSlide
                  ? 'translate-x-0 opacity-100 relative'
                  : index < promotionalSlide
                  ? '-translate-x-full opacity-0 absolute inset-0'
                  : 'translate-x-full opacity-0 absolute inset-0'
              }`}
            >
              <div className={`${banner.background} text-white relative overflow-hidden`}>
                {/* Modern content layout */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="py-6 sm:py-8 lg:py-10">
                    <div className="text-center space-y-4 sm:space-y-5">
                      {/* Badge */}
                      <div className="flex justify-center">
                        <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                          <span className="text-lg">{banner.badge.icon}</span>
                          <span className="font-semibold">{banner.badge.text}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <div className="space-y-4">
                        <h2 className="font-poppins font-bold text-2xl sm:text-3xl lg:text-4xl text-white leading-tight">
                          {banner.title}
                        </h2>
                        <p className="text-sm sm:text-base lg:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
                          {banner.description.includes('FLASH25') ? (
                            <>
                              Use code <span className="bg-white/25 backdrop-blur-sm px-3 py-1 rounded-full font-mono font-bold text-sm border border-white/20">FLASH25</span> at checkout
                            </>
                          ) : (
                            banner.description
                          )}
                        </p>
                      </div>

                      {/* Timer section removed to keep all banners same size */}

                      {/* Features section removed to keep all banners same size as flash sale banner */}

                      {/* CTA Button */}
                      <div className="pt-2">
                        <Link to="/products">
                          <Button
                            size="default"
                            className={`${banner.buttonStyle} font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 px-6 py-3 text-sm sm:text-base rounded-lg`}
                          >
                            {banner.buttonText}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modern floating elements */}
                <div className="absolute top-8 left-8 w-20 h-20 bg-white/5 rounded-full blur-xl animate-float"></div>
                <div className="absolute bottom-8 right-8 w-32 h-32 bg-white/5 rounded-full blur-xl animate-float" style={{animationDelay: '2s'}}></div>
                <div className="absolute top-1/2 left-12 w-16 h-16 bg-white/5 rounded-full blur-xl animate-float" style={{animationDelay: '4s'}}></div>
                <div className="absolute top-1/4 right-12 w-24 h-24 bg-white/5 rounded-full blur-xl animate-float" style={{animationDelay: '6s'}}></div>

                {/* Gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Modern slide indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {promotionalBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => setPromotionalSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 backdrop-blur-sm border ${
                index === promotionalSlide
                  ? 'bg-white border-white scale-125 shadow-lg'
                  : 'bg-white/30 border-white/50 hover:bg-white/50 hover:scale-110'
              }`}
            />
          ))}
        </div>

        {/* Modern navigation arrows */}
        <button
          onClick={() => setPromotionalSlide((prev) => (prev - 1 + promotionalBanners.length) % promotionalBanners.length)}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white p-3 rounded-full transition-all duration-300 z-20 border border-white/20 shadow-lg hover:scale-110"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => setPromotionalSlide((prev) => (prev + 1) % promotionalBanners.length)}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white p-3 rounded-full transition-all duration-300 z-20 border border-white/20 shadow-lg hover:scale-110"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </section>

      {/* Featured Products Carousel */}
      <section className="py-20 bg-card relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-poppins font-bold text-3xl lg:text-4xl text-foreground mb-4 animate-slide-up">
              Featured Products
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto animate-fade-in stagger-delay-1">
              Discover our most popular items, carefully selected for quality,
              style, and comfort.
            </p>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-8">
              <div className="flex justify-center space-x-2">
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              <p className="text-muted-foreground mt-4 animate-pulse">
                Loading featured products...
              </p>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-8 animate-fade-in">
              <p className="text-muted-foreground mb-4">
                No products available yet.
              </p>
              <Link to="/admin/dashboard">
                <Button variant="outline" className="hover-lift">Add Products via Admin Panel</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {featuredProducts.map((product, index) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className={`block group animate-scale-in stagger-delay-${(index % 4) + 1}`}
                  onClick={() => {
                    // Auto-add to cart when product is clicked
                    addItem({
                      id: product.id!,
                      name: product.name,
                      price: product.price,
                      image: product.images[0] || "/placeholder.svg",
                      size: product.sizes[0] || "M",
                      color: product.colors[0]?.name || "Default",
                      quantity: 1,
                    });
                  }}
                >
                  <Card className="group-hover:shadow-soft-lg transition-all duration-500 border-0 bg-background cursor-pointer hover-lift overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden rounded-t-lg">
                        <img
                          src={product.images[0] || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-48 sm:h-56 md:h-64 object-cover group-hover:scale-110 transition-all duration-500"
                        />
                        <div className="absolute top-3 left-3 transform group-hover:scale-105 transition-transform duration-300">
                          <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium animate-pulse-glow">
                            {product.category}
                          </span>
                        </div>

                      </div>

                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-1">
                            {product.name}
                          </h3>
                          <div className="flex items-center space-x-1 group-hover:scale-105 transition-transform duration-300">
                            <Star className="h-3 w-3 fill-current text-yellow-500 animate-pulse" />
                            <span className="text-xs text-muted-foreground">
                              {product.rating || 4.5}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-poppins font-semibold text-lg text-foreground group-hover:text-primary transition-colors duration-300">
                                {formatINR(product.price)}
                              </span>
                              {product.originalPrice &&
                                product.originalPrice > product.price && (
                                  <span className="text-sm text-muted-foreground line-through">
                                    {formatINR(product.originalPrice)}
                                  </span>
                                )}
                            </div>
                            {product.originalPrice &&
                              product.originalPrice > product.price && (
                                <div className="text-xs text-green-600 font-medium animate-pulse bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                                  {getDiscountPercentage(
                                    product.originalPrice,
                                    product.price,
                                  )}
                                  % OFF
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-12 animate-fade-in">
            <Link to="/products">
              <Button size="lg" variant="outline" className="group hover-lift animate-pulse-glow">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className={`text-center space-y-4 group hover-lift animate-slide-up stagger-delay-${index + 1}`}>
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-all duration-500 group-hover:scale-110 animate-float" style={{animationDelay: `${index * 2}s`}}>
                  <feature.icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="font-poppins font-semibold text-xl text-foreground group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Background elements */}
        <div className="absolute top-20 right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
      </section>


      {/* CTA Section */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="font-poppins font-bold text-3xl lg:text-4xl text-primary-foreground mb-4 animate-slide-up">
            Ready to Upgrade Your Wardrobe?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto animate-fade-in stagger-delay-1">
            Join thousands of satisfied customers who've made the switch to S2
            Wears. Quality, comfort, and style - all in one place.
          </p>
          <Link to="/products">
            <Button size="lg" variant="secondary" className="shadow-soft-lg hover-lift animate-bounce-in stagger-delay-2 hover-glow">
              Start Shopping
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
            </Button>
          </Link>
        </div>

        {/* Background animations */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-float"></div>
          <div className="absolute top-20 right-20 w-32 h-32 bg-white rounded-full animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-10 left-1/4 w-16 h-16 bg-white rounded-full animate-float" style={{animationDelay: '4s'}}></div>
          <div className="absolute bottom-20 right-1/4 w-24 h-24 bg-white rounded-full animate-float" style={{animationDelay: '6s'}}></div>
        </div>
      </section>
    </div>
  );
}
