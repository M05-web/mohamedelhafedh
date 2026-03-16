import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
/* import { auth } from "../../../config/firebase"; */
import '../styles/login.css';
import { supabase } from "../../../config/supabase";
import { useAuth } from "../../hooks/useAuth";
import { SecurityService } from '../../global/security';
import PasswordInput from "../common/PasswordInput";

const Login = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const { user, role, loading } = useAuth();

    // Removal of automatic redirect to allow multiple tabs to stay on login/register if desired
    // as per user request to keep pages "intact" when opening new tabs.

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            console.log("Login: Direct AUTH attempt for", email);
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (authError) throw authError;

            if (data.user) {
                console.log("Login: Auth Success, fetching role IMMEDIATELY...");
                // Bypass global hook delay and fetch role right here
                const userRole = await SecurityService.getUserRole(data.user);
                console.log("Login: Direct Role Result:", userRole);
                
                // FORCE REDIRECT immediately with history replacement
                if (userRole === 'doctor') {
                    navigate("/doctor-dashboard", { replace: true });
                } else if (userRole === 'admin') {
                    navigate("/admin-dashboard", { replace: true });
                } else {
                    navigate("/dashboard", { replace: true });
                }
            }
            
        } catch (err) {
            console.error("Login: HandleSubmit Error:", err);
            setError(err.message === "Invalid login credentials" ? "Identifiants de connexion invalides" : err.message);
            setIsSubmitting(false);
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'inline-block', width: '64px', height: '64px', borderRadius: '16px', background: 'var(--primary)', padding: '4px', marginBottom: '1rem', overflow: 'hidden', boxShadow: '0 10px 30px rgba(59,130,246,0.3)' }}>
                        <img src="/medical-logo.svg" alt="WerguiYaram" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800' }}>Connexion</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>Accédez à votre espace santé sécurisé</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && <div className="error">{error}</div>}

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem', fontSize: '14px' }}>Email</label>
                        <input
                            type="email"
                            placeholder="nom@exemple.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem', fontSize: '14px' }}>Mot de passe</label>
                        <PasswordInput
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Authentification...' : 'Se connecter'}
                    </button>

                    <p className="footer-text">
                        Vous n'avez pas de compte ?
                        <span> <Link to="/register"> Commencez ici </Link></span>
                    </p>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <Link
                            to="/admin/login"
                            style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', textDecoration: 'none', letterSpacing: '1px' }}
                        >
                            Portail Administrateur
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;