import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Star,
  ShoppingCart,
  Heart,
  ArrowLeft,
  Check,
  MessageCircle,
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
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Product not found</p>
          <Link to="/products" className="mt-4 inline-block">
            <Button variant="outline">Back to Products</Button>
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
        image: product.images[0],
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
        ? `\n💰 Special Offer: ${getDiscountPercentage(product.originalPrice, product.price)}% OFF! (Save ${formatINR(product.originalPrice - product.price)})`
        : "";

    const message = `Hello! 👋\n\nI want to place my order for this amazing product:\n\n🛍️ ${product.name}\n💰 Price: ${formatINR(product.price)}${discountText}\n🔗 Product Link: ${productUrl}\n\nPlease let me know how to place the order. Thank you! 😊`;

    const phoneNumber = "919009402002";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
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
            <div className="aspect-square bg-card rounded-2xl overflow-hidden">
              <img
                src={
                  product.images?.[selectedImage] ||
                  product.images?.[0] ||
                  "/placeholder.svg"
                }
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-3 gap-3">
              {(product.images || []).map((image, index) => (
                <button
                  key={`thumbnail-${index}`}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-card rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
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
    </div>
  );
}
