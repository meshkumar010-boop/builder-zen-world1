import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, Plus, Minus, ShoppingBag, MessageCircle } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { formatINR } from '@/services/products'

export default function Cart() {
  const { items: cartItems, updateQuantity, removeItem, totalPrice, itemCount } = useCart()

  const handleUpdateQuantity = (id: number, size: string, color: string, newQuantity: number) => {
    updateQuantity(id, size, color, newQuantity)
  }

  const handleRemoveItem = (id: number, size: string, color: string) => {
    removeItem(id, size, color)
  }

  const subtotal = totalPrice
  const shipping = subtotal > 2000 ? 0 : 199 // Free shipping over ₹2000, otherwise ₹199
  const total = subtotal + shipping

  const handleWhatsAppCheckout = () => {
    // Get current website URL for product links
    const baseUrl = window.location.origin

    const orderDetails = cartItems.map(item => {
      const productLink = `${baseUrl}/product/${item.id}`
      return `${item.quantity}x ${item.name} (${item.size}, ${item.color}) - ${formatINR(item.price * item.quantity)}\n🔗 Product: ${productLink}`
    }).join('\n\n')

    const message = `Hello! 👋\n\nI want to place my order from S2 Wears:\n\n${orderDetails}\n\n💰 Order Summary:\nSubtotal: ${formatINR(subtotal)}\nShipping: ${formatINR(shipping)}\nTotal: ${formatINR(total)}\n\nPlease confirm my order and let me know the payment process. Looking forward to your response!\n\nThank you! 😊`

    const phoneNumber = "919009402002" // S2 Wear WhatsApp number with country code
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

    window.open(whatsappUrl, '_blank')
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h1 className="font-poppins font-bold text-3xl text-foreground mb-4">
              Your cart is empty
            </h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
            </p>
            <Link to="/products">
              <Button size="lg">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-poppins font-bold text-3xl lg:text-4xl text-foreground mb-8">
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={`${item.id}-${item.size}-${item.color}`} className="border-0 bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg bg-accent"
                    />
                    
                    <div className="flex-1 space-y-2">
                      <h3 className="font-poppins font-semibold text-foreground">
                        {item.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Size: {item.size} • Color: {item.color}
                      </p>
                      <p className="font-semibold text-foreground">
                        {formatINR(item.price)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleUpdateQuantity(item.id, item.size, item.color, item.quantity - 1)}
                        className="h-8 w-8"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>

                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleUpdateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                        className="h-8 w-8"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="text-right">
                      <p className="font-poppins font-semibold text-foreground">
                        {formatINR(item.price * item.quantity)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id, item.size, item.color)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="border-0 bg-card sticky top-24">
              <CardContent className="p-6 space-y-6">
                <h2 className="font-poppins font-semibold text-xl text-foreground">
                  Order Summary
                </h2>

                <div className="space-y-3">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal ({itemCount} items)</span>
                    <span>{formatINR(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : formatINR(shipping)}</span>
                  </div>
                  
                  {subtotal < 2000 && (
                    <p className="text-sm text-muted-foreground">
                      Add {formatINR(2000 - subtotal)} more for free shipping!
                    </p>
                  )}
                  
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between font-poppins font-semibold text-lg text-foreground">
                      <span>Total</span>
                      <span>{formatINR(total)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    className="w-full shadow-soft-lg"
                    size="lg"
                    onClick={handleWhatsAppCheckout}
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Checkout via WhatsApp
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Complete your order through WhatsApp for personalized service
                  </p>
                </div>

                <div className="text-center">
                  <Link to="/products">
                    <Button variant="outline" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
