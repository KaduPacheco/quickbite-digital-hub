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
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const initializeAuth = async () => {
      try {
        console.log('Initializing authentication...');
        
        // Set timeout for initialization
        timeoutId = setTimeout(() => {
          console.error('Authentication initialization timeout');
          setInitializationError('Timeout ao conectar com o servidor');
          setIsLoading(false);
          toast({
            title: "Erro de Conexão",
            description: "Erro ao conectar com o servidor. Verifique sua conexão ou tente novamente mais tarde.",
            variant: "destructive",
          });
        }, 5000);

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          console.log('Auth state changed:', _event, session?.user?.id);
          clearTimeout(timeoutId);
          
          setUser(session?.user || null);
          if (session?.user) {
            await fetchUserProfile(session.user.id);
          } else {
            setUserType(null);
            setLanchoneteId(null);
            setIsLoading(false);
          }
        });

        // Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          throw error;
        }
        
        console.log('Session check completed:', session?.user?.id);
        
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          setIsLoading(false);
        }
        
        clearTimeout(timeoutId);
        
        return () => {
          subscription.unsubscribe();
          clearTimeout(timeoutId);
        };
        
      } catch (error) {
        console.error('Authentication initialization error:', error);
        clearTimeout(timeoutId);
        setInitializationError('Erro ao inicializar autenticação');
        setIsLoading(false);
        toast({
          title: "Erro de Inicialização",
          description: "Erro ao conectar com o servidor. Verifique sua conexão ou tente novamente mais tarde.",
          variant: "destructive",
        });
      }
    };

    initializeAuth();
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [toast]);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for:', userId);
      
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        setUserType(data.tipo || 'cliente');
        setLanchoneteId(data.lanchonete_id || null);
        console.log('User profile loaded:', data.tipo);
      } else {
        setUserType('cliente');
        setLanchoneteId(null);
        console.log('No user profile found, using default');
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUserType('cliente');
      setLanchoneteId(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Retry initialization function
  const retryInitialization = () => {
    setIsLoading(true);
    setInitializationError(null);
    window.location.reload();
  };

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
      setIsLoading(true);
      console.log('Attempting sign in...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      setUser(data.user);
      if (data.user) {
        await fetchUserProfile(data.user.id);
      }
      
      console.log('Sign in successful');
      return { error: null };
    } catch (error: any) {
      console.error("Error signing in:", error.message);
      setIsLoading(false);
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
      setIsLoading(true);
      console.log('Attempting sign up...');
      
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
        if (profileError.error) throw profileError.error;
      }
      
      setUser(data.user);
      setIsLoading(false);
      return { error: null };
    } catch (error: any) {
      console.error("Error signing up:", error.message);
      setIsLoading(false);
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
      
      setLanchoneteId(lanchoneteId);
      
      return { error: null };
    } catch (error) {
      console.error("Error linking user to lanchonete:", error);
      toast({
        title: "Erro",
        description: "Não foi possível vincular o usuário à lanchonete",
        variant: "destructive"
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

  // Show error state with retry button if initialization failed
  if (initializationError && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-warm">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Erro de Conexão</h2>
          <p className="text-muted-foreground">Não foi possível conectar com o servidor</p>
          <button 
            onClick={retryInitialization}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

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
