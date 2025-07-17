import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Product } from "./ProductCard";
import { CartItem } from "@/types/schema";

interface CartProps {
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onRemoveFromCart: (product: Product) => void;
  onCheckout: () => void;
}

export const Cart = ({ items, isOpen, onClose, onAddToCart, onRemoveFromCart, onCheckout }: CartProps) => {
  const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
      <Card className="w-full max-w-md h-full rounded-none border-l">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Carrinho ({itemCount})
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        {items.length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Carrinho vazio</h3>
            <p className="text-muted-foreground">Adicione itens para começar seu pedido</p>
          </CardContent>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-4 py-4 border-b border-border last:border-b-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    
                    <div className="flex-1 space-y-2">
                      <h4 className="font-medium">{item.product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        R$ {item.product.price.toFixed(2)}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => onRemoveFromCart(item.product)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        
                        <span className="font-semibold min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => onAddToCart(item.product)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold">
                        R$ {(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-6 border-t border-border">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-primary">R$ {total.toFixed(2)}</span>
                </div>
                
                <Button 
                  className="w-full h-12 text-lg font-semibold"
                  onClick={onCheckout}
                >
                  Finalizar Pedido
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};
