import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { AuthProvider } from "./hooks/useAuth";
import { CartProvider } from "./hooks/useCart";
import { Layout } from "./components/layout";
import { setupFirebaseDevHelper } from "./utils/firebaseDevHelper";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import AdminLogin from "./pages/admin/Login";
import AdminSignup from "./pages/admin/Signup";
import AdminDashboard from "./pages/admin/Dashboard";
import ProductForm from "./pages/admin/ProductForm";
import NotFound from "./pages/NotFound";

// Initialize Firebase development helper
const firebaseCleanup = setupFirebaseDevHelper();

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider defaultTheme="light" storageKey="s2-wear-theme">
          <AuthProvider>
            <CartProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public routes with layout */}
                  <Route
                    path="/"
                    element={
                      <Layout>
                        <Home />
                      </Layout>
                    }
                  />
                  <Route
                    path="/products"
                    element={
                      <Layout>
                        <Products />
                      </Layout>
                    }
                  />
                  <Route
                    path="/product/:id"
                    element={
                      <Layout>
                        <ProductDetail />
                      </Layout>
                    }
                  />
                  <Route
                    path="/cart"
                    element={
                      <Layout>
                        <Cart />
                      </Layout>
                    }
                  />

                  {/* Admin routes without main layout */}
                  <Route
                    path="/admin/login"
                    element={
                      <ErrorBoundary>
                        <AdminLogin />
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/admin/signup"
                    element={
                      <ErrorBoundary>
                        <AdminSignup />
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ErrorBoundary>
                        <AdminDashboard />
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/admin/products/new"
                    element={
                      <ErrorBoundary>
                        <ProductForm />
                      </ErrorBoundary>
                    }
                  />
                  <Route
                    path="/admin/products/edit/:id"
                    element={
                      <ErrorBoundary>
                        <ProductForm />
                      </ErrorBoundary>
                    }
                  />

                  <Route
                    path="*"
                    element={
                      <Layout>
                        <NotFound />
                      </Layout>
                    }
                  />
                </Routes>
              </BrowserRouter>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

// Properly manage React root to avoid createRoot warnings during HMR
const container = document.getElementById("root")!;

// Check if we already have a root instance (for HMR compatibility)
let root = (container as any)._reactRoot;

if (!root) {
  root = createRoot(container);
  (container as any)._reactRoot = root;
}

root.render(<App />);

// Clean up on hot module replacement
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if (root) {
      root.unmount();
      delete (container as any)._reactRoot;
    }
  });
}
