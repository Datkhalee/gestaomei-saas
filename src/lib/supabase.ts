import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Configuração do Supabase:');
console.log('📍 URL:', supabaseUrl ? '✅ Configurada' : '❌ Não configurada');
console.log('🔑 Key:', supabaseAnonKey ? '✅ Configurada' : '❌ Não configurada');

let supabaseInstance;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Erro: Variáveis do Supabase não encontradas!');
  console.log('📋 Verifique se as seguintes variáveis estão no arquivo .env:');
  console.log('   - VITE_PUBLIC_SUPABASE_URL');
  console.log('   - VITE_PUBLIC_SUPABASE_ANON_KEY');
  
  supabaseInstance = createClient(
    'https://placeholder.supabase.co',
    'placeholder-key'
  );
} else {
  console.log('✅ Supabase configurado com sucesso!');
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabaseInstance as supabase };

// Tipos atualizados para Supabase Auth
export interface Profile {
  id: string;
  nome: string;
  trial_inicio: string;
  trial_expira_em: string;
  status_assinatura: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  profile: Profile | null;
}
