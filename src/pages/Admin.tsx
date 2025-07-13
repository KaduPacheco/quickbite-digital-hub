
import { useState } from "react";
import { LogOut, Package, ShoppingCart, BarChart3, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { ProductManagement } from "@/components/admin/ProductManagement";
import { OrderManagement } from "@/components/admin/OrderManagement";
import { AdminLogin } from "@/pages/AdminLogin";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-warm">
      <header className="bg-background/95 backdrop-blur border-b border-border">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">D</span>
            </div>
            <div>
              <h1 className="text-lg font-bold">Painel Administrativo</h1>
              <p className="text-xs text-muted-foreground">DeliciousEats</p>
            </div>
          </div>
          
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
              <p className="text-muted-foreground">
                Visão geral das suas vendas e pedidos
              </p>
            </div>
            
            <DashboardStats />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pedidos Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { id: "1", customer: "João Silva", total: 47.80, status: "preparo" },
                      { id: "2", customer: "Maria Santos", total: 41.80, status: "recebido" },
                      { id: "3", customer: "Pedro Costa", total: 35.50, status: "em_rota" }
                    ].map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div>
                          <p className="font-medium">#{order.id} - {order.customer}</p>
                          <p className="text-sm text-muted-foreground">
                            R$ {order.total.toFixed(2)}
                          </p>
                        </div>
                        <Badge variant={
                          order.status === "recebido" ? "secondary" :
                          order.status === "preparo" ? "default" :
                          order.status === "em_rota" ? "destructive" : "outline"
                        }>
                          {{
                            recebido: "Recebido",
                            preparo: "Preparo",
                            em_rota: "Em Rota",
                            entregue: "Entregue"
                          }[order.status]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Produtos Mais Vendidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "Big Burger Clássico", sales: 24, revenue: 621.60 },
                      { name: "Pizza Margherita", sales: 18, revenue: 646.20 },
                      { name: "Batata Frita Premium", sales: 32, revenue: 604.80 }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.sales} vendidos
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">R$ {item.revenue.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Gerenciamento de Pedidos</h2>
                <p className="text-muted-foreground">
                  Acompanhe e gerencie todos os pedidos em tempo real
                </p>
              </div>
              <OrderManagement />
            </div>
          </TabsContent>

          <TabsContent value="products">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Gerenciamento de Produtos</h2>
                <p className="text-muted-foreground">
                  Adicione, edite e gerencie o cardápio da sua lanchonete
                </p>
              </div>
              <ProductManagement />
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Configurações</h2>
                <p className="text-muted-foreground">
                  Configure as opções da sua lanchonete
                </p>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Dados da Lanchonete</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Nome da Lanchonete</label>
                      <input 
                        type="text" 
                        defaultValue="DeliciousEats"
                        className="w-full mt-1 p-2 border border-input rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Endereço</label>
                      <input 
                        type="text" 
                        defaultValue="Rua das Delícias, 123"
                        className="w-full mt-1 p-2 border border-input rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Telefone</label>
                      <input 
                        type="text" 
                        defaultValue="(11) 99999-9999"
                        className="w-full mt-1 p-2 border border-input rounded-md"
                      />
                    </div>
                    <Button>Salvar Alterações</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
