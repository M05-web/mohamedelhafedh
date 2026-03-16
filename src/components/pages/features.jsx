import React from "react";
import '../styles/features.css';

const Features = () => {

    return (
        <section id="features" style={{ padding: '8rem 0', background: 'white' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Pourquoi Nous Choisir</span>
                    <h2 style={{ fontSize: '2.5rem', marginTop: '1rem', color: '#1e293b' }}>Une nouvelle expérience de santé</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                    {[
                        { icon: 'fa-calendar-check', title: 'Réservation Instantanée', desc: 'Prenez rendez-vous en quelques secondes, 24h/24 et 7j/7.' },
                        { icon: 'fa-video', title: 'Consultation Vidéo', desc: 'Consultez des spécialistes depuis votre domicile en toute sécurité.' },
                        { icon: 'fa-file-medical', title: 'Dossier Sécurisé', desc: 'Vos documents et historiques médicaux centralisés et protégés.' },
                        { icon: 'fa-bell', title: 'Rappels Intelligents', desc: 'Ne manquez plus aucun rendez-vous grâce à nos notifications.' },
                        { icon: 'fa-user-md', title: 'Experts Vérifiés', desc: 'Tous nos praticiens font l\'objet d\'une vérification rigoureuse.' },
                        { icon: 'fa-shield-alt', title: 'Données Cryptées', desc: 'Le respect de votre vie privée est notre priorité absolue.' }
                    ].map((feature, idx) => (
                        <div key={idx} className="glass-panel" style={{ padding: '2.5rem', transition: 'var(--transition-base)', cursor: 'default' }}>
                            <div style={{ 
                                width: '60px', 
                                height: '60px', 
                                background: 'var(--primary-light)', 
                                borderRadius: '15px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                marginBottom: '1.5rem',
                                color: 'var(--primary)',
                                fontSize: '1.5rem'
                            }}>
                                <i className={`fas ${feature.icon}`}></i>
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#1e293b' }}>{feature.title}</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Features;