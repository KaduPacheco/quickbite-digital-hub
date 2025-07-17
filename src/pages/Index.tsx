import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ProductCard, Product } from "@/components/ProductCard";
import { Cart, CartItem } from "@/components/Cart";
import { ProductModal } from "@/components/ProductModal";
import { Checkout } from "@/components/Checkout";
import { MobileCartFooter } from "@/components/MobileCartFooter";
import { categories as mockCategories } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseQuery } from "@/hooks/useSupabase";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { loadCart, saveCart, clearCart, transferCartToUser } from "@/services/CartService";
import { Loader2 } from "lucide-react";

// Default lanchonete ID for demo purposes - in production, this would be set dynamically
const DEFAULT_LANCHONETE_ID = "your-lanchonete-id-here";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch categories from Supabase
  const { data: categories, isLoading: isLoadingCategories } = useSupabaseQuery<any[]>(
    async () => {
      const { data, error } = await supabase
        .from('categorias')
        .select('id, nome')
        .eq('lanchonete_id', DEFAULT_LANCHONETE_ID);
        
      if (error) throw error;
      
      // Transform to match the expected format
      const formattedCategories = data.map(cat => ({
        id: cat.id,
        name: cat.nome,
        icon: getIconForCategory(cat.nome)
      }));
      
      return { data: formattedCategories, error: null };
    },
    []
  );

  // Fetch products from Supabase
  const { data: products, isLoading: isLoadingProducts } = useSupabaseQuery<any[]>(
    async () => {
      const { data, error } = await supabase
        .from('produtos')
        .select(`
          id, 
          nome, 
          descricao, 
          preco_base, 
          imagem_url, 
          categoria_id, 
          ativo,
          variacoes:variacoes_produto (
            id,
            nome,
            adicional_preco
          )
        `)
        .eq('lanchonete_id', DEFAULT_LANCHONETE_ID)
        .eq('ativo', true);
        
      if (error) throw error;
      
      // Transform to match the expected format
      const formattedProducts = data.map(product => ({
        id: product.id,
        name: product.nome,
        description: product.descricao || "",
        price: product.preco_base,
        image: product.imagem_url || "https://via.placeholder.com/400",
        category: product.categoria_id,
        available: product.ativo,
        variations: product.variacoes?.map((v: any) => ({
          id: v.id,
          name: v.nome,
          price: product.preco_base + v.adicional_preco
        })) || []
      }));
      
      return { data: formattedProducts, error: null };
    },
    []
  );

  // Function to get icon for category based on name
  const getIconForCategory = (name: string): string => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('hambúrguer') || lowerName.includes('burger')) return '🍔';
    if (lowerName.includes('pizza')) return '🍕';
    if (lowerName.includes('bebida') || lowerName.includes('drink')) return '🥤';
    if (lowerName.includes('sobremesa') || lowerName.includes('dessert')) return '🍰';
    if (lowerName.includes('petisco') || lowerName.includes('snack')) return '🍟';
    return '🍽️';
  };

  // Load cart data from Supabase on component mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const { items, error } = await loadCart(user?.id || null);
        if (!error) {
          setCartItems(items);
        } else {
          console.error("Error loading cart:", error);
        }
      } catch (error) {
        console.error("Error in fetchCart:", error);
      }
    };
    
    fetchCart();
  }, [user]);

  // Transfer cart when user logs in
  useEffect(() => {
    if (user) {
      transferCartToUser(user.id);
    }
  }, [user]);

  // Save cart to Supabase whenever it changes
  useEffect(() => {
    if (cartItems.length > 0) {
      saveCart(cartItems, user?.id || null);
    }
  }, [cartItems, user]);

  // Filter products by category
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (activeCategory === "all") return products;
    return products.filter(product => product.category === activeCategory);
  }, [activeCategory, products]);

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
      
      return [...prev, { 
        product: customizedProduct, 
        quantity, 
        variations: { selectedVariation, selectedAdditionals } 
      }];
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

  const handleOrderComplete = async (orderData: { endereco: string }) => {
    try {
      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('pedidos')
        .insert([{
          cliente_id: user?.id || null,
          lanchonete_id: DEFAULT_LANCHONETE_ID,
          total: cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
          status: 'recebido',
          endereco_entrega: orderData.endereco
        }])
        .select();
      
      if (orderError) throw orderError;
      
      // Create order items
      const orderItems = cartItems.map(item => ({
        pedido_id: order[0].id,
        produto_id: item.product.id,
        quantidade: item.quantity,
        preco_unitario: item.product.price,
        variacoes: item.variations || null
      }));
      
      const { error: itemsError } = await supabase
        .from('itens_pedido')
        .insert(orderItems);
      
      if (itemsError) throw itemsError;
      
      // Clear cart after successful order
      setCartItems([]);
      await clearCart(user?.id || null);
      
      setIsCheckoutOpen(false);
      
      toast({
        title: "Pedido confirmado!",
        description: "Seu pedido foi enviado para a cozinha",
      });
    } catch (error) {
      console.error("Error completing order:", error);
      toast({
        title: "Erro no pedido",
        description: "Não foi possível completar o pedido. Por favor, tente novamente.",
        variant: "destructive"
      });
    }
  };

  // Show loading state while fetching data
  if (isLoadingCategories || isLoadingProducts) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm pb-20 md:pb-0">
      <Header
        cartItemsCount={cartItemsCount}
        onCartClick={() => setIsCartOpen(true)}
        onMenuClick={() => {}}
      />

      <CategoryFilter
        categories={categories || mockCategories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <main className="container px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">
            {activeCategory === "all" ? "Cardápio Completo" : 
             categories?.find(cat => cat.id === activeCategory)?.name || "Produtos"}
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
