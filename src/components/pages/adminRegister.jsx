import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import '../styles/login.css';
import { supabase } from "../../../config/supabase";
import { message } from "antd";
import PasswordInput from "../common/PasswordInput";

// Code secret requis pour créer un compte administrateur
const ADMIN_SECRET_CODE = "WERGUI-ADMIN-2026";

const AdminRegister = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [secretCode, setSecretCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Vérification du code secret
        if (secretCode !== ADMIN_SECRET_CODE) {
            setError("Code d'accès administrateur invalide. Accès refusé.");
            return;
        }

        if (password !== repeatPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        if (password.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères.");
            return;
        }

        setLoading(true);

        try {
            // 1. Créer le compte auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                        role: 'admin'
                    }
                }
            });

            if (authError) throw authError;
            if (!authData?.user) throw new Error("Erreur lors de la création du compte.");

            const userId = authData.user.id;

            // 2. Création manuelle du profil admin (doublement sécurisé)
            if (authData.session) {
                await supabase.from('profiles').upsert({
                    id: userId,
                    full_name: name,
                    email: email,
                    role: 'admin'
                }, { onConflict: 'id' });
            }

            message.success("Compte administrateur créé avec succès !");
            navigate("/admin/login");

        } catch (err) {
            const errorMsg = err?.message || "";
            if (errorMsg.includes("User already registered")) {
                setError("Un compte existe déjà avec cet email.");
            } else {
                setError(errorMsg || "Erreur lors de la création du compte. Veuillez réessayer.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
            <div className="login-card" style={{ maxWidth: '480px', border: '1px solid rgba(239,68,68,0.2)' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
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
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                        <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase' }}>
                            Accès Restreint
                        </span>
                    </div>

                    <div style={{
                        display: 'block',
                        width: '64px', height: '64px',
                        margin: '0 auto 1rem auto',
                        borderRadius: '16px',
                        background: 'rgba(239,68,68,0.15)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        padding: '12px',
                        overflow: 'hidden'
                    }}>
                        <img src="/medical-logo.svg" alt="WerguiYaram" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800' }}>Créer un compte Admin</h2>
                    <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                        Un code d'accès est requis pour continuer
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="error" style={{ background: 'rgba(239,68,68,0.1)', borderLeft: '3px solid #ef4444' }}>
                            {error}
                        </div>
                    )}

                    {/* Code secret — premier champ intentionnellement */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', color: '#ef4444', marginBottom: '0.5rem', fontSize: '14px', fontWeight: '700' }}>
                            🔐 Code d'accès administrateur
                        </label>
                        <PasswordInput
                            placeholder="Code secret requis"
                            value={secretCode}
                            onChange={(e) => setSecretCode(e.target.value)}
                            required
                            style={{ borderColor: 'rgba(239,68,68,0.3)', letterSpacing: '3px' }}
                        />
                    </div>

                    <div style={{
                        height: '1px',
                        background: 'rgba(255,255,255,0.05)',
                        margin: '1.5rem 0'
                    }} />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', fontSize: '14px' }}>
                                Nom complet
                            </label>
                            <input
                                type="text"
                                placeholder="Prénom Nom"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', fontSize: '14px' }}>
                                Email
                            </label>
                            <input
                                type="email"
                                placeholder="admin@wergui.sn"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div>
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

                        <div>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', fontSize: '14px' }}>
                                Confirmation
                            </label>
                            <PasswordInput
                                placeholder="••••••••"
                                value={repeatPassword}
                                onChange={(e) => setRepeatPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '1.5rem',
                            background: loading ? 'rgba(239,68,68,0.5)' : 'linear-gradient(135deg, #dc2626, #991b1b)',
                            boxShadow: '0 10px 25px rgba(239,68,68,0.3)',
                            opacity: loading ? 0.8 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Création en cours...' : 'Créer le compte Administrateur'}
                    </button>

                    <p className="footer-text" style={{ marginTop: '1.5rem' }}>
                        Déjà un compte ?{' '}
                        <Link to="/admin/login" style={{ color: '#ef4444' }}>
                            Se connecter
                        </Link>
                    </p>

                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
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

export default AdminRegister;
