import React from "react";
import { Button, Tag } from "antd";

const HospitalComponent = ({ hospital }) => {
    return (
        <div className="glass-panel" style={{ overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', transition: 'var(--transition-base)', background: 'white' }}>
            <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                <img 
                    src={hospital.image || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800"} 
                    alt={hospital.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
                />
                <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1 }}>
                    <Tag color="blue" style={{ borderRadius: '20px', padding: '4px 16px', fontWeight: '700', border: 'none', background: 'rgba(37, 99, 235, 0.9)', color: 'white', backdropFilter: 'blur(4px)', boxShadow: 'var(--shadow-md)' }}>
                        {hospital.type || "Clinique"}
                    </Tag>
                </div>
            </div>

            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', color: '#1a365d', margin: 0, fontFamily: 'Outfit' }}>{hospital.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontWeight: '700' }}>
                        <i className="fas fa-star"></i>
                        <span>{hospital.rating || "4.5"}</span>
                    </div>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fas fa-map-marker-alt" style={{ color: 'var(--primary)' }}></i>
                    {hospital.location}
                </p>

                <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                    {hospital.description || "Un établissement de santé d'excellence au service de votre bien-être."}
                </p>

                <div style={{ marginTop: 'auto', display: 'flex', gap: '12px' }}>
                    <Button type="primary" className="btn-premium btn-primary" block style={{ height: '48px', borderRadius: '12px', fontSize: '1rem' }} onClick={() => (window.location.href='#doctors')}>
                        Prendre rendez-vous
                    </Button>
                    <Button className="btn-premium" style={{ height: '48px', borderRadius: '12px', width: '50px', padding: 0, border: '1px solid #e2e8f0', color: 'var(--primary)' }}>
                        <i className="fas fa-phone-alt"></i>
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default HospitalComponent;