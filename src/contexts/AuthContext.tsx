import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  nome: string;
  trial_inicio: string;
  trial_expira_em: string;
  status_assinatura: string;
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  email: string;
  profile: Profile | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (nome: string, email: string, senha: string) => Promise<void>;
  signIn: (email: string, senha: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();

    // Listener para mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await loadUserProfile(session.user.id, session.user.email!);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string, email: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao carregar perfil:', error);
        setUser({ id: userId, email, profile: null });
        return;
      }

      setUser({ id: userId, email, profile });
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      setUser({ id: userId, email, profile: null });
    }
  };

  const checkUser = async () => {
    try {
      setLoading(true);

      if (!supabase) {
        console.error('Supabase não configurado');
        setUser(null);
        setLoading(false);
        return;
      }

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Erro ao verificar sessão:', error);
        setUser(null);
        setLoading(false);
        return;
      }

      if (session?.user) {
        await loadUserProfile(session.user.id, session.user.email!);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (nome: string, email: string, senha: string) => {
    try {
      setLoading(true);

      if (!supabase) {
        throw new Error('Erro de configuração. Tente novamente mais tarde.');
      }

      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: {
            nome: nome
          }
        }
      });

      if (authError) {
        console.error('Erro ao criar usuário:', authError);

        if (authError.message.includes('already registered')) {
          throw new Error('Este email já está cadastrado');
        }

        throw new Error('Erro ao criar conta. Tente novamente.');
      }

      if (!authData.user) {
        throw new Error('Erro ao criar conta. Nenhum dado retornado.');
      }

      // Aguardar um pouco para garantir que o trigger criou o profile
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Carregar perfil
      await loadUserProfile(authData.user.id, authData.user.email!);

    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, senha: string) => {
    try {
      setLoading(true);

      if (!supabase) {
        throw new Error('Erro de configuração. Tente novamente mais tarde.');
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: senha
      });

      if (authError) {
        console.error('Erro no login:', authError);

        if (authError.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha inválidos');
        }

        throw new Error('Erro ao fazer login. Verifique sua conexão.');
      }

      if (!authData.user) {
        throw new Error('Email ou senha inválidos');
      }

      await loadUserProfile(authData.user.id, authData.user.email!);

    } catch (error: any) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      if (!supabase) return;

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Erro ao fazer logout:', error);
      }

      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const updateUser = async () => {
    if (user && supabase) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUser({ ...user, profile });
        }
      } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
