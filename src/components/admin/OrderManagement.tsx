
import { useState } from "react";
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
import { Clock, Package, Truck, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: "recebido" | "preparo" | "em_rota" | "entregue";
  createdAt: string;
  estimatedTime?: string;
}

const mockOrders: Order[] = [
  {
    id: "1",
    customerName: "João Silva",
    customerPhone: "(11) 99999-9999",
    address: "Rua das Flores, 123 - Centro",
    items: [
      { name: "Big Burger Clássico", quantity: 1, price: 25.90 },
      { name: "Batata Frita Premium", quantity: 1, price: 18.90 },
    ],
    total: 47.80,
    status: "preparo",
    createdAt: "2024-01-15 14:30",
    estimatedTime: "30-40 min"
  },
  {
    id: "2",
    customerName: "Maria Santos",
    customerPhone: "(11) 88888-8888",
    address: "Av. Principal, 456 - Jardim",
    items: [
      { name: "Pizza Margherita", quantity: 1, price: 35.90 },
      { name: "Refrigerante Cola", quantity: 1, price: 5.90 },
    ],
    total: 41.80,
    status: "recebido",
    createdAt: "2024-01-15 14:25",
    estimatedTime: "45-55 min"
  },
  {
    id: "3",
    customerName: "Pedro Costa",
    customerPhone: "(11) 77777-7777",
    address: "Rua Nova, 789 - Vila Verde",
    items: [
      { name: "Burger Vegano", quantity: 1, price: 28.90 },
      { name: "Suco Natural", quantity: 1, price: 12.90 },
    ],
    total: 41.80,
    status: "em_rota",
    createdAt: "2024-01-15 14:15",
    estimatedTime: "15-25 min"
  }
];

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
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const { toast } = useToast();

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    
    toast({
      title: "Status atualizado",
      description: `Pedido #${orderId} marcado como ${statusConfig[newStatus].label.toLowerCase()}`,
    });
  };

  const getStatusIcon = (status: Order['status']) => {
    const IconComponent = statusConfig[status].icon;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pedidos em Tempo Real
        </CardTitle>
      </CardHeader>
      <CardContent>
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
                      <div className="font-medium">#{order.id}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.createdAt}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.customerPhone}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {order.address}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="text-sm">
                          {item.quantity}x {item.name}
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
                      {order.estimatedTime}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {statusConfig[order.status].nextStatus && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, statusConfig[order.status].nextStatus!)}
                      >
                        Próximo Status
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
