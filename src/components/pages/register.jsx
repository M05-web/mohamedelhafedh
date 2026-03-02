import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
/* import { auth } from "../../../config/firebase"; */
import '../styles/login.css';
import { supabase } from "../../../config/supabase";

const Register = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [role, setRole] = useState("patient"); // 'patient' or 'doctor'
    const [error, setError] = useState("");

    // Doctor specific fields
    const [name, setName] = useState("");
    const [specialty, setSpecialty] = useState("");
    const [experience, setExperience] = useState("");
    const [address, setAddress] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');


        if (password === repeatPassword) {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        role: role,
                        full_name: name,
                        specialty: specialty,
                        experience: experience,
                        address: address
                    }
                }
            });

            if (error) {
                console.log("Error", error.message);
                setError(error.message);
            } else {
                console.log('Utilisateur créé', data);
                // If developer mode or auto-login not enabled, navigate to login
                navigate("/login");
            }
        } else {
            setError("Les mots de passe ne correspondent pas");
        }

    }

    return (
        <div className="login-container">
            <form className="login-card" style={{ maxWidth: '450px' }} onSubmit={handleSubmit}>
                <h2>Inscription</h2>

                {error && <p className="error">{error}</p>}

                <div className="role-selector" style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', justifyContent: 'center' }}>
                    <button
                        type="button"
                        onClick={() => setRole('patient')}
                        className={role === 'patient' ? "btn-role active" : "btn-role"}
                        style={{ flex: 1, padding: '10px', borderRadius: '8px', border: role === 'patient' ? '2px solid #2563eb' : '1px solid #d1d5db', background: role === 'patient' ? '#eff6ff' : 'white', cursor: 'pointer' }}
                    >
                        Patient
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('doctor')}
                        className={role === 'doctor' ? "btn-role active" : "btn-role"}
                        style={{ flex: 1, padding: '10px', borderRadius: '8px', border: role === 'doctor' ? '2px solid #2563eb' : '1px solid #d1d5db', background: role === 'doctor' ? '#eff6ff' : 'white', cursor: 'pointer' }}
                    >
                        Docteur
                    </button>
                </div>

                <input
                    type="text"
                    placeholder="Nom complet"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <input
                    type="email"
                    placeholder="Adresse email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                {role === 'doctor' && (
                    <>
                        <input
                            type="text"
                            placeholder="Spécialité"
                            value={specialty}
                            onChange={(e) => setSpecialty(e.target.value)}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Années d'expérience"
                            value={experience}
                            onChange={(e) => setExperience(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Adresse du cabinet"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                        />
                    </>
                )}

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

                <button type="submit">S'inscrire en tant que {role === 'doctor' ? 'docteur' : 'patient'}</button>

                <p className="footer-text">
                    Avez-vous déjà un compte ? <span> <Link to="/login"> Connexion </Link></span>
                </p>
            </form>
        </div>
    );
}

export default Register;
