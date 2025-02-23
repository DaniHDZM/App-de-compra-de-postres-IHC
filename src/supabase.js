import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://TUSUPABASEURL.supabase.co"; // Reemplázalo con tu URL de Supabase
const supabaseKey = "TU_SUPABASE_KEY"; // Reemplázalo con tu clave API

export const supabase = createClient(supabaseUrl, supabaseKey);
