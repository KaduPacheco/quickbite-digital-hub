
import { useEffect } from "react";
import { AdminLoginForm } from "@/components/auth/AdminLoginForm";
import { useAuth } from "@/contexts/AuthContext";

interface AdminLoginProps {
  onLogin: () => void;
}

export const AdminLogin = ({ onLogin }: AdminLoginProps) => {
  const { user, isLoading } = useAuth();
  
  // If user is already logged in, call onLogin automatically
  useEffect(() => {
    if (user && !isLoading) {
      onLogin();
    }
  }, [user, isLoading, onLogin]);

  return (
    <div className="min-h-screen bg-gradient-warm flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">D</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold">DeliciousEats</h1>
        <p className="text-muted-foreground">Painel Administrativo</p>
      </div>
      
      <AdminLoginForm onSuccess={onLogin} />
    </div>
  );
};
