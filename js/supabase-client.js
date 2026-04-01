// Supabase Configuration
const SUPABASE_URL = 'https://jzbouubpjfxalifduhiu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6Ym91dWJwamZ4YWxpZmR1aGl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MTQ4NzIsImV4cCI6MjA5MDI5MDg3Mn0.S_-9UCsDjcgp0cBvSoKdRuROTie09DbSYvkQNQ1Karc';

// Initialize the Supabase client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
