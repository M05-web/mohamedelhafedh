import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
/* import { auth } from "../../../config/firebase"; */
import '../styles/login.css';
import { supabase } from "../../../config/supabase";
import { message } from "antd";
import PasswordInput from "../common/PasswordInput";

const Register = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [role, setRole] = useState("patient"); // 'patient' or 'doctor'
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Patient specific fields
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [gender, setGender] = useState("");

    // Doctor specific fields
    const [name, setName] = useState("");
    const [specialty, setSpecialty] = useState("");
    const [experience, setExperience] = useState("");
    const [address, setAddress] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (password !== repeatPassword) {
            setError("Les mots de passe ne correspondent pas");
            setLoading(false);
            return;
        }

        try {
            console.log("Register: Sign up attempt for", email);
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: name,
                        role: role,
                        date_of_birth: role === 'patient' ? dateOfBirth : null,
                        gender: role === 'patient' ? gender : null,
                        specialty: role === 'doctor' ? specialty : null,
                        experience: role === 'doctor' ? experience : null,
                        hospital: role === 'doctor' ? address : null
                    }
                }
            });

            if (authError) throw authError;
            if (!authData?.user) throw new Error("Aucun utilisateur retourné par le serveur.");

            const userId = authData.user.id;

            // Création manuelle du profil + patient/docteur
            // (fonctionne que la confirmation email soit activée ou non)
            if (authData.session) {
                // Profil
                await supabase.from('profiles').upsert({
                    id: userId,
                    full_name: name,
                    email: email,
                    role: role
                }, { onConflict: 'id' });

                if (role === 'doctor') {
                    // Récupérer l'ID de la spécialité
                    const { data: specData } = await supabase
                        .from('specialties')
                        .select('id')
                        .eq('name', specialty)
                        .single();

                    // Créer le docteur seulement s'il n'existe pas
                    const { data: existingDoc } = await supabase
                        .from('doctors')
                        .select('id')
                        .eq('user_id', userId)
                        .single();

                    if (!existingDoc) {
                        await supabase.from('doctors').insert({
                            user_id: userId,
                            specialty_id: specData?.id || null,
                            experience_years: parseInt(experience) || 0,
                            hospital: address || 'Non renseigné',
                            is_verified: true
                        });
                    }
                } else {
                    // Créer le patient seulement s'il n'existe pas
                    const { data: existingPat } = await supabase
                        .from('patients')
                        .select('id')
                        .eq('user_id', userId)
                        .single();

                    if (!existingPat) {
                        await supabase.from('patients').insert({
                            user_id: userId,
                            date_of_birth: dateOfBirth || null,
                            gender: gender || null
                        });
                    }
                }
            }

            console.log('Register: Inscription réussie pour', email);
            message?.success("Inscription réussie ! Redirection...");
            navigate("/login");
            
        } catch (err) {
            console.error("Registration Error:", err);
            const errorMsg = err?.message || err?.error_description || (typeof err === 'string' ? err : null);
            
            if (!errorMsg || errorMsg === "{}") {
                setError("Erreur de connexion au serveur. Veuillez réessayer dans quelques secondes.");
            } else if (errorMsg.includes("User already registered")) {
                setError("Un compte existe déjà avec cet email. Veuillez vous connecter ou utiliser un autre email.");
            } else if (errorMsg.includes("Database error")) {
                setError("Erreur de base de données. Veuillez réessayer.");
            } else {
                setError(errorMsg || "Une erreur inconnue est survenue. Veuillez réessayer.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-container">
            <div className="login-card" style={{ maxWidth: '600px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ display: 'inline-block', width: '64px', height: '64px', borderRadius: '16px', background: 'var(--primary)', padding: '4px', marginBottom: '1rem', overflow: 'hidden', boxShadow: '0 10px 30px rgba(59,130,246,0.3)' }}>
                        <img src="/medical-logo.svg" alt="WerguiYaram" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800' }}>Inscription</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>Rejoignez la révolution médicale numérique</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && <div className="error">{error}</div>}

                    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '2.5rem' }}>
                        <div className="role-selector" style={{ 
                            display: 'inline-flex', 
                            gap: '4px', 
                            padding: '4px',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '16px',
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}>
                            <button
                                type="button"
                                onClick={() => setRole('patient')}
                                style={{ 
                                    padding: '12px 24px', 
                                    borderRadius: '12px', 
                                    border: 'none',
                                    background: role === 'patient' ? 'var(--primary)' : 'transparent',
                                    color: 'white',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    fontSize: '15px',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: role === 'patient' ? '0 10px 20px rgba(59,130,246,0.3)' : 'none'
                                }}
                            >
                                Patient
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('doctor')}
                                style={{ 
                                    padding: '12px 24px', 
                                    borderRadius: '12px', 
                                    border: 'none',
                                    background: role === 'doctor' ? 'var(--primary)' : 'transparent',
                                    color: 'white',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    fontSize: '15px',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: role === 'doctor' ? '0 10px 20px rgba(59,130,246,0.3)' : 'none'
                                }}
                            >
                                Docteur
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: role === 'doctor' ? '1fr 1fr' : '1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem', fontSize: '14px' }}>Nom complet</label>
                            <input
                                type="text"
                                placeholder="Dr. Jean Dupont"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem', fontSize: '14px' }}>Email</label>
                            <input
                                type="email"
                                placeholder="jean@wergui.sn"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {role === 'patient' && (
                            <>
                                <div>
                                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem', fontSize: '14px' }}>Date de Naissance</label>
                                    <input
                                        type="date"
                                        value={dateOfBirth}
                                        onChange={(e) => setDateOfBirth(e.target.value)}
                                        required
                                        style={{ width: '100%', padding: '15px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem', fontSize: '14px' }}>Genre</label>
                                    <select
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        required
                                        style={{ 
                                            width: '100%', 
                                            padding: '18px 20px', 
                                            borderRadius: '16px', 
                                            border: '1px solid rgba(255,255,255,0.1)', 
                                            background: 'rgba(255, 255, 255, 0.05)', 
                                            color: 'white'
                                        }}
                                    >
                                        <option value="" disabled style={{ background: '#1e293b' }}>Sélectionnez</option>
                                        <option value="homme" style={{ background: '#1e293b' }}>Homme</option>
                                        <option value="femme" style={{ background: '#1e293b' }}>Femme</option>
                                        <option value="autre" style={{ background: '#1e293b' }}>Autre</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {role === 'doctor' && (
                            <>
                                <div>
                                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem', fontSize: '14px' }}>Spécialité</label>
                                    <select
                                        value={specialty}
                                        onChange={(e) => setSpecialty(e.target.value)}
                                        required
                                        style={{ 
                                            width: '100%', 
                                            padding: '18px 20px', 
                                            marginBottom: '1.5rem', 
                                            borderRadius: '16px', 
                                            border: '1px solid rgba(255,255,255,0.1)', 
                                            fontSize: '15px', 
                                            background: 'rgba(255, 255, 255, 0.05)', 
                                            color: 'white'
                                        }}
                                    >
                                        <option value="" disabled style={{ background: '#1e293b' }}>Sélectionnez spécialité</option>
                                        <option value="Cardiologie" style={{ background: '#1e293b' }}>Cardiologie</option>
                                        <option value="Dermatologie" style={{ background: '#1e293b' }}>Dermatologie</option>
                                        <option value="Neurologie" style={{ background: '#1e293b' }}>Neurologie</option>
                                        <option value="Pédiatrie" style={{ background: '#1e293b' }}>Pédiatrie</option>
                                        <option value="Médecin Généraliste" style={{ background: '#1e293b' }}>Médecin Généraliste</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem', fontSize: '14px' }}>Expérience (années)</label>
                                    <input
                                        type="number"
                                        placeholder="10"
                                        value={experience}
                                        onChange={(e) => setExperience(e.target.value)}
                                        required
                                    />
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem', fontSize: '14px' }}>Hôpital / Lieu de consultation</label>
                                    <select
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        required
                                        style={{ 
                                            width: '100%', 
                                            padding: '18px 20px', 
                                            marginBottom: '1.5rem', 
                                            borderRadius: '16px', 
                                            border: '1px solid rgba(255,255,255,0.1)', 
                                            fontSize: '15px', 
                                            background: 'rgba(255, 255, 255, 0.05)', 
                                            color: 'white'
                                        }}
                                    >
                                        <option value="" disabled style={{ background: '#1e293b' }}>Sélectionnez un hôpital</option>
                                        <optgroup label="Dakar" style={{ background: '#1e293b' }}>
                                            <option value="Hôpital Principal de Dakar" style={{ background: '#1e293b' }}>Hôpital Principal de Dakar</option>
                                            <option value="Hôpital Aristide Le Dantec" style={{ background: '#1e293b' }}>Hôpital Aristide Le Dantec</option>
                                            <option value="Hôpital de Fann" style={{ background: '#1e293b' }}>Hôpital de Fann</option>
                                            <option value="Hôpital Idrissa Pouye (Grand Yoff)" style={{ background: '#1e293b' }}>Hôpital Idrissa Pouye (Grand Yoff)</option>
                                            <option value="Hôpital Dalal Jamm" style={{ background: '#1e293b' }}>Hôpital Dalal Jamm</option>
                                            <option value="Hôpital d'Enfants Albert Royer" style={{ background: '#1e293b' }}>Hôpital d'Enfants Albert Royer</option>
                                        </optgroup>
                                        <optgroup label="Régions" style={{ background: '#1e293b' }}>
                                            <option value="Hôpital Régional de Thiès" style={{ background: '#1e293b' }}>Hôpital Régional de Thiès</option>
                                            <option value="Hôpital Régional de Saint-Louis" style={{ background: '#1e293b' }}>Hôpital Régional de Saint-Louis</option>
                                            <option value="Hôpital de la Paix (Ziguinchor)" style={{ background: '#1e293b' }}>Hôpital de la Paix (Ziguinchor)</option>
                                            <option value="Hôpital Matlaboul Fawzaini (Touba)" style={{ background: '#1e293b' }}>Hôpital Matlaboul Fawzaini (Touba)</option>
                                            <option value="Hôpital Régional de Kaolack" style={{ background: '#1e293b' }}>Hôpital Régional de Kaolack</option>
                                        </optgroup>
                                        <option value="Autre / Cabinet Privé" style={{ background: '#1e293b' }}>Autre / Cabinet Privé</option>
                                    </select>
                                </div>
                            </>
                        )}

                        <div>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem', fontSize: '14px' }}>Mot de passe</label>
                            <PasswordInput
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem', fontSize: '14px' }}>Confirmation</label>
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
                            position: 'relative',
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Traitement en cours...' : `Créer mon espace ${role === 'doctor' ? 'Docteur' : 'Patient'}`}
                    </button>

                    <p className="footer-text">
                        Déjà inscrit ? 
                        <span> <Link to="/login"> Connectez-vous </Link></span>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Register;
