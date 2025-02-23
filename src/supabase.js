import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://zpcyhahgkkmlfhinmevp.supabase.co"; // Reemplázalo con tu URL de Supabase
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwY3loYWhna2ttbGZoaW5tZXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzcyNzEsImV4cCI6MjA1NTkxMzI3MX0.Wuk9IUNC6MW38i2LxmeImo3D8u5i8xO44JtfME9nQAw"; // Reemplázalo con tu clave API

export const supabase = createClient(supabaseUrl, supabaseKey);
