import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PlaceholderPage = ({ title = "Bientôt disponible" }) => {
    const navigate = useNavigate();
    const { role } = useAuth();

    const handleBack = () => {
        if (role === 'doctor') navigate('/doctor-dashboard');
        else if (role === 'admin') navigate('/admin-dashboard');
        else navigate('/dashboard');
    };
    
    return (
        <div style={{ 
            height: '70vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '30px',
            margin: '20px',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
            <Result
                status="info"
                title={<span style={{ fontFamily: 'Outfit', fontWeight: '800', fontSize: '2rem' }}>{title}</span>}
                subTitle={<p style={{ fontSize: '1.1rem', color: '#64748b' }}>Nous préparons une expérience médicale d'exception pour cette section.</p>}
                extra={
                    <Button 
                        type="primary" 
                        onClick={handleBack} 
                        className="btn-premium"
                        style={{ height: '50px', borderRadius: '15px', padding: '0 30px', fontWeight: '700' }}
                    >
                        Retour au Tableau de Bord
                    </Button>
                }
            />
        </div>
    );
};

export default PlaceholderPage;
