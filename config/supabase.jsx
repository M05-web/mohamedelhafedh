import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://qwzlbmoupmpobhzcxdrw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3emxibW91cG1wb2JoemN4ZHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NDY3NzgsImV4cCI6MjA4NjEyMjc3OH0.l2T05o84A2mbrapviCmobd0VfJZusJoJVRd38KlAaQs";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

