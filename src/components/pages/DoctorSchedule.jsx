import React from 'react';
import ScheduleManager from './scheduleManager';
import { Card } from 'antd';

const DoctorSchedule = () => {
    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '2.5rem', color: '#1a365d', marginBottom: '0.5rem', fontFamily: 'Outfit' }}>
                    Mon <span style={{ color: 'var(--primary)' }}>Planning</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Définissez vos créneaux de disponibilité pour les patients.</p>
            </div>

            <Card style={{ borderRadius: '20px', border: 'none', boxShadow: 'var(--shadow-md)', padding: '10px' }}>
                <ScheduleManager />
            </Card>
        </div>
    );
};

export default DoctorSchedule;
