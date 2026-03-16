import React from "react";
import { Tag, Button, Rate, Avatar } from "antd";
import { ShopOutlined, ClockCircleOutlined, MedicineBoxOutlined, StarFilled } from '@ant-design/icons';

const DoctorComponent = ({ doctor }) => {
    return (
        <div className="glass-panel" style={{ 
            background: 'white', 
            borderRadius: '20px', 
            padding: '1.5rem', 
            transition: 'var(--transition-base)',
            cursor: 'pointer',
            border: '1px solid #f1f5f9',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '1.5rem' }}>
                <Avatar size={64} style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: '700', fontSize: '1.5rem' }}>
                    {doctor.name?.charAt(0)}
                </Avatar>
                <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#1a365d', margin: 0, fontWeight: '700', fontFamily: 'Outfit' }}>Dr. {doctor.name}</h3>
                    <Tag color="blue" style={{ borderRadius: '20px', padding: '0 10px', fontSize: '0.75rem', fontWeight: '600', marginTop: '4px', border: 'none', background: 'var(--primary-light)', color: 'var(--primary)' }}>
                        {doctor.specialty}
                    </Tag>
                </div>
            </div>
            
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>
                    <ShopOutlined style={{ color: 'var(--primary)' }} /> 
                    <span>{doctor.hospital || 'Cabinet Privé'}</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>
                    <ClockCircleOutlined style={{ color: 'var(--primary)' }} /> 
                    <span>{doctor.experience || '0'} ans d'expérience</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fffbeb', padding: '6px 12px', borderRadius: '10px', width: 'fit-content', marginTop: '1rem' }}>
                    <StarFilled style={{ color: '#f59e0b' }} />
                    <span style={{ fontWeight: '700', color: '#92400e' }}>4.8</span>
                    <span style={{ color: '#d97706', fontSize: '0.8rem' }}>(120 avis)</span>
                </div>
            </div>

            <div style={{ 
                marginTop: '1.5rem', 
                paddingTop: '1.5rem', 
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Consultation</div>
                    <div style={{ color: '#1a365d', fontWeight: '800', fontSize: '1.1rem' }}>
                        {doctor.price}
                    </div>
                </div>
                <Button 
                    type="primary" 
                    className="btn-premium btn-primary"
                    style={{ borderRadius: '12px', height: '40px' }}
                >
                    Réserver
                </Button>
            </div>
        </div>
    );
}

export default DoctorComponent;