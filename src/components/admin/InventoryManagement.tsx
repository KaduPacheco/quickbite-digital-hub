
import { useState } from "react";
import { Plus, Package, AlertTriangle, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  lastUpdated: string;
}

const mockInventory: InventoryItem[] = [
  { id: "1", name: "Carne de Hambúrguer", category: "Carnes", currentStock: 5, minStock: 10, unit: "kg", lastUpdated: "2024-01-15" },
  { id: "2", name: "Batata Frita", category: "Acompanhamentos", currentStock: 15, minStock: 5, unit: "kg", lastUpdated: "2024-01-15" },
  { id: "3", name: "Queijo Mussarela", category: "Laticínios", currentStock: 8, minStock: 3, unit: "kg", lastUpdated: "2024-01-14" },
  { id: "4", name: "Pão de Hambúrguer", category: "Pães", currentStock: 2, minStock: 20, unit: "unidades", lastUpdated: "2024-01-15" }
];

export const InventoryManagement = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    currentStock: 0,
    minStock: 0,
    unit: ""
  });
  const { toast } = useToast();

  const lowStockItems = inventory.filter(item => item.currentStock <= item.minStock);

  const handleAddItem = () => {
    if (!newItem.name || !newItem.category) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const item: InventoryItem = {
      id: Date.now().toString(),
      ...newItem,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    setInventory([...inventory, item]);
    setNewItem({ name: "", category: "", currentStock: 0, minStock: 0, unit: "" });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Item adicionado",
      description: "Item adicionado ao estoque com sucesso"
    });
  };

  const handleUpdateStock = (id: string, newStock: number) => {
    setInventory(inventory.map(item => 
      item.id === id 
        ? { ...item, currentStock: newStock, lastUpdated: new Date().toISOString().split('T')[0] }
        : item
    ));
    
    toast({
      title: "Estoque atualizado",
      description: "Quantidade em estoque foi atualizada"
    });
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock === 0) return { label: "Esgotado", color: "destructive" as const };
    if (item.currentStock <= item.minStock) return { label: "Baixo", color: "default" as const };
    return { label: "OK", color: "secondary" as const };
  };

  return (
    <div className="space-y-6">
      {/* Alertas de Baixo Estoque */}
      {lowStockItems.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Alerta de Baixo Estoque ({lowStockItems.length} itens)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockItems.map((item) => (
                <div key={item.id} className="p-3 border border-destructive rounded-lg bg-destructive/5">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Estoque: {item.currentStock} {item.unit} (Mín: {item.minStock})
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo do Estoque */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total de Itens</p>
                <p className="text-2xl font-bold">{inventory.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <div>
                <p className="text-sm font-medium">Baixo Estoque</p>
                <p className="text-2xl font-bold text-destructive">{lowStockItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Estoque */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Controle de Estoque</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Item ao Estoque</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Nome do item"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                />
                <Input
                  placeholder="Categoria"
                  value={newItem.category}
                  onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                />
                <Input
                  placeholder="Quantidade atual"
                  type="number"
                  value={newItem.currentStock}
                  onChange={(e) => setNewItem({...newItem, currentStock: Number(e.target.value)})}
                />
                <Input
                  placeholder="Estoque mínimo"
                  type="number"
                  value={newItem.minStock}
                  onChange={(e) => setNewItem({...newItem, minStock: Number(e.target.value)})}
                />
                <Input
                  placeholder="Unidade (kg, unidades, litros)"
                  value={newItem.unit}
                  onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                />
                <Button onClick={handleAddItem} className="w-full">
                  Adicionar Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Estoque Atual</TableHead>
                <TableHead>Estoque Mínimo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última Atualização</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => {
                const status = getStockStatus(item);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.currentStock}
                        onChange={(e) => handleUpdateStock(item.id, Number(e.target.value))}
                        className="w-20"
                      />
                      <span className="ml-2 text-sm text-muted-foreground">{item.unit}</span>
                    </TableCell>
                    <TableCell>{item.minStock} {item.unit}</TableCell>
                    <TableCell>
                      <Badge variant={status.color}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>{item.lastUpdated}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
