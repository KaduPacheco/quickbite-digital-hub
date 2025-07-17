
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, StorefrontIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';

interface LanchoneteAssociationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function LanchoneteAssociationForm({ onSuccess, onCancel }: LanchoneteAssociationFormProps) {
  const [lanchonetes, setLanchonetes] = useState<any[]>([]);
  const [selectedLanchonete, setSelectedLanchonete] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLanchonetes, setIsLoadingLanchonetes] = useState(true);
  const { linkUserToLanchonete } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchLanchonetes();
  }, []);

  const fetchLanchonetes = async () => {
    setIsLoadingLanchonetes(true);
    try {
      const { data, error } = await supabase
        .from('lanchonetes')
        .select('id, nome');

      if (error) throw error;
      
      setLanchonetes(data || []);
    } catch (error) {
      console.error('Error fetching lanchonetes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de lanchonetes",
        variant: "destructive",
      });
    } finally {
      setIsLoadingLanchonetes(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLanchonete) {
      toast({
        title: "Erro",
        description: "Selecione uma lanchonete",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await linkUserToLanchonete(selectedLanchonete);
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Usuário associado à lanchonete com sucesso",
      });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error associating user with lanchonete:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Associar à Lanchonete</CardTitle>
        <CardDescription>
          Selecione uma lanchonete para vincular à sua conta
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lanchonete">Lanchonete</Label>
            <Select 
              value={selectedLanchonete} 
              onValueChange={setSelectedLanchonete}
              disabled={isLoadingLanchonetes}
            >
              <SelectTrigger id="lanchonete" className="w-full">
                <SelectValue placeholder="Selecione uma lanchonete" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingLanchonetes ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Carregando...</span>
                  </div>
                ) : lanchonetes.length > 0 ? (
                  lanchonetes.map((lanchonete) => (
                    <SelectItem key={lanchonete.id} value={lanchonete.id}>
                      {lanchonete.nome}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-center text-muted-foreground">
                    Nenhuma lanchonete encontrada
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isLoading || !selectedLanchonete}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Associando...
              </>
            ) : (
              <>
                <StorefrontIcon className="mr-2 h-4 w-4" />
                Associar Lanchonete
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
