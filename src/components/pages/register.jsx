import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
/* import { auth } from "../../../config/firebase"; */
import '../styles/login.css';
import { supabase } from "../../../config/supabase";

const Register = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');


        if (password == repeatPassword) {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password
            });

            if (error) {
                console.log("Error", error.message);
                setError(error.message);
            } else {
                console.log('Utilisateur créé', data);
            }
        } else {
            setError("The passwords are not the same");
        }

    }

    return (
        <div className="login-container">
            <form className="login-card" onSubmit={handleSubmit}>
                <h2>Inscription</h2>

                {error && <p className="error">{error}</p>}

                <input
                    type="email"
                    placeholder="Adresse email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Répéter le mot de passe"
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    required
                />

                <button type="submit">S'inscrire</button>

                <p className="footer-text">
                    Avez-vous, séja un compte ? <span> <a href="/login"> Connexion </a></span>
                </p>
            </form>
        </div>
    );
}

export default Register;