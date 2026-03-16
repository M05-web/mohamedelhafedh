import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://tzqkjhhjoucoikevsvxw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6cWtqaGhqb3Vjb2lrZXZzdnh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MTgwMjQsImV4cCI6MjA4OTE5NDAyNH0.YfzgenzGFsj4az8RvosJr1XlKfftRsbjie7FIIGvW-4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
