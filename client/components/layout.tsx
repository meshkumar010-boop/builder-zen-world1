import { Link } from "react-router-dom";
import { useTheme } from "./theme-provider";
import { useCart } from "@/hooks/useCart";
import { Button } from "./ui/button";
import { ShoppingCart, Sun, Moon, Menu, X, Wifi, WifiOff } from "lucide-react";
import { useState, useEffect } from "react";
import { checkFirebaseConnection } from "@/lib/firebase";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { theme, setTheme } = useTheme();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Close mobile menu and ensure scroll position is maintained
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Check connection status
  useEffect(() => {
    const checkConnection = () => {
      const firebaseStatus = checkFirebaseConnection();
      const networkStatus = navigator.onLine;
      setIsOnline(firebaseStatus && networkStatus);
    };

    checkConnection();

    // Listen for network changes
    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);

    // Check periodically
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
      clearInterval(interval);
    };
  }, []);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Cart", href: "/cart" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center space-x-2 group animate-slide-in-left"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 animate-glow">
                <span className="text-primary-foreground font-bold text-lg">
                  S2
                </span>
              </div>
              <span className="font-poppins font-bold text-xl text-foreground group-hover:text-primary transition-colors duration-300">
                S2 Wears
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item, index) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-foreground hover:text-primary transition-all duration-300 font-medium relative group animate-slide-up stagger-delay-${index + 1}`}
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </div>

            {/* Right side - Connection Status, Theme toggle and Cart */}
            <div className="flex items-center space-x-4 animate-slide-in-right">
              {/* Connection Status Indicator */}
              <div className={`flex items-center space-x-1 text-xs ${isOnline ? 'text-green-600' : 'text-yellow-600'}`}>
                {isOnline ? (
                  <Wifi className="h-4 w-4" />
                ) : (
                  <WifiOff className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-foreground hover:text-primary transition-all duration-300 hover:scale-110 hover:rotate-12"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 animate-spin-slow" />
                ) : (
                  <Moon className="h-5 w-5 animate-pulse" />
                )}
              </Button>

              <Link to="/cart">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground hover:text-primary relative transition-all duration-300 hover:scale-110 hover-glow"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {/* Cart count badge */}
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce-in animate-pulse-glow">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-foreground"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border">
              <div className="py-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block px-3 py-2 text-foreground hover:text-primary hover:bg-accent rounded-md transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Offline Mode Banner */}
      {!isOnline && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center justify-center space-x-2 text-yellow-800 dark:text-yellow-200">
              <WifiOff className="h-4 w-4" />
              <span className="text-sm font-medium">
                Offline Mode - Using cached data. Some features may be limited.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">
                    S2
                  </span>
                </div>
                <span className="font-poppins font-bold text-xl text-foreground">
                  s2wears
                </span>
              </div>
              <p className="text-muted-foreground max-w-md">
                Modern, comfortable clothing for the contemporary lifestyle.
                Quality materials, timeless designs, and sustainable practices.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-poppins font-semibold text-foreground mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className="text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-poppins font-semibold text-foreground mb-4">
                Contact
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>s2wearsofficial@gmail.com</li>
                <li>+919009500502</li>
                <li>+919009880838</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 s2wears. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
