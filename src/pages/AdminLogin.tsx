
import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { useToast } from "@/hooks/use-toast";

// Mock authentication - replace with real Supabase Auth
const mockCredentials = {
  email: "admin@lanchonete.com",
  password: "admin123"
};

interface AdminLoginProps {
  onLogin: () => void;
}

export const AdminLogin = ({ onLogin }: AdminLoginProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      if (email === mockCredentials.email && password === mockCredentials.password) {
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo ao painel administrativo",
        });
        onLogin();
      } else {
        toast({
          title: "Erro no login",
          description: "Email ou senha incorretos",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return <LoginForm onLogin={handleLogin} isLoading={isLoading} />;
};
