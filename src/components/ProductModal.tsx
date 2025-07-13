
import { useState } from "react";
import { X, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "./ProductCard";

interface ProductVariation {
  id: string;
  name: string;
  price: number;
}

interface ProductAdditional {
  id: string;
  name: string;
  price: number;
}

interface ProductModalProps {
  product: Product & {
    variations?: ProductVariation[];
    additionals?: ProductAdditional[];
  };
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, selectedVariation?: ProductVariation, selectedAdditionals?: ProductAdditional[]) => void;
}

export const ProductModal = ({ product, isOpen, onClose, onAddToCart }: ProductModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(
    product.variations?.[0] || null
  );
  const [selectedAdditionals, setSelectedAdditionals] = useState<ProductAdditional[]>([]);

  if (!isOpen) return null;

  const handleAdditionalToggle = (additional: ProductAdditional) => {
    setSelectedAdditionals(prev => {
      const exists = prev.find(item => item.id === additional.id);
      if (exists) {
        return prev.filter(item => item.id !== additional.id);
      }
      return [...prev, additional];
    });
  };

  const getTotalPrice = () => {
    let total = product.price;
    if (selectedVariation) {
      total = selectedVariation.price;
    }
    total += selectedAdditionals.reduce((sum, additional) => sum + additional.price, 0);
    return total * quantity;
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity, selectedVariation || undefined, selectedAdditionals);
    onClose();
    setQuantity(1);
    setSelectedAdditionals([]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/90 hover:bg-white"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="text-xl font-bold">{product.name}</h3>
            <p className="text-muted-foreground mt-1">{product.description}</p>
          </div>

          {product.variations && product.variations.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Tamanho</h4>
              <div className="space-y-2">
                {product.variations.map((variation) => (
                  <div key={variation.id} className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="variation"
                        checked={selectedVariation?.id === variation.id}
                        onChange={() => setSelectedVariation(variation)}
                        className="text-primary"
                      />
                      <span>{variation.name}</span>
                    </label>
                    <span className="font-semibold">R$ {variation.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.additionals && product.additionals.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Adicionais</h4>
              <div className="space-y-2">
                {product.additionals.map((additional) => (
                  <div key={additional.id} className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAdditionals.some(item => item.id === additional.id)}
                        onChange={() => handleAdditionalToggle(additional)}
                        className="text-primary"
                      />
                      <span>{additional.name}</span>
                    </label>
                    <span className="font-semibold">+ R$ {additional.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="outline"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="font-semibold text-lg">{quantity}</span>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-xl font-bold text-primary">R$ {getTotalPrice().toFixed(2)}</p>
            </div>
          </div>

          <Button 
            className="w-full h-12 text-lg font-semibold"
            onClick={handleAddToCart}
            disabled={!product.available}
          >
            {!product.available ? "Indisponível" : "Adicionar ao Carrinho"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
