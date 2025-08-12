// Debug utility for testing product addition
import { addProduct, getProducts, type Product } from "@/services/products";

export async function testProductAddition(): Promise<{
  success: boolean;
  error?: string;
  productId?: string;
  totalProducts?: number;
}> {
  try {
    console.log("🧪 Starting product addition test...");

    // Create a simple test product
    const testProduct: Omit<Product, "id"> = {
      name: `Test Product ${Date.now()}`,
      price: 2299,
      originalPrice: 2999,
      description:
        "This is a test product to verify the product addition functionality works correctly.",
      category: "T-Shirts",
      sizes: ["M", "L"],
      colors: [{ name: "Test Color", value: "#ff0000" }],
      images: ["/placeholder.svg"],
      features: ["Test Feature", "Debug Product"],
    };

    console.log("📦 Test product data:", testProduct);

    // Try to add the product
    const productId = await addProduct(testProduct);
    console.log("✅ Product added with ID:", productId);

    // Verify the product was saved
    const allProducts = await getProducts();
    const addedProduct = allProducts.find((p) => p.id === productId);

    if (addedProduct) {
      console.log("✅ Product verified in storage:", addedProduct.name);
      return {
        success: true,
        productId,
        totalProducts: allProducts.length,
      };
    } else {
      throw new Error("Product was not found after adding");
    }
  } catch (error: any) {
    console.error("❌ Product addition test failed:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    };
  }
}

export async function debugProductForm(): Promise<{
  formState: string;
  serviceStatus: string;
  errors: string[];
}> {
  const errors: string[] = [];

  // Check localStorage
  let formState = "Unknown";
  try {
    const products = localStorage.getItem("s2-wear-products");
    if (products) {
      const parsedProducts = JSON.parse(products);
      formState = `${parsedProducts.length} products in localStorage`;
    } else {
      formState = "No products in localStorage";
    }
  } catch (error: any) {
    errors.push(`localStorage error: ${error.message}`);
    formState = "localStorage error";
  }

  // Check Firebase connectivity
  let serviceStatus = "Unknown";
  try {
    // This will use the same connection logic as the products service
    const products = await getProducts();
    serviceStatus = `Service accessible, ${products.length} products loaded`;
  } catch (error: any) {
    errors.push(`Service error: ${error.message}`);
    serviceStatus = "Service error";
  }

  return {
    formState,
    serviceStatus,
    errors,
  };
}

// Export for window debugging (development only)
if (typeof window !== "undefined" && import.meta.env.DEV) {
  (window as any).debugProduct = {
    testProductAddition,
    debugProductForm,
  };
}
