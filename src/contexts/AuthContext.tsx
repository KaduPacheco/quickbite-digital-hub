import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: any | null;
  userType: "admin" | "funcionario" | "cliente" | null;
  lanchoneteId: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, name: string) => Promise<any>;
  signOut: () => Promise<void>;
  linkUserToLanchonete: (lanchoneteId: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<any | null>(null);
  const [userType, setUserType] = useState<"admin" | "funcionario" | "cliente" | null>(null);
  const [lanchoneteId, setLanchoneteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const session = supabase.auth.getSession();

    supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const checkAuth = async () => {
      if ((await session).data.session?.user) {
        setUser((await session).data.session?.user);
        await fetchUserProfile((await session).data.session?.user.id);
      } else {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      setUserType(data?.tipo || 'cliente');
      setLanchoneteId(data?.lanchonete_id || null);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fix the createUserProfile function to use proper type for 'tipo'
  const createUserProfile = async (userId: string, email: string, name: string, userType: "admin" | "funcionario" | "cliente" = "cliente") => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .insert({
          user_id: userId,
          email,
          nome: name,
          tipo: userType
        });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error("Error creating user profile:", error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setUser(data.user);
      await fetchUserProfile(data.user?.id as string);
      return { error: null };
    } catch (error: any) {
      console.error("Error signing in:", error.message);
      toast({
        title: "Erro ao realizar login",
        description: "Verifique suas credenciais",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome: name,
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        const profileError = await createUserProfile(data.user.id, email, name);
        if (profileError) throw profileError.error;
      }
      
      setUser(data.user);
      return { error: null };
    } catch (error: any) {
      console.error("Error signing up:", error.message);
      toast({
        title: "Erro ao criar conta",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setUserType(null);
      setLanchoneteId(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Fix the linkUserToLanchonete function
  const linkUserToLanchonete = async (lanchoneteId: string) => {
    if (!user) {
      return { error: new Error("No user logged in") };
    }

    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ lanchonete_id: lanchoneteId })
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Update context state
      setLanchoneteId(lanchoneteId);
      
      return { error: null };
    } catch (error) {
      console.error("Error linking user to lanchonete:", error);
      toast({
        title: "Erro",
        description: "Não foi possível vincular o usuário à lanchonete",
        variant: "destructive"  // Fixed variant type
      });
      return { error };
    }
  };

  const value = {
    user,
    userType,
    lanchoneteId,
    isLoading,
    signIn,
    signUp,
    signOut,
    linkUserToLanchonete,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
