
import { useState } from "react";
import { ArrowLeft, MapPin, Clock, CreditCard, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CartItem } from "./Cart";
import { useToast } from "@/hooks/use-toast";

interface CheckoutProps {
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onOrderComplete: (orderData: { endereco: string }) => void;
}

interface Coupon {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderValue: number;
}

const mockCoupons: Coupon[] = [
  { code: "PRIMEIRA10", type: "percentage", value: 10, minOrderValue: 20 },
  { code: "FRETE5", type: "fixed", value: 5, minOrderValue: 30 }
];

export const Checkout = ({ items, isOpen, onClose, onOrderComplete }: CheckoutProps) => {
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    zipCode: ""
  });
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: ""
  });
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [observations, setObservations] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const { toast } = useToast();

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const deliveryFee = 5.00;
  
  // Calcular desconto do cupom
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === "percentage") {
      discount = subtotal * (appliedCoupon.value / 100);
    } else {
      discount = appliedCoupon.value;
    }
  }
  
  const total = subtotal + deliveryFee - discount;

  const handleApplyCoupon = () => {
    const coupon = mockCoupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
    
    if (!coupon) {
      toast({
        title: "Cupom inválido",
        description: "O código informado não existe ou expirou",
        variant: "destructive"
      });
      return;
    }

    if (subtotal < coupon.minOrderValue) {
      toast({
        title: "Valor mínimo não atingido",
        description: `Este cupom é válido para pedidos acima de R$ ${coupon.minOrderValue.toFixed(2)}`,
        variant: "destructive"
      });
      return;
    }

    setAppliedCoupon(coupon);
    toast({
      title: "Cupom aplicado!",
      description: `Desconto de ${coupon.type === "percentage" ? `${coupon.value}%` : `R$ ${coupon.value.toFixed(2)}`} aplicado`
    });
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast({
      title: "Cupom removido",
      description: "O desconto foi removido do seu pedido"
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!customerInfo.name || !customerInfo.phone) {
      toast({
        title: "Erro",
        description: "Por favor, preencha seu nome e telefone",
        variant: "destructive"
      });
      return;
    }

    if (!deliveryAddress.street || !deliveryAddress.number || !deliveryAddress.neighborhood) {
      toast({
        title: "Erro", 
        description: "Por favor, preencha o endereço de entrega",
        variant: "destructive"
      });
      return;
    }

    // Create complete address string
    const endereco = `${deliveryAddress.street}, ${deliveryAddress.number}${deliveryAddress.complement ? ` - ${deliveryAddress.complement}` : ''}, ${deliveryAddress.neighborhood}, ${deliveryAddress.city} - ${deliveryAddress.zipCode}`;

    // Call the order completion handler with the address
    onOrderComplete({ endereco });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto">
      <div className="min-h-screen p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="mt-4">
            <CardHeader className="flex flex-row items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <CardTitle>Finalizar Pedido</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informações do Cliente */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Seus Dados</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Nome completo"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                        required
                      />
                      <Input
                        placeholder="Telefone"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                        required
                      />
                    </div>
                    <Input
                      type="email"
                      placeholder="E-mail (opcional)"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                    />
                  </CardContent>
                </Card>

                {/* Endereço de Entrega */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Endereço de Entrega
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="CEP"
                        value={deliveryAddress.zipCode}
                        onChange={(e) => setDeliveryAddress({...deliveryAddress, zipCode: e.target.value})}
                      />
                      <Input
                        placeholder="Cidade"
                        value={deliveryAddress.city}
                        onChange={(e) => setDeliveryAddress({...deliveryAddress, city: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <Input
                        className="col-span-2"
                        placeholder="Rua"
                        value={deliveryAddress.street}
                        onChange={(e) => setDeliveryAddress({...deliveryAddress, street: e.target.value})}
                        required
                      />
                      <Input
                        placeholder="Número"
                        value={deliveryAddress.number}
                        onChange={(e) => setDeliveryAddress({...deliveryAddress, number: e.target.value})}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Bairro"
                        value={deliveryAddress.neighborhood}
                        onChange={(e) => setDeliveryAddress({...deliveryAddress, neighborhood: e.target.value})}
                        required
                      />
                      <Input
                        placeholder="Complemento"
                        value={deliveryAddress.complement}
                        onChange={(e) => setDeliveryAddress({...deliveryAddress, complement: e.target.value})}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Cupom de Desconto */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Tag className="h-5 w-5" />
                      Cupom de Desconto
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!appliedCoupon ? (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Digite o código do cupom"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                        />
                        <Button type="button" onClick={handleApplyCoupon}>
                          Aplicar
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-success/10 border border-success/20 rounded-lg">
                        <div>
                          <p className="font-medium text-success">Cupom aplicado: {appliedCoupon.code}</p>
                          <p className="text-sm text-success/80">
                            Desconto: {appliedCoupon.type === "percentage" ? `${appliedCoupon.value}%` : `R$ ${appliedCoupon.value.toFixed(2)}`}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleRemoveCoupon}>
                          Remover
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Forma de Pagamento */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Forma de Pagamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="payment"
                          value="pix"
                          checked={paymentMethod === "pix"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <span>PIX</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="payment"
                          value="money"
                          checked={paymentMethod === "money"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <span>Dinheiro na entrega</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="payment"
                          value="card"
                          checked={paymentMethod === "card"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <span>Cartão na entrega</span>
                      </label>
                    </div>
                  </CardContent>
                </Card>

                {/* Observações */}
                <Card>
                  <CardContent className="pt-6">
                    <Textarea
                      placeholder="Observações (opcional)"
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                    />
                  </CardContent>
                </Card>

                {/* Resumo do Pedido */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resumo do Pedido</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex justify-between">
                        <span>{item.quantity}x {item.product.name}</span>
                        <span>R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 space-y-1">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>R$ {subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxa de entrega</span>
                        <span>R$ {deliveryFee.toFixed(2)}</span>
                      </div>
                      {appliedCoupon && (
                        <div className="flex justify-between text-success">
                          <span>Desconto ({appliedCoupon.code})</span>
                          <span>-R$ {discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-primary">R$ {total.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Tempo estimado: 35-45 minutos</span>
                    </div>
                  </CardContent>
                </Card>

                <Button type="submit" className="w-full h-12 text-lg font-semibold">
                  Finalizar Pedido - R$ {total.toFixed(2)}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
