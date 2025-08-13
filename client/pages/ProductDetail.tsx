import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { S2LoaderFullscreen } from "@/components/S2Loader";
import {
  Star,
  ShoppingCart,
  Heart,
  ArrowLeft,
  Check,
  MessageCircle,
  ZoomIn,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  RotateCcw,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import {
  formatINR,
  getDiscountPercentage,
  getProduct,
  type Product,
} from "@/services/products";

// Fallback product data
const fallbackProduct: Product = {
  id: "fallback",
  name: "Product Not Found",
  originalPrice: 2999,
  price: 1999,
  images: [
    "https://images.pexels.com/photos/6786894/pexels-photo-6786894.jpeg?auto=compress&cs=tinysrgb&w=800",
  ],
  rating: 4.5,
  reviews: 0,
  category: "T-Shirts",
  description:
    "Sorry, this product could not be found. Please try browsing our other products.",
  features: ["Product not available"],
  colors: [{ name: "Default", value: "#FFFFFF" }],
  sizes: ["M"],
};

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState<{
    name: string;
    value: string;
  } | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [zoomImageIndex, setZoomImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setProduct(fallbackProduct);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const productData = await getProduct(id);
        if (productData) {
          setProduct(productData);
          const firstColor =
            productData.colors && productData.colors.length > 0
              ? productData.colors[0]
              : { name: "Default", value: "#FFFFFF" };
          setSelectedColor(firstColor);
        } else {
          setProduct(fallbackProduct);
          setSelectedColor(fallbackProduct.colors[0]);
        }
      } catch (error) {
        console.error("Error loading product:", error);
        setProduct(fallbackProduct);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
    // Prevent auto-scroll when navigating to product
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [id]);

  // Keyboard navigation and body scroll prevention for zoom modal
  useEffect(() => {
    if (!isZoomModalOpen) return;

    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          setIsZoomModalOpen(false);
          resetZoom();
          break;
        case "ArrowLeft":
          if (product?.images && zoomImageIndex > 0) {
            changeZoomImage(zoomImageIndex - 1);
          }
          break;
        case "ArrowRight":
          if (product?.images && zoomImageIndex < product.images.length - 1) {
            changeZoomImage(zoomImageIndex + 1);
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset"; // Restore scroll
    };
  }, [isZoomModalOpen, zoomImageIndex, product?.images]);

  if (loading) {
    return <S2LoaderFullscreen text="Loading product details..." />;
  }

  if (!product || !product.id) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Product Not Found</h2>
          <p className="text-muted-foreground">The product you're looking for doesn't exist or has been removed.</p>
          <Link to="/products" className="inline-block">
            <Button variant="outline">← Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    console.log("🖱️ Add to Cart button clicked!");
    console.log("Selected size:", selectedSize);
    console.log("Selected color:", selectedColor?.name);
    console.log("Quantity:", quantity);

    if (!selectedSize) {
      alert("Please select a size");
      return;
    }

    if (!selectedColor) {
      alert("Please select a color");
      return;
    }

    // Add items to cart based on quantity
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id!,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || "/placeholder.svg",
        size: selectedSize,
        color: selectedColor.name,
        quantity: 1,
      });
    }

    alert(
      `Added ${quantity}x ${product.name} (Size: ${selectedSize}, Color: ${selectedColor.name}) to cart!`,
    );
  };

  const handleWhatsAppShare = () => {
    const productUrl = `${window.location.origin}/product/${product.id}`;
    const discountText =
      product.originalPrice > product.price
        ? `\n���� Special Offer: ${getDiscountPercentage(product.originalPrice, product.price)}% OFF! (Save ${formatINR(product.originalPrice - product.price)})`
        : "";

    const shippingText = product.shipping?.isFree
      ? "\nShipping: FREE"
      : `\nShipping: ${formatINR(product.shipping?.charge || 0)}`;

    const totalPrice =
      product.price +
      (product.shipping?.isFree ? 0 : product.shipping?.charge || 0);

    const message = `Hello! 👋\n\nI want to place my order for this amazing product:\n\n���️ ${product.name}\n💰 Price: ${formatINR(product.price)}${discountText}\n🔗 Product Link: ${productUrl}\n\nPlease let me know how to place the order. Thank you! 😊`;

    const phoneNumber = "919009880838";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
  };

  // Zoom and Pan Helper Functions
  const resetZoom = () => {
    setZoomLevel(1);
    setPanX(0);
    setPanY(0);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => {
      const newZoom = Math.min(prev * 1.5, 8);
      const constrained = constrainPan(panX, panY, newZoom);
      setPanX(constrained.x);
      setPanY(constrained.y);
      return newZoom;
    });
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => {
      const newZoom = prev / 1.5;
      if (newZoom <= 1) {
        setPanX(0);
        setPanY(0);
        return 1;
      }
      const constrained = constrainPan(panX, panY, newZoom);
      setPanX(constrained.x);
      setPanY(constrained.y);
      return newZoom;
    });
  };

  const getTouchDistance = (touches: TouchList) => {
    const touch1 = touches[0];
    const touch2 = touches[1];
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;

      const newX = panX + deltaX / zoomLevel;
      const newY = panY + deltaY / zoomLevel;
      const constrained = constrainPan(newX, newY, zoomLevel);

      setPanX(constrained.x);
      setPanY(constrained.y);

      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = getTouchDistance(e.touches);
      setLastTouchDistance(distance);
      setIsDragging(false);
    } else if (e.touches.length === 1 && zoomLevel > 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();

    if (e.touches.length === 2) {
      // Pinch to zoom
      const distance = getTouchDistance(e.touches);
      if (lastTouchDistance > 0) {
        const scale = distance / lastTouchDistance;
        const newZoom = Math.max(0.5, Math.min(zoomLevel * scale, 8));
        setZoomLevel(newZoom);
      }
      setLastTouchDistance(distance);
    } else if (e.touches.length === 1 && isDragging && zoomLevel > 1) {
      // Pan when zoomed in
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragStart.x;
      const deltaY = touch.clientY - dragStart.y;

      const newX = panX + deltaX / zoomLevel;
      const newY = panY + deltaY / zoomLevel;
      const constrained = constrainPan(newX, newY, zoomLevel);

      setPanX(constrained.x);
      setPanY(constrained.y);

      setDragStart({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setLastTouchDistance(0);
  };

  const handleMouseWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY;
    const zoomSpeed = 0.1;

    if (delta < 0) {
      // Zoom in
      setZoomLevel(prev => Math.min(prev + zoomSpeed, 8));
    } else {
      // Zoom out
      setZoomLevel(prev => {
        const newZoom = Math.max(prev - zoomSpeed, 0.5);
        if (newZoom <= 1) {
          setPanX(0);
          setPanY(0);
          return 1;
        }
        return newZoom;
      });
    }
  };

  // Pan limits to prevent image from going too far off screen
  const constrainPan = (x: number, y: number, zoom: number) => {
    const maxPan = (zoom - 1) * 200; // Adjust this value for more/less movement
    return {
      x: Math.max(-maxPan, Math.min(maxPan, x)),
      y: Math.max(-maxPan, Math.min(maxPan, y))
    };
  };

  const handleDoubleClick = () => {
    if (zoomLevel === 1) {
      setZoomLevel(2.5);
    } else {
      resetZoom();
    }
  };

  // Reset zoom when changing images
  const changeZoomImage = (newIndex: number) => {
    setZoomImageIndex(newIndex);
    resetZoom();
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link
            to="/products"
            className="hover:text-foreground transition-colors"
          >
            Products
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        {/* Back Button */}
        <Link
          to="/products"
          className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-card rounded-2xl overflow-hidden group">
              <img
                src={
                  product.images?.[selectedImage] ||
                  product.images?.[0] ||
                  "/placeholder.svg"
                }
                alt={product.name}
                className="w-full h-full object-cover transition-transform group-hover:scale-105 cursor-zoom-in"
                onClick={() => {
                  if (product?.images && product.images.length > 0) {
                    setZoomImageIndex(selectedImage);
                    resetZoom();
                    setIsZoomModalOpen(true);
                  }
                }}
              />

              {/* Zoom Button */}
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 hover:bg-white shadow-lg"
                onClick={() => {
                  if (product?.images && product.images.length > 0) {
                    setZoomImageIndex(selectedImage);
                    resetZoom();
                    setIsZoomModalOpen(true);
                  }
                }}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>

              {/* Click to zoom hint */}
              <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                  Click to zoom
                </div>
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-3 gap-3">
              {(product.images || []).map((image, index) => (
                <button
                  key={`thumbnail-${index}`}
                  onClick={() => setSelectedImage(index)}
                  onDoubleClick={() => {
                    if (product?.images && product.images.length > 0) {
                      setZoomImageIndex(index);
                      resetZoom();
                      setIsZoomModalOpen(true);
                    }
                  }}
                  className={`group relative aspect-square bg-card rounded-lg overflow-hidden border-2 transition-all hover:border-primary/50 ${
                    selectedImage === index
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                  title="Click to select, double-click to zoom"
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />

                  {/* Mini zoom indicator */}
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="h-3 w-3 text-white drop-shadow-lg" />
                  </div>
                </button>
              ))}
            </div>

            {/* View All Images Button */}
            {product?.images && product.images.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4"
                onClick={() => {
                  setZoomImageIndex(0);
                  resetZoom();
                  setIsZoomModalOpen(true);
                }}
              >
                <ZoomIn className="mr-2 h-4 w-4" />
                View All Images ({product.images.length})
              </Button>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-3">
                <span>{product.category}</span>
              </div>

              <h1 className="font-poppins font-bold text-3xl lg:text-4xl text-foreground mb-4">
                {product.name}
              </h1>

              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating)
                          ? "fill-current text-yellow-500"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="font-poppins font-bold text-3xl text-foreground">
                    {formatINR(product.price)}
                  </div>
                  {product.originalPrice &&
                    product.originalPrice > product.price && (
                      <div className="font-poppins text-xl text-muted-foreground line-through">
                        {formatINR(product.originalPrice)}
                      </div>
                    )}
                </div>
                {product.originalPrice &&
                  product.originalPrice > product.price && (
                    <div className="flex items-center gap-2">
                      <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-sm font-medium">
                        {getDiscountPercentage(
                          product.originalPrice,
                          product.price,
                        )}
                        % OFF
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                        You save{" "}
                        {formatINR(product.originalPrice - product.price)}!
                      </div>
                    </div>
                  )}
              </div>

              {/* Shipping Information */}
              <div className="bg-accent/30 border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🚚</span>
                    <span className="font-medium text-foreground">
                      Shipping
                    </span>
                  </div>
                  <div className="text-right">
                    {product.shipping?.isFree ? (
                      <div className="flex items-center space-x-2">
                        <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-bold">
                          FREE
                        </span>
                      </div>
                    ) : (
                      <span className="font-semibold text-orange-600 dark:text-orange-400">
                        {formatINR(product.shipping?.charge || 0)}
                      </span>
                    )}
                  </div>
                </div>
                {product.shipping?.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {product.shipping.description}
                  </p>
                )}

                {/* Total Price */}
                <div className="border-t border-border mt-3 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      Total Price:
                    </span>
                    <span className="font-bold text-xl text-primary">
                      {formatINR(
                        product.price +
                          (product.shipping?.isFree
                            ? 0
                            : product.shipping?.charge || 0),
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            {/* Color Selection */}
            <div className="space-y-3">
              <h3 className="font-poppins font-semibold text-foreground">
                Color: {selectedColor?.name || "Select a color"}
              </h3>
              <div className="flex space-x-2">
                {(product.colors || []).map((color, index) => (
                  <button
                    key={`color-${color.name || "unknown"}-${index}`}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor?.name === color.name
                        ? "border-primary scale-110"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color.value || "#FFFFFF" }}
                    title={color.name || "Unknown Color"}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="space-y-3">
              <h3 className="font-poppins font-semibold text-foreground">
                Size
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {(product.sizes || []).map((size) => (
                  <button
                    key={`size-${size}`}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 px-4 border-2 rounded-lg font-medium transition-all ${
                      selectedSize === size
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-3">
              <h3 className="font-poppins font-semibold text-foreground">
                Quantity
              </h3>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="flex-1 shadow-soft-lg"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="lg" className="sm:w-auto">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>

              {/* WhatsApp Order Button */}
              <Button
                variant="outline"
                size="lg"
                className="w-full border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                onClick={handleWhatsAppShare}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Order via WhatsApp
              </Button>
            </div>

            {/* Features */}
            <Card className="border-0 bg-accent/50">
              <CardContent className="p-6">
                <h3 className="font-poppins font-semibold text-foreground mb-3">
                  Features
                </h3>
                <ul className="space-y-2">
                  {(product.features || []).map((feature, index) => (
                    <li
                      key={`feature-${index}-${feature.slice(0, 10)}`}
                      className="flex items-center space-x-2 text-muted-foreground"
                    >
                      <Check className="h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      {isZoomModalOpen && product?.images && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
            onClick={() => {
              setIsZoomModalOpen(false);
              resetZoom();
            }}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Image Counter */}
          <div className="absolute top-4 left-4 text-white text-sm bg-black/50 px-3 py-1 rounded-full z-10">
            {zoomImageIndex + 1} / {product.images?.length || 0}
          </div>

          {/* Previous Button */}
          {product?.images && product.images.length > 1 && zoomImageIndex > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-20"
              onClick={() => changeZoomImage(zoomImageIndex - 1)}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          )}

          {/* Next Button */}
          {product?.images && product.images.length > 1 && zoomImageIndex < product.images.length - 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-20"
              onClick={() => changeZoomImage(zoomImageIndex + 1)}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          )}

          {/* Zoom Controls */}
          <div className="absolute top-16 right-4 flex flex-col space-y-2 z-20">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 bg-black/50"
              onClick={handleZoomIn}
              title="Zoom In"
            >
              <Plus className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 bg-black/50"
              onClick={handleZoomOut}
              title="Zoom Out"
            >
              <Minus className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 bg-black/50"
              onClick={resetZoom}
              title="Reset Zoom"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Interactive Zoomed Image */}
          <div
            className="relative w-full h-full flex items-center justify-center overflow-hidden select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleMouseWheel}
            onDoubleClick={handleDoubleClick}
            style={{
              cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
            }}
          >
            <img
              src={product.images?.[zoomImageIndex] || "/placeholder.svg"}
              alt={`${product.name} - Image ${zoomImageIndex + 1}`}
              className="transition-transform duration-300 ease-out select-none"
              style={{
                transform: `scale(${zoomLevel}) translate(${panX}px, ${panY}px)`,
                maxWidth: zoomLevel === 1 ? '90vw' : 'none',
                maxHeight: zoomLevel === 1 ? '90vh' : 'none',
                cursor: zoomLevel > 1 ? 'grab' : 'zoom-in'
              }}
              draggable={false}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Zoom Level Indicator */}
          {zoomLevel !== 1 && (
            <div className="absolute top-16 left-4 text-white text-sm bg-black/50 px-3 py-1 rounded-full z-10">
              {Math.round(zoomLevel * 100)}%
            </div>
          )}

          {/* Image Navigation Dots */}
          {product?.images && product.images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
              {product.images.map((_, index) => (
                <button
                  key={`zoom-dot-${index}`}
                  onClick={() => changeZoomImage(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === zoomImageIndex
                      ? "bg-white"
                      : "bg-white/50 hover:bg-white/75"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Instructions */}
          <div className="absolute bottom-4 right-4 text-white text-xs bg-black/50 px-3 py-2 rounded max-w-xs">
            <div className="space-y-1">
              <div>ESC to close • Arrow keys to navigate</div>
              <div>Double-click to zoom • Pinch or scroll to zoom</div>
              <div>Drag to pan when zoomed in</div>
            </div>
          </div>

          {/* Click outside to close */}
          <div
            className="absolute inset-0 -z-10"
            onClick={() => {
              setIsZoomModalOpen(false);
              resetZoom();
            }}
          />
        </div>
      )}
    </div>
  );
}
