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

    return(
        <header>
        <div className="container nav-container">
            <a href="#" class="logo">
                <i className="fas fa-stethoscope"></i> WerGui Sénégal
            </a>
            <ul class="nav-links">
                <li><a href="#" className="active">Accueil</a></li>
                <li><a href="#doctors">Médecins</a></li>
                <li><a href="#hospitals">Hôpitaux</a></li>
                <li><a href="#categories">Spécialités</a></li>
                <li><a href="#features">Services</a></li>
            </ul>
            <div class="nav-buttons">
                {/* <button id="loginBtn" className="btn btn-login">Connexion</button> */}
                <button id="signupBtn" className="btn btn-signup" onClick={logout}>Se déconnecter</button>
            </div>
        </div>
    </header>
    );
}

export default Header;