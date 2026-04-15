import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SB_CLIENT_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    '[Supabase] VITE_SUPABASE_URL ou VITE_SB_CLIENT_KEY não configuradas.\n' +
    'Adicione as variáveis de ambiente na Vercel: Settings → Environment Variables.'
  );
}

export const supabase = createClient<Database>(
  SUPABASE_URL  ?? 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY ?? 'placeholder',
);
