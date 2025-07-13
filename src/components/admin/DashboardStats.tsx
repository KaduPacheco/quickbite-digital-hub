
import { TrendingUp, TrendingDown, DollarSign, Package, Clock, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down";
  icon: React.ReactNode;
}

const StatCard = ({ title, value, change, trend, icon }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {change && (
        <p className={`text-xs flex items-center gap-1 ${
          trend === "up" ? "text-success" : "text-destructive"
        }`}>
          {trend === "up" ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {change}
        </p>
      )}
    </CardContent>
  </Card>
);

export const DashboardStats = () => {
  const stats = [
    {
      title: "Faturamento Hoje",
      value: "R$ 1.247,80",
      change: "+12% desde ontem",
      trend: "up" as const,
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Pedidos Hoje",
      value: 28,
      change: "+4 desde ontem",
      trend: "up" as const,
      icon: <Package className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Tempo Médio",
      value: "32 min",
      change: "-5 min desde ontem",
      trend: "up" as const,
      icon: <Clock className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Clientes Ativos",
      value: 156,
      change: "+23 este mês",
      trend: "up" as const,
      icon: <Users className="h-4 w-4 text-muted-foreground" />
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};
