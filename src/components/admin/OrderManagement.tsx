import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, Package, Truck, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseQuery, useSupabaseUpdate, useSupabaseSubscription } from "@/hooks/useSupabase";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface OrderItem {
  id: string;
  pedido_id: string;
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
  variacoes: any;
}

interface Order {
  id: string;
  cliente: {
    nome: string;
    telefone: string;
  } | null;
  endereco_entrega: string;
  items: OrderItem[];
  total: number;
  status: "recebido" | "preparo" | "em_rota" | "entregue";
  created_at: string;
  lanchonete_id: string;
}

const statusConfig = {
  recebido: {
    label: "Recebido",
    color: "bg-blue-100 text-blue-800",
    icon: AlertCircle,
    nextStatus: "preparo" as const
  },
  preparo: {
    label: "Em Preparo",
    color: "bg-yellow-100 text-yellow-800",
    icon: Package,
    nextStatus: "em_rota" as const
  },
  em_rota: {
    label: "Em Rota",
    color: "bg-orange-100 text-orange-800",
    icon: Truck,
    nextStatus: "entregue" as const
  },
  entregue: {
    label: "Entregue",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
    nextStatus: null
  }
};

export const OrderManagement = () => {
  const { toast } = useToast();
  const { lanchoneteId } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  // Fetch orders from Supabase
  const { data: ordersData, isLoading, error, refetch } = useSupabaseQuery<Order[]>(
    async () => {
      if (!lanchoneteId) return { data: null, error: new Error("Lanchonete ID not found") };
      
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          id, 
          total, 
          status, 
          endereco_entrega, 
          created_at,
          lanchonete_id,
          cliente:cliente_id (
            nome,
            telefone
          ),
          items:itens_pedido (
            id,
            pedido_id,
            produto_id,
            quantidade,
            preco_unitario,
            variacoes
          )
        `)
        .eq('lanchonete_id', lanchoneteId)
        .order('created_at', { ascending: false });
        
      return { data, error };
    },
    [lanchoneteId]
  );

  // Update orders state when data changes
  useEffect(() => {
    if (ordersData) {
      setOrders(ordersData);
    }
  }, [ordersData]);

  // Hook for updating order status
  const { update: updateOrder, isLoading: isUpdating } = useSupabaseUpdate('pedidos');

  // Subscribe to order changes
  useSupabaseSubscription(
    'pedidos',
    (payload) => {
      console.log('Real-time order update:', payload);
      
      // Handle different types of updates
      if (payload.eventType === 'INSERT') {
        // New order added
        const newOrder = payload.new as Order;
        if (newOrder.lanchonete_id === lanchoneteId) {
          setOrders(prev => [newOrder, ...prev]);
          
          // Show notification for new order
          toast({
            title: "Novo pedido recebido!",
            description: `Pedido #${newOrder.id.substring(0, 8)} foi recebido.`,
          });
        }
      } else if (payload.eventType === 'UPDATE') {
        // Order updated
        const updatedOrder = payload.new as Order;
        if (updatedOrder.lanchonete_id === lanchoneteId) {
          setOrders(prev => prev.map(order => 
            order.id === updatedOrder.id ? updatedOrder : order
          ));
        }
      } else if (payload.eventType === 'DELETE') {
        // Order deleted
        const deletedOrder = payload.old as Order;
        setOrders(prev => prev.filter(order => order.id !== deletedOrder.id));
      }
    },
    '*',
    { column: 'lanchonete_id', value: lanchoneteId || '' }
  );

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateOrder(orderId, { status: newStatus });
      
      // Optimistically update UI
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      toast({
        title: "Status atualizado",
        description: `Pedido #${orderId.substring(0, 8)} marcado como ${statusConfig[newStatus].label.toLowerCase()}`,
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do pedido",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    const IconComponent = statusConfig[status].icon;
    return <IconComponent className="h-4 w-4" />;
  };

  // Format order creation date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Calculate estimated time based on status
  const getEstimatedTime = (order: Order) => {
    switch(order.status) {
      case 'recebido': return '40-50 min';
      case 'preparo': return '25-35 min';
      case 'em_rota': return '10-15 min';
      case 'entregue': return 'Entregue';
      default: return '30-40 min';
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full h-64 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando pedidos...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full p-6">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar pedidos</h3>
          <p className="text-muted-foreground mb-4">
            Não foi possível carregar os pedidos. Por favor, tente novamente.
          </p>
          <Button onClick={() => refetch()}>Tentar novamente</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pedidos em Tempo Real
        </CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum pedido encontrado</h3>
            <p className="text-muted-foreground">
              Não há pedidos registrados no momento.
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tempo</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">#{order.id.substring(0, 8)}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(order.created_at)}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.cliente?.nome || "Cliente não identificado"}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.cliente?.telefone || "Sem telefone"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {order.endereco_entrega}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        {order.items && order.items.map((item) => (
                          <div key={item.id} className="text-sm">
                            {item.quantidade}x {item.preco_unitario.toFixed(2)}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    
                    <TableCell className="font-semibold">
                      R$ {order.total.toFixed(2)}
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={statusConfig[order.status].color}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {statusConfig[order.status].label}
                        </div>
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {getEstimatedTime(order)}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {statusConfig[order.status].nextStatus && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, statusConfig[order.status].nextStatus!)}
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : null}
                          Próximo Status
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
