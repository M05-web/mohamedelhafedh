import React, { useState, useEffect } from 'react';
import { Card, Checkbox, TimePicker, Button, message, List, Divider, Empty, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { supabase } from '../../../config/supabase';
import { useAuth } from '../../hooks/useAuth';
import dayjs from 'dayjs';

const ScheduleManager = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [schedules, setSchedules] = useState([]);
    const [doctorProfile, setDoctorProfile] = useState(null);

    const daysOfWeek = [
        { label: 'Lundi', value: 1 },
        { label: 'Mardi', value: 2 },
        { label: 'Mercredi', value: 3 },
        { label: 'Jeudi', value: 4 },
        { label: 'Vendredi', value: 5 },
        { label: 'Samedi', value: 6 },
        { label: 'Dimanche', value: 0 }
    ];

    useEffect(() => {
        if (user) fetchSchedule();
    }, [user]);

    const fetchSchedule = async () => {
        setLoading(true);
        try {
            const { data: doctor } = await supabase.from('doctors').select('id').eq('user_id', user.id).single();
            if (!doctor) return;
            setDoctorProfile(doctor);

            const { data: scheds } = await supabase
                .from('schedules')
                .select('*')
                .eq('doctor_id', doctor.id);
            
            setSchedules(scheds || []);
        } catch (err) {
            message.error("Erreur lors du chargement de l'emploi du temps.");
        } finally {
            setLoading(false);
        }
    };

    const addDefaultSlot = async (dayValue) => {
        const newSlot = {
            doctor_id: doctorProfile.id,
            day_of_week: dayValue,
            start_time: '09:00:00',
            end_time: '17:00:00',
            is_available: true
        };

        const { data, error } = await supabase.from('schedules').insert(newSlot).select().single();
        if (error) message.error("Erreur lors de l'ajout.");
        else {
            setSchedules([...schedules, data]);
            message.success("Créneau ajouté.");
        }
    };

    const deleteSlot = async (id) => {
        const { error } = await supabase.from('schedules').delete().eq('id', id);
        if (error) message.error("Erreur de suppression.");
        else {
            setSchedules(schedules.filter(s => s.id !== id));
            message.success("Créneau supprimé.");
        }
    };

    const updateSlotTime = async (id, field, timeStr) => {
        const { error } = await supabase.from('schedules').update({ [field]: timeStr }).eq('id', id);
        if (error) message.error("Erreur de mise à jour.");
        else {
            setSchedules(schedules.map(s => s.id === id ? { ...s, [field]: timeStr } : s));
        }
    };

    return (
        <div style={{ padding: '10px' }}>
            <h3 style={{ marginBottom: '20px' }}>Gérer vos disponibilités</h3>
            <p style={{ color: '#64748b', marginBottom: '30px' }}>Définissez vos horaires hebdomadaires pour permettre aux patients de réserver.</p>

            <Row gutter={[24, 24]}>
                {daysOfWeek.map(day => (
                    <Col xs={24} md={12} lg={8} key={day.value}>
                        <Card 
                            title={day.label} 
                            size="small" 
                            extra={<Button type="link" icon={<PlusOutlined />} onClick={() => addDefaultSlot(day.value)}>Ajouter</Button>}
                            style={{ borderRadius: '12px' }}
                        >
                            <List
                                dataSource={schedules.filter(s => s.day_of_week === day.value)}
                                renderItem={slot => (
                                    <List.Item
                                        actions={[<Button type="text" danger icon={<DeleteOutlined />} onClick={() => deleteSlot(slot.id)} />]}
                                    >
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <TimePicker 
                                                format="HH:mm" 
                                                value={dayjs(slot.start_time, 'HH:mm:ss')} 
                                                onChange={(_, str) => updateSlotTime(slot.id, 'start_time', str + ':00')}
                                                style={{ width: '85px' }}
                                                clearIcon={false}
                                            />
                                            <span>-</span>
                                            <TimePicker 
                                                format="HH:mm" 
                                                value={dayjs(slot.end_time, 'HH:mm:ss')} 
                                                onChange={(_, str) => updateSlotTime(slot.id, 'end_time', str + ':00')}
                                                style={{ width: '85px' }}
                                                clearIcon={false}
                                            />
                                        </div>
                                    </List.Item>
                                )}
                                locale={{ emptyText: <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Aucune disponibilité</span> }}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default ScheduleManager;
