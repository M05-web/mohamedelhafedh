import React, { useEffect, useState } from "react";
import '../styles/doctorHospital.css';
import DoctorComponent from "./doctorComponent";
import { supabase } from "../../../config/supabase";

const Doctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const { data, error } = await supabase
                    .from("doctors")
                    .select("*");

                if (error) throw error;
                
                console.log("Doctors", data);
                
                setDoctors(data);
            } catch (err) {
                console.error("Erreur Supabase", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, []);

    if(loading) return <p> Chargement ... </p>
    return (
        <section id="doctors" class="doctors-section">
            <div class="container">
                <h2 class="section-title">Médecins disponibles à Dakar</h2>
                <div class="doctors-grid" id="doctorsList">
                    {/*  <!-- Doctors will be loaded by JavaScript --> */}
                    {
                        doctors.map((doctor, i) => {
                            return <DoctorComponent doctor={doctor} />
                        })
                    }
                </div>
            </div>
        </section>
    );
}

export default Doctors