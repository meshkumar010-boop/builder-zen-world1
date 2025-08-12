import { addProduct } from '../services/products';

const sampleProducts = [
  // T-Shirts (5 products)
  {
    name: "Classic White Crew Neck",
    price: 24.99,
    description: "Essential white t-shirt made from premium cotton. Perfect for layering or wearing on its own. Features a comfortable crew neck and relaxed fit.",
    category: "T-Shirts",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "White", value: "#FFFFFF" },
      { name: "Black", value: "#000000" },
      { name: "Gray", value: "#6B7280" }
    ],
    images: ["https://images.pexels.com/photos/6786894/pexels-photo-6786894.jpeg?auto=compress&cs=tinysrgb&w=800"],
    features: ["100% Cotton", "Machine Washable", "Pre-shrunk", "Reinforced Stitching"]
  },
  {
    name: "Vintage Logo Graphic Tee",
    price: 32.99,
    description: "Retro-inspired graphic t-shirt with vintage S2 Wear logo. Soft-washed for that lived-in feel. Perfect for casual outings.",
    category: "T-Shirts",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Navy", value: "#1E3A8A" },
      { name: "Forest Green", value: "#16A34A" },
      { name: "Burgundy", value: "#7C2D12" }
    ],
    images: ["https://images.pexels.com/photos/4887245/pexels-photo-4887245.jpeg?auto=compress&cs=tinysrgb&w=800"],
    features: ["Vintage Wash", "Screen Print Design", "Cotton Blend", "Ribbed Collar"]
  },
  {
    name: "Premium V-Neck Tee",
    price: 28.99,
    description: "Sophisticated v-neck t-shirt crafted from organic cotton. Flattering cut suitable for both casual and smart-casual occasions.",
    category: "T-Shirts",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Charcoal", value: "#374151" },
      { name: "Wine", value: "#7F1D1D" },
      { name: "Olive", value: "#365314" }
    ],
    images: ["https://images.pexels.com/photos/13211985/pexels-photo-13211985.jpeg?auto=compress&cs=tinysrgb&w=800"],
    features: ["Organic Cotton", "V-Neck Design", "Tapered Fit", "Eco-Friendly"]
  },
  {
    name: "Striped Long Sleeve",
    price: 36.99,
    description: "Classic striped long sleeve shirt with modern proportions. Perfect for transitional weather and effortless styling.",
    category: "T-Shirts",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Navy/White", value: "#1E3A8A" },
      { name: "Black/Gray", value: "#000000" }
    ],
    images: ["https://images.pexels.com/photos/6764049/pexels-photo-6764049.jpeg?auto=compress&cs=tinysrgb&w=800"],
    features: ["Cotton Jersey", "Ribbed Cuffs", "Classic Stripes", "Regular Fit"]
  },
  {
    name: "Oversized Pocket Tee",
    price: 29.99,
    description: "Relaxed oversized t-shirt with front chest pocket. Contemporary street style with maximum comfort and versatility.",
    category: "T-Shirts",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Sand", value: "#D6D3D1" },
      { name: "Sage", value: "#84CC16" },
      { name: "Rust", value: "#EA580C" }
    ],
    images: ["https://images.pexels.com/photos/3766211/pexels-photo-3766211.jpeg?auto=compress&cs=tinysrgb&w=800"],
    features: ["Oversized Fit", "Chest Pocket", "Drop Shoulder", "Heavyweight Cotton"]
  },

  // Hoodies (4 products)
  {
    name: "Essential Pullover Hoodie",
    price: 64.99,
    description: "Cozy pullover hoodie with kangaroo pocket and adjustable drawstring hood. Perfect for layering and casual wear.",
    category: "Hoodies",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Heather Gray", value: "#9CA3AF" },
      { name: "Black", value: "#000000" },
      { name: "Navy", value: "#1E3A8A" }
    ],
    images: ["https://images.pexels.com/photos/3253490/pexels-photo-3253490.jpeg?auto=compress&cs=tinysrgb&w=800"],
    features: ["Cotton Fleece", "Kangaroo Pocket", "Ribbed Cuffs", "Drawstring Hood"]
  },
  {
    name: "Zip-Up Hoodie Jacket",
    price: 72.99,
    description: "Versatile zip-up hoodie with full-zip closure and side pockets. Great for layering or wearing as outerwear.",
    category: "Hoodies",
    sizes: ["M", "L", "XL", "XXL"],
    colors: [
      { name: "Charcoal", value: "#374151" },
      { name: "Forest", value: "#16A34A" },
      { name: "Maroon", value: "#7C2D12" }
    ],
    images: ["https://images.pexels.com/photos/10481315/pexels-photo-10481315.jpeg?auto=compress&cs=tinysrgb&w=800"],
    features: ["Full Zip", "Side Pockets", "Cotton Blend", "Athletic Fit"]
  },
  {
    name: "Cropped Hoodie",
    price: 58.99,
    description: "Trendy cropped hoodie with a modern silhouette. Perfect for pairing with high-waisted bottoms for a contemporary look.",
    category: "Hoodies",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Cream", value: "#FEF3C7" },
      { name: "Pink", value: "#F472B6" },
      { name: "Lavender", value: "#C084FC" }
    ],
    images: ["https://images.pexels.com/photos/6276009/pexels-photo-6276009.jpeg?auto=compress&cs=tinysrgb&w=800"],
    features: ["Cropped Length", "Soft Fleece", "Boxy Fit", "Thumb Holes"]
  },
  {
    name: "Heavyweight Hoodie",
    price: 79.99,
    description: "Premium heavyweight hoodie designed for durability and warmth. Features reinforced construction and premium materials.",
    category: "Hoodies",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Black", value: "#000000" },
      { name: "Stone", value: "#78716C" },
      { name: "Olive Drab", value: "#365314" }
    ],
    images: ["https://images.pexels.com/photos/4887229/pexels-photo-4887229.jpeg?auto=compress&cs=tinysrgb&w=800"],
    features: ["Heavyweight Fabric", "Double-Lined Hood", "Reinforced Seams", "Premium Cotton"]
  },

  // Jackets (4 products)
  {
    name: "Classic Denim Jacket",
    price: 89.99,
    description: "Timeless denim jacket with vintage-inspired details. Features classic button closure and multiple pockets for functionality.",
    category: "Jackets",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Blue Denim", value: "#1E40AF" },
      { name: "Black Denim", value: "#1F2937" },
      { name: "Light Wash", value: "#60A5FA" }
    ],
    images: ["https://images.pexels.com/photos/6276009/pexels-photo-6276009.jpeg?auto=compress&cs=tinysrgb&w=800"],
    features: ["100% Cotton Denim", "Button Closure", "Chest Pockets", "Classic Fit"]
  },
  {
    name: "Bomber Jacket",
    price: 94.99,
    description: "Contemporary bomber jacket with ribbed cuffs and hem. Perfect for adding a modern edge to any outfit.",
    category: "Jackets",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Black", value: "#000000" },
      { name: "Olive", value: "#365314" },
      { name: "Navy", value: "#1E3A8A" }
    ],
    images: ["https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=800"],
    features: ["Zip Closure", "Ribbed Details", "Satin Lining", "Regular Fit"]
  },
  {
    name: "Windbreaker",
    price: 67.99,
    description: "Lightweight windbreaker perfect for unpredictable weather. Water-resistant and packable for on-the-go convenience.",
    category: "Jackets",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Royal Blue", value: "#2563EB" },
      { name: "Red", value: "#DC2626" },
      { name: "Yellow", value: "#EAB308" }
    ],
    images: ["https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg?auto=compress&cs=tinysrgb&w=800"],
    features: ["Water Resistant", "Packable", "Mesh Lining", "Elastic Cuffs"]
  },
  {
    name: "Leather Jacket",
    price: 189.99,
    description: "Premium leather jacket with classic moto styling. Crafted from genuine leather with attention to detail and quality.",
    category: "Jackets",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Black", value: "#000000" },
      { name: "Brown", value: "#92400E" }
    ],
    images: ["https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=800"],
    features: ["Genuine Leather", "Zip Closure", "Multiple Pockets", "Moto Style"]
  },

  // Sweatshirts (3 products)
  {
    name: "Classic Crewneck Sweatshirt",
    price: 52.99,
    description: "Comfortable crewneck sweatshirt with a relaxed fit. Made from soft cotton blend for all-day comfort.",
    category: "Sweatshirts",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Gray", value: "#6B7280" },
      { name: "Navy", value: "#1E3A8A" },
      { name: "Cream", value: "#FEF3C7" }
    ],
    images: ["https://images.pexels.com/photos/6311120/pexels-photo-6311120.jpeg?auto=compress&cs=tinysrgb&w=800"],
    features: ["Cotton Blend", "Ribbed Trim", "Relaxed Fit", "Soft Interior"]
  },
  {
    name: "Half-Zip Pullover",
    price: 59.99,
    description: "Versatile half-zip pullover that transitions easily from gym to street. Features moisture-wicking properties.",
    category: "Sweatshirts",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Black", value: "#000000" },
      { name: "Charcoal", value: "#374151" },
      { name: "Blue", value: "#2563EB" }
    ],
    images: ["https://images.pexels.com/photos/8532754/pexels-photo-8532754.jpeg?auto=compress&cs=tinysrgb&w=800"],
    features: ["Half-Zip Design", "Moisture Wicking", "Athletic Fit", "Quick Dry"]
  },
  {
    name: "Embroidered Logo Sweatshirt",
    price: 64.99,
    description: "Premium sweatshirt featuring embroidered S2 Wear logo. Luxurious feel with attention to detail and craftsmanship.",
    category: "Sweatshirts",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Forest Green", value: "#16A34A" },
      { name: "Burgundy", value: "#7C2D12" },
      { name: "Camel", value: "#92400E" }
    ],
    images: ["https://images.pexels.com/photos/6764139/pexels-photo-6764139.jpeg?auto=compress&cs=tinysrgb&w=800"],
    features: ["Embroidered Logo", "Premium Cotton", "Regular Fit", "Quality Stitching"]
  },

  // Pants (2 products)
  {
    name: "Relaxed Fit Jeans",
    price: 79.99,
    description: "Comfortable relaxed fit jeans with classic five-pocket styling. Perfect for everyday wear with a timeless appeal.",
    category: "Pants",
    sizes: ["30", "32", "34", "36", "38"],
    colors: [
      { name: "Dark Wash", value: "#1F2937" },
      { name: "Medium Wash", value: "#374151" },
      { name: "Light Wash", value: "#9CA3AF" }
    ],
    images: ["https://images.pexels.com/photos/5698841/pexels-photo-5698841.jpeg?auto=compress&cs=tinysrgb&w=800"],
    features: ["Cotton Denim", "Five Pockets", "Button Fly", "Relaxed Fit"]
  },
  {
    name: "Cargo Pants",
    price: 69.99,
    description: "Functional cargo pants with multiple pockets and adjustable cuffs. Perfect blend of utility and street style.",
    category: "Pants",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Khaki", value: "#A3A3A3" },
      { name: "Black", value: "#000000" },
      { name: "Olive", value: "#365314" }
    ],
    images: ["https://images.pexels.com/photos/7679471/pexels-photo-7679471.jpeg?auto=compress&cs=tinysrgb&w=800"],
    features: ["Multiple Pockets", "Cotton Twill", "Adjustable Cuffs", "Regular Fit"]
  },

  // Accessories (2 products)
  {
    name: "Classic Baseball Cap",
    price: 24.99,
    description: "Timeless baseball cap with embroidered S2 Wear logo. Adjustable strap ensures perfect fit for all head sizes.",
    category: "Accessories",
    sizes: ["One Size"],
    colors: [
      { name: "Black", value: "#000000" },
      { name: "Navy", value: "#1E3A8A" },
      { name: "White", value: "#FFFFFF" },
      { name: "Gray", value: "#6B7280" }
    ],
    images: ["https://images.pexels.com/photos/7679659/pexels-photo-7679659.jpeg?auto=compress&cs=tinysrgb&w=800"],
    features: ["Adjustable Strap", "Embroidered Logo", "Cotton Twill", "Curved Visor"]
  },
  {
    name: "Logo Beanie",
    price: 19.99,
    description: "Warm knit beanie with woven S2 Wear label. Perfect for cold weather while maintaining street style credibility.",
    category: "Accessories",
    sizes: ["One Size"],
    colors: [
      { name: "Black", value: "#000000" },
      { name: "Gray", value: "#6B7280" },
      { name: "Navy", value: "#1E3A8A" },
      { name: "Burgundy", value: "#7C2D12" }
    ],
    images: ["https://images.pexels.com/photos/6311466/pexels-photo-6311466.jpeg?auto=compress&cs=tinysrgb&w=800"],
    features: ["Knit Construction", "Woven Label", "Acrylic Blend", "One Size Fits Most"]
  }
];

export async function addSampleProducts() {
  console.log('Starting to add sample products...');
  
  for (let i = 0; i < sampleProducts.length; i++) {
    const product = sampleProducts[i];
    try {
      console.log(`Adding product ${i + 1}/20: ${product.name}`);
      const productId = await addProduct(product);
      console.log(`✅ Added ${product.name} with ID: ${productId}`);
      
      // Small delay between additions to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`❌ Failed to add ${product.name}:`, error);
    }
  }
  
  console.log('🎉 Finished adding all sample products!');
}

// Auto-run if this file is executed directly
if (typeof window !== 'undefined') {
  addSampleProducts();
}
