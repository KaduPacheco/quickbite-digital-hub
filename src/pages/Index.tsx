import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ProductCard, Product } from "@/components/ProductCard";
import { Cart, CartItem } from "@/components/Cart";
import { categories, products } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { toast } = useToast();

  // Filter products by category
  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") return products;
    return products.filter(product => product.category === activeCategory);
  }, [activeCategory]);

  // Get cart item count
  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Add product to cart
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
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "O checkout será implementado em breve!",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-warm">
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
    </div>
  );
};

export default Index;
