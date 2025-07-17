
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/types/schema";

interface MobileCartFooterProps {
  items: CartItem[];
  onCartClick: () => void;
}

export const MobileCartFooter = ({ items, onCartClick }: MobileCartFooterProps) => {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border p-4 md:hidden">
      <Button 
        className="w-full h-12 flex items-center justify-between text-lg font-semibold"
        onClick={onCartClick}
      >
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          <span>{itemCount} {itemCount === 1 ? 'item' : 'itens'}</span>
        </div>
        <span>R$ {total.toFixed(2)}</span>
      </Button>
    </div>
  );
};
