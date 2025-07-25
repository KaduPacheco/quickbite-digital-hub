
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Tables } from '@/integrations/supabase/types';
import { RealtimeChannel, User, Session } from '@supabase/supabase-js';

// Generic hook for Supabase queries
export const useSupabaseQuery = <T extends any>(
  query: () => Promise<{ data: T | null; error: any }>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const result = await query();
      
      if (result.error) {
        throw result.error;
      }
      
      setData(result.data);
    } catch (err) {
      setError(err);
      console.error('Error fetching data:', err);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar os dados. Por favor, tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, error, isLoading, refetch: fetchData };
};

// Hook for real-time Supabase subscriptions
export const useSupabaseSubscription = <T extends any>(
  table: string,
  callback: (payload: any) => void,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*',
  filter?: { column: string; value: any }
) => {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let eventFilter: any = {
      event: event,
      schema: 'public',
      table: table
    };

    if (filter) {
      eventFilter = {
        ...eventFilter,
        filter: `${filter.column}=eq.${filter.value}`
      };
    }

    // Create and subscribe to the channel
    const newChannel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', eventFilter, (payload) => {
        callback(payload);
      })
      .subscribe((status) => {
        if (status !== 'SUBSCRIBED') {
          console.error('Failed to subscribe to realtime updates:', status);
          toast({
            title: 'Erro na conexão em tempo real',
            description: 'Houve um problema ao estabelecer conexão em tempo real',
            variant: 'destructive',
          });
        }
      });

    setChannel(newChannel);

    // Cleanup function
    return () => {
      if (newChannel) supabase.removeChannel(newChannel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, event, JSON.stringify(filter)]);

  return channel;
};

// Hook for inserting data into Supabase
export const useSupabaseInsert = <T extends Record<string, any>>(
  tableName: "cart_items" | "produtos" | "categorias" | "lanchonetes" | "config_lanchonete" | 
          "entregadores" | "estoque" | "itens_pedido" | "pedidos" | "usuarios" | 
          "promocoes" | "variacoes_produto"
) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const { toast } = useToast();

  const insert = async (data: Partial<T>) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .insert(data as any)
        .select();

      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Registro criado com sucesso',
      });
      
      return { data: result, error: null };
    } catch (err) {
      setError(err);
      console.error('Error inserting data:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o registro. Por favor, tente novamente.',
        variant: 'destructive',
      });
      return { data: null, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  return { insert, isLoading, error };
};

// Hook for updating data in Supabase
export const useSupabaseUpdate = <T extends Record<string, any>>(
  tableName: "cart_items" | "produtos" | "categorias" | "lanchonetes" | "config_lanchonete" | 
           "entregadores" | "estoque" | "itens_pedido" | "pedidos" | "usuarios" | 
           "promocoes" | "variacoes_produto"
) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const { toast } = useToast();

  const update = async (id: string, data: Partial<T>) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: result, error } = await supabase
        .from(tableName)
        .update(data as any)
        .eq('id', id)
        .select();

      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Registro atualizado com sucesso',
      });
      
      return { data: result, error: null };
    } catch (err) {
      setError(err);
      console.error('Error updating data:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o registro. Por favor, tente novamente.',
        variant: 'destructive',
      });
      return { data: null, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  return { update, isLoading, error };
};

// Hook for deleting data from Supabase
export const useSupabaseDelete = (
  tableName: "cart_items" | "produtos" | "categorias" | "lanchonetes" | "config_lanchonete" | 
            "entregadores" | "estoque" | "itens_pedido" | "pedidos" | "usuarios" | 
            "promocoes" | "variacoes_produto"
) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const { toast } = useToast();

  const deleteRecord = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Registro excluído com sucesso',
      });
      
      return { error: null };
    } catch (err) {
      setError(err);
      console.error('Error deleting data:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o registro. Por favor, tente novamente.',
        variant: 'destructive',
      });
      return { error: err };
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteRecord, isLoading, error };
};

// Hook for user authentication state
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, session, loading };
};
