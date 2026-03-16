import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import '../styles/login.css';
import { supabase } from "../../../config/supabase";
import { useAuth } from "../../hooks/useAuth";
import { SecurityService } from '../../global/security';
import PasswordInput from "../common/PasswordInput";

const AdminLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const { user, role, loading } = useAuth();

    React.useEffect(() => {
        if (!loading && user && role === 'admin') {
            navigate("/admin-dashboard", { replace: true });
        }
    }, [user, role, loading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (authError) throw authError;

            if (data.user) {
                const userRole = await SecurityService.getUserRole(data.user);

                if (userRole !== 'admin') {
                    await supabase.auth.signOut();
                    throw new Error("Accès refusé. Ce portail est réservé aux administrateurs.");
                }

                navigate("/admin-dashboard", { replace: true });
            }
        } catch (err) {
            setError(
                err.message === "Invalid login credentials"
                    ? "Identifiants invalides."
                    : err.message
            );
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-container" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
            <div className="login-card" style={{ maxWidth: '420px', border: '1px solid rgba(239,68,68,0.2)' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: '20px',
                        padding: '6px 16px',
                        marginBottom: '1.5rem'
                    }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 2s infinite' }} />
                        <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase' }}>
                            Accès Administrateur
                        </span>
                    </div>

                    <div style={{
                    display: 'block',
                    width: '64px',
                    height: '64px',
                    margin: '0 auto 1.5rem auto',
                    borderRadius: '16px',
                    background: 'rgba(239,68,68,0.15)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    padding: '12px',
                    overflow: 'hidden'
                }}>
                    <img src="/medical-logo.svg" alt="WerguiYaram" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                    <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800' }}>Console Admin</h2>
                    <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                        Portail réservé aux administrateurs WerguiYaram
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="error" style={{ background: 'rgba(239,68,68,0.1)', borderLeft: '3px solid #ef4444' }}>
                            {error}
                        </div>
                    )}

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', fontSize: '14px' }}>
                            Email Administrateur
                        </label>
                        <input
                            type="email"
                            placeholder="admin@wergui.sn"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ borderColor: 'rgba(239,68,68,0.2)' }}
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', fontSize: '14px' }}>
                            Mot de passe
                        </label>
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
                        style={{
                            background: isSubmitting ? 'rgba(239,68,68,0.5)' : 'linear-gradient(135deg, #dc2626, #991b1b)',
                            boxShadow: '0 10px 25px rgba(239,68,68,0.3)',
                            opacity: isSubmitting ? 0.8 : 1
                        }}
                    >
                        {isSubmitting ? 'Vérification en cours...' : 'Accéder à la Console'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', marginBottom: '0.5rem' }}>
                            Pas encore de compte admin ?
                        </p>
                        <Link
                            to="/admin/register"
                            style={{ color: '#ef4444', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}
                        >
                            Créer un compte administrateur →
                        </Link>
                    </div>

                    <div style={{
                        marginTop: '2rem',
                        paddingTop: '1.5rem',
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        textAlign: 'center'
                    }}>
                        <Link
                            to="/login"
                            style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', textDecoration: 'none' }}
                        >
                            ← Retour au portail Patient / Médecin
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
