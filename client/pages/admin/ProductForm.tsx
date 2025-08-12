import { useState, useEffect } from "react";
import { useNavigate, useParams, Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";
import {
  addProduct,
  updateProduct,
  getProduct,
  type Product,
} from "@/services/products";
import {
  uploadImageToCloud,
  uploadMultipleImagesToCloud,
  getCloudServiceStatus,
  type CloudUploadResult,
  type MultipleUploadProgress,
} from "@/services/cloudImageUpload";
import { S2LoaderSmall } from "@/components/S2Loader";
import { testProductAddition, debugProductForm } from "@/utils/debugProduct";
import FirebaseDebugPanel from "@/components/FirebaseDebugPanel";
import {
  ArrowLeft,
  X,
  Plus,
  Save,
  Cloud,
  Info,
  Bug,
} from "lucide-react";

const CATEGORIES = [
  "T-Shirts",
  "Hoodies",
  "Jackets",
  "Sweatshirts",
  "Pants",
  "Accessories",
];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const DEFAULT_COLORS = [
  { name: "White", value: "#FFFFFF" },
  { name: "Black", value: "#000000" },
  { name: "Navy", value: "#1E3A8A" },
  { name: "Gray", value: "#6B7280" },
  { name: "Red", value: "#DC2626" },
  { name: "Green", value: "#16A34A" },
];

function ProductFormContent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Omit<Product, "id">>({
    name: "",
    originalPrice: 2999, // Default original price in INR
    price: 2299, // Default discounted price in INR
    description: "",
    category: CATEGORIES[0],
    sizes: ["M", "L"], // Default common sizes
    colors: [{ name: "White", value: "#FFFFFF" }], // Default color
    images: [],
    features: ["100% Cotton", "Machine Washable"], // Default features
  });

  const [newFeature, setNewFeature] = useState("");
  const [newColor, setNewColor] = useState({ name: "", value: "#000000" });
  const [cloudUploading, setCloudUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<MultipleUploadProgress | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [showDebug, setShowDebug] = useState(false);

  // For development/demo purposes, allow access without authentication
  const isDevelopment =
    window.location.hostname === "localhost" ||
    window.location.hostname.includes("builder.codes");

  // Redirect if not logged in (except in development mode)
  if (!user && !isDevelopment) {
    return <Navigate to="/admin/login" replace />;
  }

  useEffect(() => {
    if (isEdit && id) {
      loadProduct(id);
    }
  }, [isEdit, id]);

  // Cleanup blob URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      formData.images.forEach((image) => {
        if (image.startsWith("blob:")) {
          URL.revokeObjectURL(image);
        }
      });
    };
  }, []);

  const loadProduct = async (productId: string) => {
    try {
      setLoading(true);
      const product = await getProduct(productId);
      if (product) {
        setFormData({
          name: product.name,
          originalPrice: product.originalPrice || product.price + 500, // Default to current price + 500 if no original price
          price: product.price,
          description: product.description,
          category: product.category,
          sizes: product.sizes,
          colors: product.colors,
          images: product.images,
          features: product.features,
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚀 Form submission started");
    console.log("📋 Form data:", {
      name: formData.name,
      price: formData.price,
      originalPrice: formData.originalPrice,
      category: formData.category,
      sizes: formData.sizes,
      colors: formData.colors.length,
      images: formData.images.length,
      features: formData.features.length,
    });

    setLoading(true);
    setError("");

    // Basic validation
    if (!formData.name.trim()) {
      setError("Product name is required");
      setLoading(false);
      return;
    }

    if (formData.price <= 0) {
      setError("Discounted price must be greater than 0");
      setLoading(false);
      return;
    }

    if (formData.originalPrice <= 0) {
      setError("Original price must be greater than 0");
      setLoading(false);
      return;
    }

    if (formData.originalPrice < formData.price) {
      setError(
        "Original price must be greater than or equal to discounted price",
      );
      setLoading(false);
      return;
    }

    if (formData.sizes.length === 0) {
      setError("Please select at least one size");
      setLoading(false);
      return;
    }

    try {
      console.log("💾 Attempting to save product...");
      let resultId: string;

      if (isEdit && id) {
        console.log("✏️ Updating product with ID:", id);
        await updateProduct(id, formData);
        resultId = id;
        console.log("✅ Product updated successfully");
      } else {
        console.log("➕ Adding new product");
        resultId = await addProduct(formData);
        console.log("✅ Product added successfully with ID:", resultId);
      }

      // Show detailed success message
      const successMessage = isEdit
        ? `Product "${formData.name}" updated successfully!`
        : `Product "${formData.name}" added successfully!\nProduct ID: ${resultId}`;

      console.log("🎉 Success:", successMessage);
      alert(successMessage);

      // Force a page refresh to ensure data sync
      if (!isEdit) {
        // For new products, clear form and reset to new state
        setFormData({
          name: "",
          originalPrice: 2999,
          price: 2299,
          description: "",
          category: "T-Shirts",
          sizes: ["M", "L"],
          colors: [{ name: "White", value: "#FFFFFF" }],
          images: [],
          features: ["100% Cotton", "Machine Washable"],
        });

        console.log("🔄 Form cleared for next product");
        // Stay on form for adding more products
        // navigate('/admin/dashboard');
      } else {
        // For edits, go back to dashboard
        console.log("📍 Navigating back to dashboard");
        navigate("/admin/dashboard");
      }
    } catch (err: any) {
      console.error("❌ Error saving product:", err);

      // Enhanced error messaging with troubleshooting tips
      let errorMessage = err.message || "Failed to save product.";

      if (err.message?.includes("Failed to fetch")) {
        errorMessage +=
          "\n💡 Tip: This might be due to a browser extension blocking Firebase. Try disabling ad blockers.";
      } else if (err.message?.includes("permission-denied")) {
        errorMessage +=
          "\n💡 Tip: Firebase permissions issue. Check Firestore security rules.";
      } else if (err.message?.includes("unavailable")) {
        errorMessage +=
          "\n💡 Tip: Firebase service temporarily unavailable. The product was saved locally and will sync when connection is restored.";
      } else if (err.message?.includes("INTERNAL ASSERTION FAILED")) {
        errorMessage +=
          "\n💡 Tip: Firebase internal error. The product was saved locally for safety.";
      }

      setError(errorMessage);

      // Log additional debugging info
      console.log("🔍 Debug info:");
      console.log("  - Browser:", navigator.userAgent);
      console.log("  - Online:", navigator.onLine);
      console.log("  - URL:", window.location.href);
      console.log(
        "  - Form valid:",
        !(!formData.name || formData.sizes.length === 0),
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert file to optimized base64
  const fileToBase64 = async (file: File): Promise<string> => {
    try {
      // Check if optimization is needed
      if (needsOptimization(file)) {
        console.log(
          `🔄 Image needs optimization: ${file.name} (${Math.round(file.size / 1024)}KB)`,
        );
        return await fileToOptimizedBase64(file);
      } else {
        // Small image, use as-is
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });
      }
    } catch (error: any) {
      throw new Error(`Image processing failed: ${error.message}`);
    }
  };

  const handleCloudUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    console.log(`🚀 Starting cloud upload for ${fileArray.length} file(s)`);

    setCloudUploading(true);
    setError("");
    setUploadProgress(null);

    try {
      const results = await uploadMultipleImagesToCloud(
        fileArray,
        (progress) => {
          console.log(`📊 Progress: ${progress.current}/${progress.total} - ${progress.fileName}`);
          setUploadProgress(progress);
        }
      );

      // Filter successful uploads
      const successfulUploads = results.filter(result => result.success);
      const failedUploads = results.filter(result => !result.success);

      if (successfulUploads.length > 0) {
        // Add new images to existing ones
        const newImageUrls = successfulUploads.map(result => result.url!);
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...newImageUrls],
        }));

        console.log(`✅ ${successfulUploads.length} image(s) uploaded successfully`);
      }

      if (failedUploads.length > 0) {
        const errorMessage = `${failedUploads.length} upload(s) failed: ${failedUploads.map(f => `${f.fileName} (${f.error})`).join(', ')}`;
        console.error("❌ Some uploads failed:", errorMessage);

        if (successfulUploads.length === 0) {
          setError(errorMessage);
        } else {
          // Show partial success message
          setError(`${successfulUploads.length} uploaded successfully, ${failedUploads.length} failed`);
        }
      }

      // Clear the file input
      e.target.value = "";
    } catch (err: any) {
      console.error("❌ Cloud upload error:", err);
      const errorMessage = err.message || "Upload failed. Please check your connection and try again.";
      setError(errorMessage);
    } finally {
      setCloudUploading(false);
      setUploadProgress(null);
      console.log("🏁 Upload process completed");
    }
  };

  const removeImage = (index: number) => {
    const imageToRemove = formData.images[index];

    // Clean up blob URLs to prevent memory leaks
    if (imageToRemove && imageToRemove.startsWith("blob:")) {
      URL.revokeObjectURL(imageToRemove);
    }

    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const toggleSize = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const addColor = () => {
    if (newColor.name && newColor.value) {
      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, newColor],
      }));
      setNewColor({ name: "", value: "#000000" });
    }
  };

  const removeColor = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleDebugTest = async () => {
    setDebugInfo("Running debug test...");

    try {
      // Test product addition
      const testResult = await testProductAddition();

      // Get debug info
      const debugResult = await debugProductForm();

      const info = `
🧪 Product Addition Test:
${testResult.success ? "✅" : "❌"} Success: ${testResult.success}
${testResult.error ? `❌ Error: ${testResult.error}` : ""}
${testResult.productId ? `📦 Product ID: ${testResult.productId}` : ""}
${testResult.totalProducts ? `📊 Total Products: ${testResult.totalProducts}` : ""}

📋 Form Debug Info:
📱 Form State: ${debugResult.formState}
☁��� Service Status: ${debugResult.serviceStatus}
${debugResult.errors.length > 0 ? `❌ Errors: ${debugResult.errors.join(", ")}` : "✅ No errors detected"}

🔧 Development Info:
🌐 Environment: ${import.meta.env.DEV ? "Development" : "Production"}
🏠 Hostname: ${window.location.hostname}
🔗 Current URL: ${window.location.href}
`;

      setDebugInfo(info);
    } catch (error: any) {
      setDebugInfo(`Debug test failed: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              to="/admin/dashboard"
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-poppins font-bold text-3xl text-foreground">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit
              ? "Update product details and inventory"
              : "Create a new product for your store"}
          </p>

          {/* Status indicator */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 <strong>Admin Panel Status:</strong> Your product data will be
              saved (Firebase integration active with localStorage fallback for
              reliability)
            </p>
          </div>


          {/* Debug Panel (Development only) */}
          {import.meta.env.DEV && (
            <div className="space-y-4">
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    🐛 Debug Panel (Development Mode)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDebugTest}
                      className="text-yellow-600 dark:text-yellow-400"
                    >
                      <Bug className="h-4 w-4 mr-1" />
                      Test Product Addition
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDebug(!showDebug)}
                      className="text-yellow-600 dark:text-yellow-400"
                    >
                      {showDebug ? "Hide" : "Show"} Debug
                    </Button>
                  </div>
                </div>

                {showDebug && debugInfo && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded border">
                    <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {debugInfo}
                    </pre>
                  </div>
                )}
              </div>

              {/* Firebase Debug Panel */}
              <FirebaseDebugPanel />
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Premium Cotton T-Shirt"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">
                      Original Price (���) *
                    </Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      step="1"
                      min="0"
                      value={formData.originalPrice}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          originalPrice: parseInt(e.target.value) || 0,
                        }))
                      }
                      placeholder="2999"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Discounted Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="1"
                      min="0"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          price: parseInt(e.target.value) || 0,
                        }))
                      }
                      placeholder="2299"
                      required
                    />
                  </div>
                </div>

                {formData.originalPrice > 0 &&
                  formData.price > 0 &&
                  formData.originalPrice > formData.price && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        💰 <strong>Discount:</strong>{" "}
                        {Math.round(
                          ((formData.originalPrice - formData.price) /
                            formData.originalPrice) *
                            100,
                        )}
                        % OFF (Save ₹{formData.originalPrice - formData.price})
                      </p>
                    </div>
                  )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Product Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Write a detailed description of your product. Include materials, fit, style, and key features that customers should know about..."
                  rows={5}
                  required
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.description.length}/500 characters (Be descriptive
                  but concise)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle>Product Image</CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload one high-quality image that showcases your product
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Cloud Service Status */}
              {(() => {
                const cloudStatus = getCloudServiceStatus();
                return (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-2">
                      <Cloud className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        {cloudStatus.serviceName} Cloud Upload
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        cloudStatus.configured
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                          : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200'
                      }`}>
                        {cloudStatus.configured ? 'Configured' : 'Setup Required'}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1">
                      {cloudStatus.features.map((feature, index) => (
                        <p key={index} className="text-xs text-blue-700 dark:text-blue-300">
                          • {feature}
                        </p>
                      ))}
                    </div>
                    {!cloudStatus.configured && (
                      <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-900/10 rounded text-xs">
                        <p className="font-medium text-orange-800 dark:text-orange-200 mb-1">Setup Required:</p>
                        {cloudStatus.configHelp.steps.map((step, index) => (
                          <p key={index} className="text-orange-700 dark:text-orange-300">{step}</p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Multiple Upload Option */}
              <div className="space-y-4">
                <Label>Upload Product Images (Max 10MB each)</Label>
                <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 text-center hover:border-primary/50 transition-colors bg-primary/5">
                  <input
                    type="file"
                    id="cloud-images"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleCloudUpload}
                    className="hidden"
                    disabled={cloudUploading}
                  />
                  <label htmlFor="cloud-images" className="cursor-pointer">
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                        <Cloud className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        {cloudUploading ? (
                          <div className="space-y-2">
                            <S2LoaderSmall text="Uploading to cloud..." />
                            {uploadProgress && (
                              <p className="text-xs text-muted-foreground">
                                {uploadProgress.fileName} ({uploadProgress.current}/{uploadProgress.total})
                              </p>
                            )}
                          </div>
                        ) : (
                          <>
                            <p className="text-base font-medium text-foreground">
                              Click to Upload Images
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Select multiple files • JPEG, PNG, or WebP • Max 10MB each
                            </p>
                            <p className="text-xs text-primary mt-1">
                              Powered by Cloudinary CDN
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </label>
                </div>

                {/* Upload Progress Bar */}
                {cloudUploading && uploadProgress && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-foreground">
                        Upload Progress
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {uploadProgress.current} of {uploadProgress.total} files
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Current: {uploadProgress.fileName}
                    </p>
                  </div>
                )}
              </div>


              {formData.images.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Product image uploaded
                  </p>
                  <div className="flex justify-center">
                    <div className="relative group max-w-sm">
                      <div className="relative overflow-hidden rounded-lg border border-border bg-accent">
                        <img
                          src={formData.images[0]}
                          alt="Product image"
                          className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                          onError={(e) => {
                            console.warn("Image failed to load:", formData.images[0]);
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                          onLoad={() => {
                            console.log("Image loaded successfully:", formData.images[0]);
                          }}
                        />
                        <div className="absolute top-2 right-2">
                          <div className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                            ☁️ Cloud Hosted
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(0)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    💡 Hosted on Cloudinary CDN for fast global delivery
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sizes */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle>Available Sizes</CardTitle>
              <p className="text-sm text-muted-foreground">
                Select all sizes that will be available for this product
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {SIZES.map((size) => (
                  <Button
                    key={size}
                    type="button"
                    variant={
                      formData.sizes.includes(size) ? "default" : "outline"
                    }
                    onClick={() => toggleSize(size)}
                    className="h-12 text-base font-medium"
                  >
                    {size}
                  </Button>
                ))}
              </div>
              <div className="bg-accent/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Selected sizes:</strong>{" "}
                  {formData.sizes.length > 0
                    ? formData.sizes.join(", ")
                    : "None selected"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tip: Most products should offer at least S, M, L, and XL sizes
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Colors */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle>Available Colors</CardTitle>
              <p className="text-sm text-muted-foreground">
                Add colors that customers can choose from
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Add New Color</Label>
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <Input
                      placeholder="Enter color name (e.g., Navy Blue)"
                      value={newColor.name}
                      onChange={(e) =>
                        setNewColor((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm">Color:</Label>
                    <Input
                      type="color"
                      value={newColor.value}
                      onChange={(e) =>
                        setNewColor((prev) => ({
                          ...prev,
                          value: e.target.value,
                        }))
                      }
                      className="w-16 h-10 p-1 border rounded"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={addColor}
                    disabled={!newColor.name}
                    className="px-6"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.colors.map((color, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center space-x-2"
                  >
                    <div
                      className="w-3 h-3 rounded-full border"
                      style={{ backgroundColor: color.value }}
                    />
                    <span>{color.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeColor(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Quick add:</p>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_COLORS.map((color) => (
                    <Button
                      key={color.name}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (
                          !formData.colors.some((c) => c.name === color.name)
                        ) {
                          setFormData((prev) => ({
                            ...prev,
                            colors: [...prev.colors, color],
                          }));
                        }
                      }}
                      className="flex items-center space-x-2"
                    >
                      <div
                        className="w-3 h-3 rounded-full border"
                        style={{ backgroundColor: color.value }}
                      />
                      <span>{color.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="border-0 shadow-soft">
            <CardHeader>
              <CardTitle>Product Features</CardTitle>
              <p className="text-sm text-muted-foreground">
                Highlight key features and benefits of your product
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Add Product Feature</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter a feature (e.g., 100% Organic Cotton, Machine Washable)"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addFeature())
                    }
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={addFeature}
                    disabled={!newFeature.trim()}
                    className="px-6"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center space-x-2"
                  >
                    <span>{feature}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeFeature(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Link to="/admin/dashboard">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={loading} className="min-w-[140px]">
              {loading ? (
                <S2LoaderSmall />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEdit ? "Update Product" : "Create Product"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProductForm() {
  return (
    <ProtectedAdminRoute>
      <ProductFormContent />
    </ProtectedAdminRoute>
  );
}
