
import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ProductCard, Product } from "@/components/ProductCard";
import { Cart, CartItem } from "@/components/Cart";
import { ProductModal } from "@/components/ProductModal";
import { Checkout } from "@/components/Checkout";
import { MobileCartFooter } from "@/components/MobileCartFooter";
import { categories, products } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { toast } = useToast();

  // Filter products by category
  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") return products;
    return products.filter(product => product.category === activeCategory);
  }, [activeCategory]);

  // Get cart item count
  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Add product to cart (simple version for quick add)
  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...prev, { product, quantity: 1 }];
    });

    toast({
      title: "Item adicionado!",
      description: `${product.name} foi adicionado ao carrinho`,
    });
  };

  // Add product to cart with customizations
  const handleAddToCartWithCustomizations = (
    product: Product, 
    quantity: number, 
    selectedVariation?: any, 
    selectedAdditionals?: any[]
  ) => {
    // Create customized product for cart
    const customizedProduct = {
      ...product,
      price: selectedVariation ? selectedVariation.price : product.price,
      name: selectedVariation ? `${product.name} - ${selectedVariation.name}` : product.name
    };

    // Add additional prices
    if (selectedAdditionals && selectedAdditionals.length > 0) {
      const additionalPrice = selectedAdditionals.reduce((sum, add) => sum + add.price, 0);
      customizedProduct.price += additionalPrice;
      
      const additionalNames = selectedAdditionals.map(add => add.name).join(", ");
      customizedProduct.name += ` + ${additionalNames}`;
    }

    setCartItems(prev => {
      const existingItem = prev.find(item => 
        item.product.id === product.id && 
        item.product.name === customizedProduct.name
      );
      
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id && item.product.name === customizedProduct.name
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prev, { product: customizedProduct, quantity }];
    });

    toast({
      title: "Item adicionado!",
      description: `${quantity}x ${customizedProduct.name} foi adicionado ao carrinho`,
    });
  };

  // Remove product from cart
  const handleRemoveFromCart = (product: Product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      
      if (existingItem && existingItem.quantity > 1) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      
      return prev.filter(item => item.product.id !== product.id);
    });
  };

  // Get product quantity in cart
  const getProductQuantity = (productId: string) => {
    const item = cartItems.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderComplete = () => {
    setIsCheckoutOpen(false);
    setCartItems([]);
    toast({
      title: "Pedido confirmado!",
      description: "Seu pedido foi enviado para a cozinha",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-warm pb-20 md:pb-0">
      <Header
        cartItemsCount={cartItemsCount}
        onCartClick={() => setIsCartOpen(true)}
        onMenuClick={() => {}}
      />

      <CategoryFilter
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <main className="container px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">
            {activeCategory === "all" ? "Cardápio Completo" : 
             categories.find(cat => cat.id === activeCategory)?.name || "Produtos"}
          </h2>
          <p className="text-muted-foreground">
            Escolha seus itens favoritos e monte seu pedido
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              quantity={getProductQuantity(product.id)}
              onAddToCart={handleAddToCart}
              onRemoveFromCart={handleRemoveFromCart}
              onProductClick={setSelectedProduct}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
            <p className="text-muted-foreground">
              Não há produtos disponíveis nesta categoria no momento.
            </p>
          </div>
        )}
      </main>

      <Cart
        items={cartItems}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        onCheckout={handleCheckout}
      />

      <ProductModal
        product={selectedProduct as any}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCartWithCustomizations}
      />

      <Checkout
        items={cartItems}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderComplete={handleOrderComplete}
      />

      <MobileCartFooter
        items={cartItems}
        onCartClick={() => setIsCartOpen(true)}
      />
    </div>
  );
};

export default Index;
