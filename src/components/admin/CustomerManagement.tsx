
import { useState } from "react";
import { Users, Eye, Search, Calendar, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  joinDate: string;
}

interface Order {
  id: string;
  date: string;
  total: number;
  status: string;
  items: string[];
}

const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao@email.com",
    phone: "(11) 99999-1234",
    address: "Rua das Flores, 123",
    totalOrders: 8,
    totalSpent: 342.50,
    lastOrder: "2024-01-15",
    joinDate: "2023-10-15"
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria@email.com",
    phone: "(11) 98888-5678",
    address: "Av. Central, 456",
    totalOrders: 12,
    totalSpent: 498.70,
    lastOrder: "2024-01-14",
    joinDate: "2023-08-20"
  },
  {
    id: "3",
    name: "Pedro Costa",
    email: "pedro@email.com",
    phone: "(11) 97777-9876",
    address: "Rua da Paz, 789",
    totalOrders: 5,
    totalSpent: 187.90,
    lastOrder: "2024-01-13",
    joinDate: "2023-12-05"
  }
];

const mockCustomerOrders: Record<string, Order[]> = {
  "1": [
    { id: "001", date: "2024-01-15", total: 47.80, status: "entregue", items: ["Big Burger Clássico", "Batata Frita", "Refrigerante"] },
    { id: "008", date: "2024-01-10", total: 35.50, status: "entregue", items: ["Pizza Margherita", "Refrigerante"] },
    { id: "015", date: "2024-01-05", total: 62.30, status: "entregue", items: ["Combo Família", "Sobremesa"] }
  ],
  "2": [
    { id: "002", date: "2024-01-14", total: 41.80, status: "entregue", items: ["Sanduíche Natural", "Suco Natural"] },
    { id: "009", date: "2024-01-08", total: 28.90, status: "entregue", items: ["Salada Caesar"] },
    { id: "016", date: "2024-01-02", total: 55.70, status: "entregue", items: ["Big Burger Duplo", "Batata Premium"] }
  ],
  "3": [
    { id: "003", date: "2024-01-13", total: 35.50, status: "entregue", items: ["Hambúrguer Artesanal", "Refrigerante"] },
    { id: "010", date: "2024-01-06", total: 89.40, status: "entregue", items: ["Combo Casal", "Sobremesas"] }
  ]
};

export const CustomerManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
  const totalOrders = customers.reduce((sum, customer) => sum + customer.totalOrders, 0);
  const averageSpent = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  const getCustomerType = (customer: Customer) => {
    if (customer.totalSpent > 400) return { label: "VIP", color: "default" as const };
    if (customer.totalSpent > 200) return { label: "Frequente", color: "secondary" as const };
    return { label: "Novo", color: "outline" as const };
  };

  return (
    <div className="space-y-6">
      {/* Métricas dos Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total de Clientes</p>
                <p className="text-2xl font-bold">{totalCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total de Pedidos</p>
                <p className="text-2xl font-bold">{totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-success" />
              <div>
                <p className="text-sm font-medium">Receita Total</p>
                <p className="text-2xl font-bold text-success">R$ {totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Gasto Médio</p>
                <p className="text-2xl font-bold">R$ {averageSpent.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Clientes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gerenciar Clientes</CardTitle>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Pedidos</TableHead>
                <TableHead>Total Gasto</TableHead>
                <TableHead>Último Pedido</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => {
                const customerType = getCustomerType(customer);
                return (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{customer.phone}</p>
                        <p className="text-xs text-muted-foreground">{customer.address}</p>
                      </div>
                    </TableCell>
                    <TableCell>{customer.totalOrders}</TableCell>
                    <TableCell>R$ {customer.totalSpent.toFixed(2)}</TableCell>
                    <TableCell>
                      {new Date(customer.lastOrder + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={customerType.color}>{customerType.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedCustomer(customer)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Histórico do Cliente</DialogTitle>
                          </DialogHeader>
                          {selectedCustomer && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium">Informações do Cliente</h4>
                                  <div className="space-y-1 text-sm text-muted-foreground">
                                    <p><strong>Nome:</strong> {selectedCustomer.name}</p>
                                    <p><strong>Email:</strong> {selectedCustomer.email}</p>
                                    <p><strong>Telefone:</strong> {selectedCustomer.phone}</p>
                                    <p><strong>Endereço:</strong> {selectedCustomer.address}</p>
                                    <p><strong>Cliente desde:</strong> {new Date(selectedCustomer.joinDate + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium">Estatísticas</h4>
                                  <div className="space-y-1 text-sm text-muted-foreground">
                                    <p><strong>Total de pedidos:</strong> {selectedCustomer.totalOrders}</p>
                                    <p><strong>Total gasto:</strong> R$ {selectedCustomer.totalSpent.toFixed(2)}</p>
                                    <p><strong>Ticket médio:</strong> R$ {(selectedCustomer.totalSpent / selectedCustomer.totalOrders).toFixed(2)}</p>
                                    <p><strong>Último pedido:</strong> {new Date(selectedCustomer.lastOrder + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-medium mb-2">Histórico de Pedidos</h4>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                  {mockCustomerOrders[selectedCustomer.id]?.map((order) => (
                                    <div key={order.id} className="p-3 border rounded-lg">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <p className="font-medium">Pedido #{order.id}</p>
                                          <p className="text-sm text-muted-foreground">
                                            {new Date(order.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                                          </p>
                                          <div className="mt-1">
                                            {order.items.map((item, index) => (
                                              <span key={index} className="text-xs bg-muted px-2 py-1 rounded mr-1">
                                                {item}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="font-semibold">R$ {order.total.toFixed(2)}</p>
                                          <Badge variant="secondary">{order.status}</Badge>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
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
