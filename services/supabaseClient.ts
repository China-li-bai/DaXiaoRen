let supabase: any = null;
let isSupabaseConfiguredValue = false;

try {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  if (supabaseUrl && supabaseAnonKey) {
    const { createClient } = await import('@supabase/supabase-js');
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    isSupabaseConfiguredValue = true;
  }
} catch (e) {
  console.warn('Supabase not configured or import failed:', e);
}

export { supabase };
export const isSupabaseConfigured = (): boolean => {
  return isSupabaseConfiguredValue;
};
