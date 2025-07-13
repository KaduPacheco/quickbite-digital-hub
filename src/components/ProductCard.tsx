
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
}

interface ProductCardProps {
  product: Product;
  quantity: number;
  onAddToCart: (product: Product) => void;
  onRemoveFromCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
}

export const ProductCard = ({ product, quantity, onAddToCart, onRemoveFromCart, onProductClick }: ProductCardProps) => {
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-medium hover:-translate-y-1 cursor-pointer">
      <div className="relative aspect-square overflow-hidden" onClick={() => onProductClick(product)}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {!product.available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="secondary">Indisponível</Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <div onClick={() => onProductClick(product)}>
            <h3 className="font-semibold text-lg leading-tight">{product.name}</h3>
            <p className="text-muted-foreground text-sm line-clamp-2">{product.description}</p>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <span className="text-xl font-bold text-primary">
              A partir de R$ {product.price.toFixed(2)}
            </span>
            
            {product.available && (
              <div className="flex items-center gap-2">
                {quantity > 0 ? (
                  <div className="flex items-center gap-2 bg-primary/10 rounded-full p-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full hover:bg-primary hover:text-primary-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFromCart(product);
                      }}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <span className="mx-2 font-semibold min-w-[1rem] text-center">
                      {quantity}
                    </span>
                    
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full hover:bg-primary hover:text-primary-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(product);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    className="rounded-full px-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      onProductClick(product);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
