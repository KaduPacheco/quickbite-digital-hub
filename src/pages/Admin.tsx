
import { useState, useEffect } from "react";
import { LogOut, Package, ShoppingCart, BarChart3, Settings, Users, TrendingUp, Tag, Warehouse, Loader2, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { ProductManagement } from "@/components/admin/ProductManagement";
import { OrderManagement } from "@/components/admin/OrderManagement";
import { InventoryManagement } from "@/components/admin/InventoryManagement";
import { PromotionsManagement } from "@/components/admin/PromotionsManagement";
import { ReportsManagement } from "@/components/admin/ReportsManagement";
import { CustomerManagement } from "@/components/admin/CustomerManagement";
import { AdminLogin } from "@/pages/AdminLogin";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { LanchoneteAssociationForm } from "@/components/auth/LanchoneteAssociationForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { user, lanchoneteId, userType, signOut, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showAssociationForm, setShowAssociationForm] = useState(false);

  useEffect(() => {
    // Check authentication status
    if (!isLoading) {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    }
  }, [user, isLoading]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await signOut();
    setIsAuthenticated(false);
    toast({
      title: "Logout realizado",
      description: "Você saiu do sistema com sucesso",
    });
    navigate("/");
  };

  const handleAssociationSuccess = () => {
    setShowAssociationForm(false);
    toast({
      title: "Associação concluída",
      description: "Você foi associado à lanchonete com sucesso",
    });
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-lg">Carregando...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  // Check if user type is admin or employee
  const isAdminOrEmployee = userType === 'admin' || userType === 'funcionario';
  
  // If authenticated but no lanchoneteId or wrong user type, show access denied
  if (!lanchoneteId || !isAdminOrEmployee) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6">
          <CardContent className="pt-6 space-y-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold">Acesso Negado</h2>
              <p className="text-muted-foreground">
                Você não tem permissão para acessar o painel administrativo. 
                {!lanchoneteId && "Sua conta não está associada a nenhuma lanchonete."}
                {!isAdminOrEmployee && lanchoneteId && "Seu tipo de usuário não tem permissão para acessar o painel administrativo."}
              </p>
            </div>
            
            {!lanchoneteId && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Conta não vinculada</AlertTitle>
                <AlertDescription>
                  Para acessar o painel administrativo, sua conta precisa estar vinculada a uma lanchonete.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex flex-col gap-2">
              {!lanchoneteId && (
                <Button 
                  onClick={() => setShowAssociationForm(true)} 
                  className="w-full"
                  variant="default"
                >
                  Associar à Lanchonete
                </Button>
              )}
              <Button onClick={handleLogout} variant={!lanchoneteId ? "outline" : "default"} className="w-full">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
            
            {showAssociationForm && (
              <div className="mt-6">
                <LanchoneteAssociationForm 
                  onSuccess={handleAssociationSuccess}
                  onCancel={() => setShowAssociationForm(false)}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
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
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground mr-2">
              {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 lg:w-[800px]">
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
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Warehouse className="h-4 w-4" />
              Estoque
            </TabsTrigger>
            <TabsTrigger value="promotions" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Promoções
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Relatórios
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Clientes
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

            {/* Dashboard content would now use real data */}
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

          <TabsContent value="inventory">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Controle de Estoque</h2>
                <p className="text-muted-foreground">
                  Gerencie o estoque dos ingredientes e receba alertas de baixo estoque
                </p>
              </div>
              <InventoryManagement />
            </div>
          </TabsContent>

          <TabsContent value="promotions">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Gerenciamento de Promoções</h2>
                <p className="text-muted-foreground">
                  Crie e gerencie cupons de desconto para seus clientes
                </p>
              </div>
              <PromotionsManagement />
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Relatórios de Vendas</h2>
                <p className="text-muted-foreground">
                  Analise o desempenho das suas vendas com relatórios detalhados
                </p>
              </div>
              <ReportsManagement />
            </div>
          </TabsContent>

          <TabsContent value="customers">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Gerenciamento de Clientes</h2>
                <p className="text-muted-foreground">
                  Visualize informações e histórico dos seus clientes
                </p>
              </div>
              <CustomerManagement />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
