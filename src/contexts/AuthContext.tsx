
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  lanchoneteId: string | null;
  userType: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: { nome: string, tipo: string, lanchonete_id?: string }) => Promise<{ error: any, user?: User }>;
  signOut: () => Promise<void>;
  linkUserToLanchonete: (lanchoneteId: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [lanchoneteId, setLanchoneteId] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setLanchoneteId(null);
          setUserType(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('lanchonete_id, tipo')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      
      setLanchoneteId(data?.lanchonete_id || null);
      setUserType(data?.tipo || null);
      console.log('User profile fetched:', data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Email ou senha incorretos",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string, userData: { nome: string, tipo: string, lanchonete_id?: string }) => {
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        }
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        // 2. Create profile record
        const { error: profileError } = await supabase
          .from('usuarios')
          .insert({
            user_id: authData.user.id,
            nome: userData.nome,
            email: email,
            tipo: userData.tipo,
            lanchonete_id: userData.lanchonete_id || null
          });
        
        if (profileError) {
          // Rollback: delete auth user if profile creation fails
          console.error('Error creating user profile, rolling back auth user:', profileError);
          
          // This is a best-effort rollback, might not always succeed
          await supabase.auth.admin.deleteUser(authData.user.id);
          
          throw profileError;
        }

        // Validate if we need to check for lanchonete_id
        if ((userData.tipo === 'admin' || userData.tipo === 'funcionario') && !userData.lanchonete_id) {
          toast({
            title: "Atenção",
            description: "Usuário do tipo admin ou funcionário deve estar associado a uma lanchonete",
            variant: "warning",
          });
        }
        
        toast({
          title: "Cadastro realizado",
          description: "Verifique seu email para confirmar o cadastro",
        });
        
        return { error: null, user: authData.user };
      }
      
      return { error: new Error('Falha ao criar usuário'), user: undefined };
    } catch (error) {
      toast({
        title: "Erro no cadastro",
        description: "Não foi possível realizar o cadastro",
        variant: "destructive",
      });
      return { error, user: undefined };
    }
  };

  const linkUserToLanchonete = async (lanchoneteId: string) => {
    if (!user) {
      return { error: new Error('Usuário não autenticado') };
    }

    try {
      // Verify if lanchonete exists
      const { data: lanchoneteData, error: lanchoneteError } = await supabase
        .from('lanchonetes')
        .select('id')
        .eq('id', lanchoneteId)
        .single();

      if (lanchoneteError || !lanchoneteData) {
        throw new Error('Lanchonete não encontrada');
      }

      // Update user profile with lanchonete_id
      const { error } = await supabase
        .from('usuarios')
        .update({ lanchonete_id: lanchoneteId })
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setLanchoneteId(lanchoneteId);

      toast({
        title: "Sucesso",
        description: "Usuário vinculado à lanchonete com sucesso",
      });

      return { error: null };
    } catch (error) {
      console.error('Error linking user to lanchonete:', error);
      toast({
        title: "Erro ao vincular",
        description: "Não foi possível vincular o usuário à lanchonete",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logout realizado",
      description: "Você saiu do sistema com sucesso",
    });
  };

  return (
    <AuthContext.Provider value={{
      session,
      user,
      lanchoneteId,
      userType,
      isLoading,
      signIn,
      signUp,
      signOut,
      linkUserToLanchonete,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
