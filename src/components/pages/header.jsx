import React from "react";
import { useNavigate } from "react-router-dom";
import '../styles/header.css';
import '../styles/hero.css';
import { supabase } from "../../../config/supabase";

const Header = () => {

    const navigate =useNavigate();

    const logout = async () => {
        try {
            await supabase.auth.signOut()
            navigate("/login");
            console.log("Déconnecté avec succès");
        } catch(error) {
            console.error("Erreur lors de la deconnexion", error);
        }
    }

    return (
        <header className="glass-nav">
            <div className="container nav-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px' }}>
                <a href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'var(--primary)', fontSize: '1.5rem', fontWeight: '800', fontFamily: 'Outfit' }}>
                    <img src="/medical-logo.svg" alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
                    <span>WerguiYaram <span style={{ color: 'var(--text-main)' }}>Sénégal</span></span>
                </a>
                
                <ul className="nav-links" style={{ display: 'flex', gap: '2rem', listStyle: 'none' }}>
                    <li><a href="/" style={{ textDecoration: 'none', color: 'var(--primary)', fontWeight: '600' }}>Accueil</a></li>
                    <li><a href="#doctors" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: '500' }}>Médecins</a></li>
                    <li><a href="#hospitals" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: '500' }}>Hôpitaux</a></li>
                    <li><a href="#categories" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: '500' }}>Spécialités</a></li>
                </ul>

                <div className="nav-buttons">
                    <button className="btn-premium btn-primary" onClick={logout}>
                        Déconnexion
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Header;