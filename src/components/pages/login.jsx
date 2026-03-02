import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
/* import { auth } from "../../../config/firebase"; */
import '../styles/login.css';
import { supabase } from "../../../config/supabase";

const Login = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            setError(error.message === "Invalid login credentials" ? "Identifiants de connexion invalides" : error.message);
        } else {
            console.log("Connexion réussie", data.user);
            const role = data.user.user_metadata?.role;

            if (role === 'doctor') {
                navigate("/doctor-dashboard");
            } else {
                navigate("/dashboard");
            }
        }

    }

    return (
        <div className="login-container">
            <form className="login-card" onSubmit={handleSubmit}>
                <h2>Connexion</h2>

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

                <button type="submit">Se connecter</button>

                <p className="footer-text">
                    Pas de compte ? <span> <Link to="/register"> Inscription </Link></span>
                </p>
            </form>
        </div>
    );
}

export default Login;