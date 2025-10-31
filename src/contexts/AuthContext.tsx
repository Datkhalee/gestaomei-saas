import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  nome: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, senha: string) => Promise<void>;
  signUp: (nome: string, email: string, senha: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          nome: session.user.user_metadata?.nome || session.user.email?.split('@')[0] || ''
        });
      }
      setLoading(false);
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          nome: session.user.user_metadata?.nome || session.user.email?.split('@')[0] || ''
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, senha: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: senha,
      });

      if (error) {
        console.error('Erro Supabase:', error);
        
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha incorretos');
        }
        
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Erro ao fazer login');
      }

      setUser({
        id: data.user.id,
        email: data.user.email || '',
        nome: data.user.user_metadata?.nome || data.user.email?.split('@')[0] || ''
      });

    } catch (error: any) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const signUp = async (nome: string, email: string, senha: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: senha,
        options: {
          data: {
            nome: nome.trim()
          }
        }
      });

      if (error) {
        console.error('Erro Supabase:', error);
        
        if (error.message.includes('already registered')) {
          throw new Error('Este email já está cadastrado');
        }
        
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Erro ao criar conta');
      }

      setUser({
        id: data.user.id,
        email: data.user.email || '',
        nome: nome.trim()
      });

    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error: any) {
      console.error('Erro ao sair:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
