import { useState, useEffect } from "react";
import { Plus, Percent, Calendar, DollarSign, Edit, Trash2, Copy, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  useSupabaseQuery, 
  useSupabaseInsert, 
  useSupabaseUpdate, 
  useSupabaseDelete 
} from "@/hooks/useSupabase";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Promotion {
  id: string;
  titulo: string;
  codigo: string;
  descricao?: string;
  tipo: "percentual" | "fixo";
  valor: number;
  valor_minimo: number | null;
  usos_maximo?: number;
  usos_atual?: number;
  validade: string;
  ativo: boolean;
  lanchonete_id: string;
}

interface NewPromotion {
  titulo: string;
  codigo: string;
  tipo: "percentual" | "fixo";
  valor: number;
  valor_minimo: number;
  validade: string;
  lanchonete_id?: string;
}

export const PromotionsManagement = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPromotion, setNewPromotion] = useState<NewPromotion>({
    titulo: "",
    codigo: "",
    tipo: "percentual",
    valor: 0,
    valor_minimo: 0,
    validade: ""
  });
  const { toast } = useToast();
  const { lanchoneteId } = useAuth();

  // Query promotions from Supabase
  const { 
    data: promotions, 
    isLoading, 
    error,
    refetch
  } = useSupabaseQuery<Promotion[]>(
    async () => {
      if (!lanchoneteId) return { data: null, error: new Error("Lanchonete ID not found") };
      
      const { data, error } = await supabase
        .from('promocoes')
        .select('*')
        .eq('lanchonete_id', lanchoneteId);
        
      return { data, error };
    },
    [lanchoneteId]
  );

  // Mutations for promotion operations
  const { insert, isLoading: isInserting } = useSupabaseInsert<Promotion>('promocoes');
  const { update, isLoading: isUpdating } = useSupabaseUpdate<Promotion>('promocoes');
  const { deleteRecord, isLoading: isDeleting } = useSupabaseDelete('promocoes');

  const handleAddPromotion = async () => {
    if (!lanchoneteId) {
      toast({
        title: "Erro",
        description: "Lanchonete não identificada",
        variant: "destructive"
      });
      return;
    }

    if (!newPromotion.titulo || !newPromotion.codigo || !newPromotion.validade) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      await insert({
        ...newPromotion,
        lanchonete_id: lanchoneteId,
        ativo: true
      });
      
      setNewPromotion({
        titulo: "",
        codigo: "",
        tipo: "percentual",
        valor: 0,
        valor_minimo: 0,
        validade: ""
      });
      
      setIsAddDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error adding promotion:", error);
    }
  };

  const togglePromotion = async (id: string, isActive: boolean) => {
    try {
      await update(id, { ativo: !isActive });
      refetch();
    } catch (error) {
      console.error("Error toggling promotion:", error);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Código copiado",
      description: "Código da promoção copiado para a área de transferência"
    });
  };

  const getPromotionStatus = (promotion: Promotion) => {
    const now = new Date();
    const validUntil = new Date(promotion.validade);
    
    if (!promotion.ativo) return { label: "Inativa", color: "secondary" as const };
    if (now > validUntil) return { label: "Expirada", color: "destructive" as const };
    return { label: "Ativa", color: "default" as const };
  };

  if (isLoading) {
    return (
      <Card className="w-full h-64 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando promoções...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full p-6">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar promoções</h3>
          <p className="text-muted-foreground mb-4">
            Não foi possível carregar as promoções. Por favor, tente novamente.
          </p>
          <Button onClick={() => refetch()}>Tentar novamente</Button>
        </div>
      </Card>
    );
  }

  const activePromotions = promotions?.filter(p => getPromotionStatus(p).label === "Ativa").length || 0;

  return (
    <div className="space-y-6">
      {/* Resumo das Promoções */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total de Promoções</p>
                <p className="text-2xl font-bold">{promotions?.length || 0}</p>
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
                  {activePromotions}
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
                <p className="text-sm font-medium">Economia Gerada</p>
                <p className="text-2xl font-bold">
                  R$ {(promotions?.reduce((sum, p) => sum + p.valor, 0) || 0).toFixed(2)}
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
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Promoção
            </Button>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Nova Promoção</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Título da promoção"
                  value={newPromotion.titulo}
                  onChange={(e) => setNewPromotion({...newPromotion, titulo: e.target.value})}
                />
                <Input
                  placeholder="Código da promoção (ex: DESCONTO10)"
                  value={newPromotion.codigo}
                  onChange={(e) => setNewPromotion({...newPromotion, codigo: e.target.value.toUpperCase()})}
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    className="p-2 border border-input rounded-md"
                    value={newPromotion.tipo}
                    onChange={(e) => setNewPromotion({...newPromotion, tipo: e.target.value as "percentual" | "fixo"})}
                  >
                    <option value="percentual">Porcentagem (%)</option>
                    <option value="fixo">Valor fixo (R$)</option>
                  </select>
                  <Input
                    placeholder={newPromotion.tipo === "percentual" ? "%" : "R$"}
                    type="number"
                    value={newPromotion.valor || ""}
                    onChange={(e) => setNewPromotion({...newPromotion, valor: Number(e.target.value)})}
                  />
                </div>
                <Input
                  placeholder="Valor mínimo do pedido (R$)"
                  type="number"
                  value={newPromotion.valor_minimo || ""}
                  onChange={(e) => setNewPromotion({...newPromotion, valor_minimo: Number(e.target.value)})}
                />
                <div>
                  <label className="text-sm font-medium">Válido até:</label>
                  <Input
                    type="date"
                    value={newPromotion.validade}
                    onChange={(e) => setNewPromotion({...newPromotion, validade: e.target.value})}
                  />
                </div>
                <Button 
                  onClick={handleAddPromotion} 
                  className="w-full"
                  disabled={isInserting}
                >
                  {isInserting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    "Criar Promoção"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {promotions && promotions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {promotions.map((promotion) => {
                const status = getPromotionStatus(promotion);
                return (
                  <Card key={promotion.id} className="relative">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                            {promotion.codigo}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyCode(promotion.codigo)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <Badge variant={status.color}>{status.label}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm font-medium">{promotion.titulo}</p>
                      
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p>
                          Desconto: {promotion.tipo === "percentual" ? `${promotion.valor}%` : `R$ ${promotion.valor}`}
                        </p>
                        <p>Pedido mínimo: R$ {promotion.valor_minimo || 0}</p>
                        <p>
                          Válido até: {new Date(promotion.validade).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => togglePromotion(promotion.id, promotion.ativo)}
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            promotion.ativo ? "Desativar" : "Ativar"
                          )}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            deleteRecord(promotion.id);
                            refetch();
                          }}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Percent className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma promoção encontrada</h3>
              <p className="text-muted-foreground mb-4">
                Comece criando sua primeira promoção
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Promoção
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
