import React from "react";
import '../styles/quickCategories.css';
const QuickCategories = () => {

    return (
        <section id="categories" style={{ padding: '6rem 0', background: '#f8fafc' }}>
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                    <div>
                        <span style={{ color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>Spécialités</span>
                        <h2 style={{ fontSize: '2rem', marginTop: '0.5rem', color: '#1e293b' }}>Trouvez un spécialiste</h2>
                    </div>
                    <a href="#all-categories" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none', borderBottom: '2px solid' }}>Voir tout</a>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.5rem' }}>
                    {[
                        { icon: 'fa-user-md', name: 'Généraliste', color: '#3b82f6' },
                        { icon: 'fa-tooth', name: 'Dentiste', color: '#10b981' },
                        { icon: 'fa-baby', name: 'Pédiatre', color: '#f59e0b' },
                        { icon: 'fa-female', name: 'Gynécologue', color: '#ec4899' },
                        { icon: 'fa-heartbeat', name: 'Cardiologue', color: '#ef4444' },
                        { icon: 'fa-allergies', name: 'Dermatologue', color: '#8b5cf6' }
                    ].map((cat, idx) => (
                        <a key={idx} href="#" style={{ textDecoration: 'none' }}>
                            <div className="glass-panel" style={{ 
                                padding: '2rem 1rem', 
                                textAlign: 'center', 
                                transition: 'var(--transition-base)',
                                border: '1px solid rgba(255,255,255,0.5)',
                                background: 'white'
                            }}>
                                <div style={{ 
                                    width: '60px', 
                                    height: '60px', 
                                    background: `${cat.color}15`, 
                                    borderRadius: '50%', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    margin: '0 auto 1.25rem',
                                    color: cat.color,
                                    fontSize: '1.5rem',
                                    boxShadow: `0 8px 16px ${cat.color}10`
                                }}>
                                    <i className={`fas ${cat.icon}`}></i>
                                </div>
                                <h3 style={{ fontSize: '1rem', color: '#1e293b', fontWeight: '600', marginBottom: '0.25rem' }}>{cat.name}</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{idx + 10}+ Praticiens</p>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default QuickCategories;