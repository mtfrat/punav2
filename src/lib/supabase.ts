import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Falta configurar las variables de entorno de Supabase en el archivo .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const translatePostTitle = (id: string, title: string): string => {
  if (id === 'ce50c784-fb5f-4fb0-8366-b509505ad350') {
    return 'Google lleva la IA agéntica y los widgets creados mediante vibe-coding a Android';
  }
  return title;
};
