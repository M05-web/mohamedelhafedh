import { useEffect, useState} from "react";
import '../styles/doctorHospital.css';
import HospitalComponent from "./hospitalComponent";
import { supabase } from "../../../config/supabase";

const hospitalList = [
    {
        id: 1,
        name: "Hôpital Principal de Dakar",
        type: "Hôpital Public",
        image: "https://images.unsplash.com/photo-1586773860418-dc22f8b874bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        location: "Avenue Nelson Mandela, Dakar",
        rating: 4.2,
        reviews: 420,
        description: "Hôpital public de référence avec service d'urgences 24h/24 et toutes les spécialités médicales"
    },
    {
        id: 2,
        name: "Clinique de la Madeleine",
        type: "Clinique Privée",
        image: "https://images.unsplash.com/photo-1516549655669-df6654e435de?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        location: "Rue de la Madeleine, Plateau",
        rating: 4.5,
        reviews: 310,
        description: "Clinique privée moderne avec équipements de pointe et médecins spécialistes"
    },
    {
        id: 3,
        name: "Clinique du Cap Vert",
        type: "Clinique Privée",
        image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        location: "Almadies, Dakar",
        rating: 4.7,
        reviews: 285,
        description: "Clinique haut de gamme avec médecins internationaux et équipements dernier cri"
    }
];

const Hospital = () => {

    const [hospitals, setHospitals] = useState([]);
        const [loading, setLoading] = useState(true);
    
        useEffect(() => {
            const fetchHospitals = async () => {
                try {
                    const { data, error } = await supabase
                        .from("hospitals")
                        .select("*");
    
                    if (error) throw error;
                    
                    console.log("Hospitals", data);
                    
                    setHospitals(data);
                } catch (err) {
                    console.error("Erreur Supabase", err);
                } finally {
                    setLoading(false);
                }
            };
    
            fetchHospitals();
        }, []);
    
        if(loading) return <p> Chargement ... </p>

    return (
        <section id="hospitals" style={{ padding: '6rem 0', background: 'white' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>Établissements</span>
                    <h2 style={{ fontSize: '2.5rem', marginTop: '0.5rem', color: '#1e293b' }}>Hôpitaux et Cliniques à Dakar</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '1rem', fontSize: '1.1rem' }}>Les meilleurs établissements de santé sélectionnés pour vous.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem' }}>
                    {hospitals.map((hospital, i) => (
                        <HospitalComponent key={hospital.id || i} hospital={hospital}/>
                    ))}
                </div>
                
                {hospitals.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '4rem', background: '#f8fafc', borderRadius: '20px', border: '2px dashed #e2e8f0' }}>
                        <i className="fas fa-hospital-alt" style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem', display: 'block' }}></i>
                        <p style={{ color: '#94a3b8' }}>Aucun établissement trouvé pour le moment.</p>
                    </div>
                )}
            </div>
        </section>
    );
}

export default Hospital;