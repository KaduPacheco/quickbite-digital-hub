
import { useState } from "react";
import { Plus, Percent, Calendar, DollarSign, Edit, Trash2, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Promotion {
  id: string;
  code: string;
  description: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderValue: number;
  maxUses: number;
  currentUses: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

const mockPromotions: Promotion[] = [
  {
    id: "1",
    code: "PRIMEIRA10",
    description: "10% de desconto na primeira compra",
    type: "percentage",
    value: 10,
    minOrderValue: 20,
    maxUses: 100,
    currentUses: 23,
    validFrom: "2024-01-01",
    validUntil: "2024-12-31",
    isActive: true
  },
  {
    id: "2",
    code: "FRETE5",
    description: "R$ 5 de desconto no frete",
    type: "fixed",
    value: 5,
    minOrderValue: 30,
    maxUses: 200,
    currentUses: 89,
    validFrom: "2024-01-15",
    validUntil: "2024-02-15",
    isActive: true
  },
  {
    id: "3",
    code: "NATAL20",
    description: "20% de desconto para o Natal",
    type: "percentage",
    value: 20,
    minOrderValue: 50,
    maxUses: 50,
    currentUses: 50,
    validFrom: "2023-12-15",
    validUntil: "2023-12-31",
    isActive: false
  }
];

export const PromotionsManagement = () => {
  const [promotions, setPromotions] = useState<Promotion[]>(mockPromotions);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPromotion, setNewPromotion] = useState({
    code: "",
    description: "",
    type: "percentage" as "percentage" | "fixed",
    value: 0,
    minOrderValue: 0,
    maxUses: 0,
    validFrom: "",
    validUntil: ""
  });
  const { toast } = useToast();

  const handleAddPromotion = () => {
    if (!newPromotion.code || !newPromotion.description) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const promotion: Promotion = {
      id: Date.now().toString(),
      ...newPromotion,
      currentUses: 0,
      isActive: true
    };

    setPromotions([...promotions, promotion]);
    setNewPromotion({
      code: "",
      description: "",
      type: "percentage",
      value: 0,
      minOrderValue: 0,
      maxUses: 0,
      validFrom: "",
      validUntil: ""
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Promoção criada",
      description: "Nova promoção adicionada com sucesso"
    });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Código copiado",
      description: "Código da promoção copiado para a área de transferência"
    });
  };

  const togglePromotion = (id: string) => {
    setPromotions(promotions.map(promo => 
      promo.id === id ? { ...promo, isActive: !promo.isActive } : promo
    ));
  };

  const getPromotionStatus = (promotion: Promotion) => {
    const now = new Date();
    const validFrom = new Date(promotion.validFrom);
    const validUntil = new Date(promotion.validUntil);
    
    if (!promotion.isActive) return { label: "Inativa", color: "secondary" as const };
    if (promotion.currentUses >= promotion.maxUses) return { label: "Esgotada", color: "destructive" as const };
    if (now < validFrom) return { label: "Agendada", color: "default" as const };
    if (now > validUntil) return { label: "Expirada", color: "destructive" as const };
    return { label: "Ativa", color: "default" as const };
  };

  return (
    <div className="space-y-6">
      {/* Resumo das Promoções */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total de Promoções</p>
                <p className="text-2xl font-bold">{promotions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-success" />
              <div>
                <p className="text-sm font-medium">Ativas</p>
                <p className="text-2xl font-bold text-success">
                  {promotions.filter(p => getPromotionStatus(p).label === "Ativa").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Usos Totais</p>
                <p className="text-2xl font-bold">
                  {promotions.reduce((sum, p) => sum + p.currentUses, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Promoções */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gerenciar Promoções</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Promoção
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Nova Promoção</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Código da promoção (ex: DESCONTO10)"
                  value={newPromotion.code}
                  onChange={(e) => setNewPromotion({...newPromotion, code: e.target.value.toUpperCase()})}
                />
                <Textarea
                  placeholder="Descrição da promoção"
                  value={newPromotion.description}
                  onChange={(e) => setNewPromotion({...newPromotion, description: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    className="p-2 border border-input rounded-md"
                    value={newPromotion.type}
                    onChange={(e) => setNewPromotion({...newPromotion, type: e.target.value as "percentage" | "fixed"})}
                  >
                    <option value="percentage">Porcentagem (%)</option>
                    <option value="fixed">Valor fixo (R$)</option>
                  </select>
                  <Input
                    placeholder={newPromotion.type === "percentage" ? "%" : "R$"}
                    type="number"
                    value={newPromotion.value}
                    onChange={(e) => setNewPromotion({...newPromotion, value: Number(e.target.value)})}
                  />
                </div>
                <Input
                  placeholder="Valor mínimo do pedido (R$)"
                  type="number"
                  value={newPromotion.minOrderValue}
                  onChange={(e) => setNewPromotion({...newPromotion, minOrderValue: Number(e.target.value)})}
                />
                <Input
                  placeholder="Máximo de usos"
                  type="number"
                  value={newPromotion.maxUses}
                  onChange={(e) => setNewPromotion({...newPromotion, maxUses: Number(e.target.value)})}
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium">Válido de:</label>
                    <Input
                      type="date"
                      value={newPromotion.validFrom}
                      onChange={(e) => setNewPromotion({...newPromotion, validFrom: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Válido até:</label>
                    <Input
                      type="date"
                      value={newPromotion.validUntil}
                      onChange={(e) => setNewPromotion({...newPromotion, validUntil: e.target.value})}
                    />
                  </div>
                </div>
                <Button onClick={handleAddPromotion} className="w-full">
                  Criar Promoção
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {promotions.map((promotion) => {
              const status = getPromotionStatus(promotion);
              return (
                <Card key={promotion.id} className="relative">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                          {promotion.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyCode(promotion.code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <Badge variant={status.color}>{status.label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm">{promotion.description}</p>
                    
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>
                        Desconto: {promotion.type === "percentage" ? `${promotion.value}%` : `R$ ${promotion.value}`}
                      </p>
                      <p>Pedido mínimo: R$ {promotion.minOrderValue}</p>
                      <p>
                        Usos: {promotion.currentUses}/{promotion.maxUses}
                      </p>
                      <p>
                        Válido: {promotion.validFrom} até {promotion.validUntil}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePromotion(promotion.id)}
                      >
                        {promotion.isActive ? "Desativar" : "Ativar"}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
