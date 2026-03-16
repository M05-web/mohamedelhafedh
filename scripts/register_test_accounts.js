import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tzqkjhhjoucoikevsvxw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6cWtqaGhqb3Vjb2lrZXZzdnh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MTgwMjQsImV4cCI6MjA4OTE5NDAyNH0.YfzgenzGFsj4az8RvosJr1XlKfftRsbjie7FIIGvW-4";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function registerTestAccounts() {
    console.log("Starting registration...");

    // 1. Patient
    console.log("Registering Patient...");
    const { data: pData, error: pError } = await supabase.auth.signUp({
        email: "tafzombaye11@gmail.com",
        password: "1234567890",
        options: {
            data: {
                full_name: "Tafzom Baye",
                role: "patient",
                date_of_birth: "1990-01-01",
                gender: "homme"
            }
        }
    });
    if (pError) console.error("Patient Registration Error:", pError.message);
    else console.log("Patient Registered successfully!");

    // 2. Doctor
    console.log("Registering Doctor...");
    const { data: dData, error: dError } = await supabase.auth.signUp({
        email: "infocs221@gmail.com",
        password: "0987654321",
        options: {
            data: {
                full_name: "Dr. Info CS",
                role: "doctor",
                specialty: "Cardiologie",
                experience: 10,
                hospital: "Clinique Test"
            }
        }
    });
    if (dError) console.error("Doctor Registration Error:", dError.message);
    else console.log("Doctor Registered successfully!");
}

registerTestAccounts();
