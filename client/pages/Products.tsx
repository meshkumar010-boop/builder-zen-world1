import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Star, Filter, ShoppingCart } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { getProducts, formatINR, getDiscountPercentage, type Product } from '@/services/products'

const CATEGORIES = ['All', 'T-Shirts', 'Hoodies', 'Jackets', 'Sweatshirts', 'Pants', 'Accessories']

export default function Products() {
  const { addItem } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const productsData = await getProducts()
      setProducts(productsData)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(product => product.category === activeCategory)

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id!,
      name: product.name,
      price: product.price,
      image: product.images[0] || '/placeholder.svg',
      size: product.sizes[0] || 'M',
      color: product.colors[0]?.name || 'Default',
      quantity: 1
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
            <p className="text-muted-foreground animate-pulse">Loading products...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-poppins font-bold text-4xl md:text-5xl text-foreground mb-4 animate-slide-up">
            Our Collection
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in stagger-delay-1">
            Discover premium streetwear that combines comfort, style, and quality craftsmanship
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12 animate-scale-in stagger-delay-2">
          {CATEGORIES.map((category, index) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              onClick={() => setActiveCategory(category)}
              className={`font-medium transition-all duration-300 hover-lift ${activeCategory === category ? 'animate-pulse-glow' : 'hover-glow'}`}
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <Filter className="h-4 w-4 mr-2" />
              {category}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <p className="text-muted-foreground mb-4">
              {activeCategory === 'All'
                ? 'No products available yet. Check back soon!'
                : `No products found in ${activeCategory} category.`}
            </p>
            <Link to="/admin/dashboard">
              <Button variant="outline" className="hover-lift">Add Products via Admin Panel</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product, index) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className={`block group animate-scale-in stagger-delay-${(index % 4) + 1}`}
              >
                <Card className="group-hover:shadow-soft-lg transition-all duration-500 border-0 bg-card cursor-pointer hover-lift overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={product.images[0] || '/placeholder.svg'}
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-all duration-500"
                      />
                      <div className="absolute top-3 left-3 transform group-hover:scale-105 transition-transform duration-300">
                        <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium animate-pulse-glow">
                          {product.category}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleAddToCart(product)
                          }}
                          className="shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 hover-glow"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Quick Add
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors duration-300 flex-1 line-clamp-1">
                          {product.name}
                        </h3>
                        <div className="flex items-center space-x-1 group-hover:scale-105 transition-transform duration-300">
                          <Star className="h-3 w-3 fill-current text-yellow-500 animate-pulse" />
                          <span className="text-xs text-muted-foreground">
                            {product.rating || 4.5}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 group-hover:text-foreground transition-colors duration-300">
                        {product.description}
                      </p>

                      <div className="flex items-center space-x-2">
                        {product.colors.slice(0, 3).map((color, index) => (
                          <div
                            key={index}
                            className="w-4 h-4 rounded-full border border-border group-hover:scale-110 transition-transform duration-300 hover:scale-125"
                            style={{ backgroundColor: color.value, animationDelay: `${index * 0.1}s` }}
                            title={color.name}
                          />
                        ))}
                        {product.colors.length > 3 && (
                          <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors duration-300">
                            +{product.colors.length - 3} more
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-poppins font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-300">
                              {formatINR(product.price)}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-sm text-muted-foreground line-through">
                                {formatINR(product.originalPrice)}
                              </span>
                            )}
                          </div>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <div className="text-xs text-green-600 font-medium animate-pulse bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                              {getDiscountPercentage(product.originalPrice, product.price)}% OFF
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground text-right group-hover:text-foreground transition-colors duration-300">
                          <div>{product.sizes.length} sizes</div>
                          <div>{product.colors.length} colors</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
