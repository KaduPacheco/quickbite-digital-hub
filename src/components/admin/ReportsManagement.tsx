
import { useState } from "react";
import { Calendar, Download, Filter, TrendingUp, DollarSign, ShoppingCart, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SalesData {
  id: string;
  date: string;
  customer: string;
  items: number;
  total: number;
  status: "recebido" | "preparo" | "em_rota" | "entregue";
  paymentMethod: string;
}

const mockSalesData: SalesData[] = [
  { id: "001", date: "2024-01-15", customer: "João Silva", items: 3, total: 47.80, status: "entregue", paymentMethod: "PIX" },
  { id: "002", date: "2024-01-15", customer: "Maria Santos", items: 2, total: 35.50, status: "entregue", paymentMethod: "Cartão" },
  { id: "003", date: "2024-01-14", customer: "Pedro Costa", items: 4, total: 62.30, status: "entregue", paymentMethod: "PIX" },
  { id: "004", date: "2024-01-14", customer: "Ana Lima", items: 1, total: 28.90, status: "entregue", paymentMethod: "Dinheiro" },
  { id: "005", date: "2024-01-13", customer: "Carlos Ferreira", items: 5, total: 89.40, status: "entregue", paymentMethod: "PIX" },
  { id: "006", date: "2024-01-13", customer: "Lucia Mendes", items: 2, total: 41.20, status: "entregue", paymentMethod: "Cartão" },
  { id: "007", date: "2024-01-12", customer: "Roberto Silva", items: 3, total: 55.70, status: "entregue", paymentMethod: "PIX" },
  { id: "008", date: "2024-01-12", customer: "Fernanda Costa", items: 1, total: 19.90, status: "entregue", paymentMethod: "Dinheiro" }
];

export const ReportsManagement = () => {
  const [salesData, setSalesData] = useState<SalesData[]>(mockSalesData);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
    customer: ""
  });

  // Filtrar dados
  const filteredData = salesData.filter(sale => {
    if (filters.startDate && sale.date < filters.startDate) return false;
    if (filters.endDate && sale.date > filters.endDate) return false;
    if (filters.status && sale.status !== filters.status) return false;
    if (filters.customer && !sale.customer.toLowerCase().includes(filters.customer.toLowerCase())) return false;
    return true;
  });

  // Calcular métricas
  const totalRevenue = filteredData.reduce((sum, sale) => sum + sale.total, 0);
  const totalOrders = filteredData.length;
  const averageOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const uniqueCustomers = new Set(filteredData.map(sale => sale.customer)).size;

  // Dados por período
  const salesByDate = filteredData.reduce((acc, sale) => {
    const date = sale.date;
    if (!acc[date]) {
      acc[date] = { orders: 0, revenue: 0 };
    }
    acc[date].orders += 1;
    acc[date].revenue += sale.total;
    return acc;
  }, {} as Record<string, { orders: number; revenue: number }>);

  const handleExport = () => {
    const csvContent = [
      "Data,Cliente,Itens,Total,Status,Pagamento",
      ...filteredData.map(sale => 
        `${sale.date},${sale.customer},${sale.items},${sale.total},${sale.status},${sale.paymentMethod}`
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-vendas-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "recebido": return "secondary";
      case "preparo": return "default";
      case "em_rota": return "destructive";
      case "entregue": return "default";
      default: return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "recebido": return "Recebido";
      case "preparo": return "Preparo";
      case "em_rota": return "Em Rota";
      case "entregue": return "Entregue";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Relatório
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Data Inicial</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Data Final</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <select
                className="w-full p-2 border border-input rounded-md"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="">Todos os status</option>
                <option value="recebido">Recebido</option>
                <option value="preparo">Preparo</option>
                <option value="em_rota">Em Rota</option>
                <option value="entregue">Entregue</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Cliente</label>
              <Input
                placeholder="Nome do cliente"
                value={filters.customer}
                onChange={(e) => setFilters({...filters, customer: e.target.value})}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setFilters({ startDate: "", endDate: "", status: "", customer: "" })}
            >
              Limpar Filtros
            </Button>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-success" />
              <div>
                <p className="text-sm font-medium">Faturamento Total</p>
                <p className="text-2xl font-bold text-success">R$ {totalRevenue.toFixed(2)}</p>
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
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Ticket Médio</p>
                <p className="text-2xl font-bold">R$ {averageOrder.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Clientes Únicos</p>
                <p className="text-2xl font-bold">{uniqueCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendas por Data */}
      <Card>
        <CardHeader>
          <CardTitle>Vendas por Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(salesByDate)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([date, data]) => (
                <div key={date} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{new Date(date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                    <p className="text-sm text-muted-foreground">{data.orders} pedidos</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">R$ {data.revenue.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      Média: R$ {(data.revenue / data.orders).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Detalhamento de Vendas */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento de Vendas ({filteredData.length} registros)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pagamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">#{sale.id}</TableCell>
                  <TableCell>{new Date(sale.date + 'T00:00:00').toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{sale.customer}</TableCell>
                  <TableCell>{sale.items}</TableCell>
                  <TableCell>R$ {sale.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(sale.status) as any}>
                      {getStatusLabel(sale.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{sale.paymentMethod}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
