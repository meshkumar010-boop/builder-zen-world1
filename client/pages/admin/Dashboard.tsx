import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import ProtectedAdminRoute from '@/components/ProtectedAdminRoute';
import { getProducts, deleteProduct, formatINR, type Product } from '@/services/products';
import { addAllSampleProducts } from '@/utils/sampleProducts';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  LogOut,
  DollarSign,
  ShoppingBag,
  TrendingUp
} from 'lucide-react';

function AdminDashboardContent() {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await getProducts();

      // If no products in Firebase, show sample products for demo
      if (productsData.length === 0) {
        const sampleProducts = [
          {
            id: 'sample-1',
            name: "Premium Cotton T-Shirt",
            price: 29.99,
            description: "Made from 100% organic cotton with a classic fit",
            category: "T-Shirts",
            sizes: ["S", "M", "L", "XL"],
            colors: [{ name: "White", value: "#FFFFFF" }, { name: "Black", value: "#000000" }],
            images: ["https://images.pexels.com/photos/6786894/pexels-photo-6786894.jpeg?auto=compress&cs=tinysrgb&w=800"],
            features: ["100% Organic Cotton", "Machine Washable"]
          },
          {
            id: 'sample-2',
            name: "Cozy Pullover Hoodie",
            price: 59.99,
            description: "Comfortable hoodie perfect for casual wear",
            category: "Hoodies",
            sizes: ["M", "L", "XL"],
            colors: [{ name: "Gray", value: "#6B7280" }],
            images: ["https://images.pexels.com/photos/3253490/pexels-photo-3253490.jpeg?auto=compress&cs=tinysrgb&w=800"],
            features: ["Cotton Blend", "Kangaroo Pocket"]
          }
        ];
        setProducts(sampleProducts);
      } else {
        setProducts(productsData);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete product');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err: any) {
      console.error('Failed to logout:', err);
    }
  };

  const totalProducts = products.length;
  const totalValue = products.reduce((sum, product) => sum + product.price, 0);
  const avgPrice = totalProducts > 0 ? totalValue / totalProducts : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">S2</span>
                </div>
                <span className="font-poppins font-bold text-xl text-foreground">S2 Wears Admin</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {user?.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-poppins font-bold text-3xl text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your S2 Wears products and inventory without touching any code</p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={async () => {
                if (confirm('Add 20 sample products to your store? This will populate your catalog with diverse clothing items across all categories.')) {
                  try {
                    await addAllSampleProducts();
                    alert('🎉 Successfully added 20 sample products! Your store is now fully stocked. Refreshing page...');
                    window.location.reload();
                  } catch (error) {
                    console.error('Error adding sample products:', error);
                    alert('Some products failed to add. Check console for details and try again.');
                  }
                }
              }}
              className="shadow-soft"
            >
              🎯 Add 20 Sample Products
            </Button>
            <Link to="/admin/products/new">
              <Button size="lg" className="shadow-soft">
                <Plus className="h-5 w-5 mr-2" />
                Add New Product
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Guide */}
        <Card className="border-0 bg-gradient-to-r from-primary/5 to-orange-500/5 shadow-soft mb-8">
          <CardContent className="p-6">
            <h2 className="font-poppins font-semibold text-lg text-foreground mb-3">
              🚀 Quick Start Guide
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <h3 className="font-medium text-foreground">➕ Add Products</h3>
                <p className="text-muted-foreground">Click "Add New Product" to create products with images, descriptions, sizes, and colors</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-foreground">✏️ Edit Products</h3>
                <p className="text-muted-foreground">Click "Edit" on any product to modify details, update images, or change pricing</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-foreground">🗑️ Remove Products</h3>
                <p className="text-muted-foreground">Use "Delete" to remove products that are no longer available</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 bg-card shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="font-poppins font-bold text-2xl text-foreground">{totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Price</p>
                  <p className="font-poppins font-bold text-2xl text-foreground">{formatINR(avgPrice)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="font-poppins font-bold text-2xl text-foreground">{formatINR(totalValue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Table */}
        <Card className="border-0 bg-card shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5" />
              <span>Products</span>
            </CardTitle>
            <CardDescription>
              Manage your product inventory and details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-destructive">{error}</p>
                <Button variant="outline" onClick={loadProducts} className="mt-4">
                  Try Again
                </Button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No products found</p>
                <Link to="/admin/products/new">
                  <Button>Add Your First Product</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <img
                        src={product.images[0] || '/placeholder.svg'}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg bg-accent"
                      />
                      <div>
                        <h3 className="font-poppins font-semibold text-foreground">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="font-semibold text-foreground">{formatINR(product.price)}</span>
                          <Badge variant="secondary">{product.sizes.length} sizes</Badge>
                          <Badge variant="outline">{product.colors.length} colors</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Link to={`/admin/products/edit/${product.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id!)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedAdminRoute>
      <AdminDashboardContent />
    </ProtectedAdminRoute>
  );
}
