import React from "react";
import '../styles/hero.css';

const Hero = () => {
    return (
        <section className="hero-premium" style={{ 
            minHeight: '85vh', 
            display: 'flex', 
            alignItems: 'center', 
            position: 'relative',
            background: 'url("/premium_medical_hero.png") no-repeat center center/cover',
            marginTop: '-80px',
            paddingTop: '80px'
        }}>
            <div className="hero-overlay" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 100%)', zIndex: 1 }}></div>
            
            <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ maxWidth: '700px' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', marginBottom: '1rem', display: 'block' }}>
                        Plateforme de Santé de Confiance
                    </span>
                    <h1 style={{ fontSize: '4rem', lineHeight: '1.1', marginBottom: '1.5rem', color: '#1e293b' }}>
                        La santé de demain, <br />
                        <span style={{ color: 'var(--primary)' }}>accessible aujourd'hui.</span>
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2.5rem', maxWidth: '600px' }}>
                        Prenez rendez-vous avec les meilleurs médecins du Sénégal en quelques secondes. Consultation vidéo ou en cabinet.
                    </p>

                    <div className="glass-panel" style={{ padding: '8px', display: 'flex', gap: '8px', maxWidth: '800px', boxShadow: 'var(--shadow-lg)' }}>
                        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <i className="fas fa-search" style={{ position: 'absolute', left: '15px', color: 'var(--primary)' }}></i>
                            <input type="text" placeholder="Médecin, spécialité..." style={{ width: '100%', padding: '15px 15px 15px 45px', border: 'none', background: 'transparent', fontSize: '1rem', outline: 'none' }} />
                        </div>
                        <div style={{ width: '1px', background: 'rgba(0,0,0,0.1)', margin: '10px 0' }}></div>
                        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <i className="fas fa-map-marker-alt" style={{ position: 'absolute', left: '15px', color: 'var(--primary)' }}></i>
                            <input type="text" placeholder="Dakar, Sénégal" style={{ width: '100%', padding: '15px 15px 15px 45px', border: 'none', background: 'transparent', fontSize: '1rem', outline: 'none' }} />
                        </div>
                        <button className="btn-premium btn-primary" style={{ padding: '0 30px' }}>Rechercher</button>
                    </div>
                    
                    <div style={{ marginTop: '2rem', display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="fas fa-check-circle" style={{ color: 'var(--secondary)' }}></i>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>100% Sécurisé</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="fas fa-check-circle" style={{ color: 'var(--secondary)' }}></i>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Médecins Vérifiés</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Hero;