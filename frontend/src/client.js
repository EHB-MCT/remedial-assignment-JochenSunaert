
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://sxgvcgsankbheuxosgca.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4Z3ZjZ3NhbmtiaGV1eG9zZ2NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzOTk2ODQsImV4cCI6MjA2OTk3NTY4NH0.uOGN4D0eJ9dwul3h3ci1_0Jye0U5Jysl8n12-OlS4Ko'
export const supabase = createClient(supabaseUrl, supabaseKey)