import React, { useState, useEffect } from "react";
import { 
    Card, 
    Button, 
    List, 
    Tag, 
    Modal, 
    Typography, 
    message, 
    Skeleton, 
    Empty,
    Avatar,
    Space
} from "antd";
import { 
    PlusOutlined, 
    CalendarOutlined, 
    ClockCircleOutlined, 
    MedicineBoxOutlined,
    InfoCircleOutlined,
    EnvironmentOutlined
} from '@ant-design/icons';
import { supabase } from "../../../config/supabase";
import { useAuth } from "../../hooks/useAuth";
import AppointmentModal from "./appointmentModal";
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const Appointments = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (user) {
            fetchAppointments();
        }
    }, [user]);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            // 1. Get Patient ID
            const { data: patientData, error: patientError } = await supabase
                .from('patients')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (patientError || !patientData) throw new Error("Profil patient non trouvé.");

            // 2. Fetch Appointments with Doctor and Specialty info
            const { data, error } = await supabase
                .from('appointments')
                .select(`
                    id,
                    appointment_date,
                    appointment_time,
                    status,
                    reason,
                    doctor_id,
                    doctors:doctor_id (
                        profiles:user_id (full_name),
                        specialties:specialty_id (name)
                    )
                `)
                .eq('patient_id', patientData.id)
                .order('appointment_date', { ascending: false });

            if (error) {
                console.error("Supabase Query Error:", error);
                throw error;
            }
            setAppointments(data || []);
        } catch (err) {
            console.error("Error fetching appointments:", err);
            message.error("Impossible de charger vos rendez-vous.");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'green';
            case 'pending': return 'orange';
            case 'cancelled': return 'red';
            case 'completed': return 'blue';
            default: return 'default';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'confirmed': return 'Confirmé';
            case 'pending': return 'En attente';
            case 'cancelled': return 'Annulé';
            case 'completed': return 'Terminé';
            default: return status;
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '50px' }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '15px'
            }}>
                <div>
                    <Title level={2} style={{ margin: 0, fontFamily: 'Outfit', fontWeight: 800, color: '#1a365d' }}>
                        Mes Rendez-vous
                    </Title>
                    <Text type="secondary">Gérez vos consultations passées et à venir.</Text>
                </div>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    size="large"
                    onClick={() => setIsModalOpen(true)}
                    style={{ 
                        height: '50px', 
                        borderRadius: '12px', 
                        background: 'var(--primary)',
                        padding: '0 25px',
                        fontWeight: '600',
                        boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
                    }}
                >
                    Prendre un Rendez-vous
                </Button>
            </div>

            {loading ? (
                <Skeleton active avatar paragraph={{ rows: 4 }} />
            ) : appointments.length > 0 ? (
                <List
                    grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 1, xl: 1, xxl: 1 }}
                    dataSource={appointments}
                    renderItem={(item) => (
                        <List.Item>
                            <Card 
                                hoverable
                                style={{ 
                                    borderRadius: '20px', 
                                    border: 'none', 
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                    overflow: 'hidden'
                                }}
                                bodyStyle={{ padding: '24px' }}
                            >
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                    <Avatar
                                        size={52}
                                        style={{ background: '#eff6ff', color: 'var(--primary)', flexShrink: 0 }}
                                        icon={<MedicineBoxOutlined />}
                                    />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                                            <Title level={4} style={{ margin: 0, color: '#1a365d', fontWeight: 700, fontSize: '1rem' }}>
                                                Dr. {item.doctors?.profiles?.full_name}
                                            </Title>
                                            <Tag
                                                color={getStatusColor(item.status)}
                                                style={{ fontSize: '13px', padding: '2px 12px', borderRadius: '20px', fontWeight: 800, textTransform: 'uppercase', border: 'none', flexShrink: 0, margin: 0 }}
                                            >
                                                {getStatusLabel(item.status)}
                                            </Tag>
                                        </div>
                                        <Tag color="blue" style={{ borderRadius: '6px', border: 'none', fontWeight: 600, marginBottom: '8px' }}>
                                            {item.doctors?.specialties?.name}
                                        </Tag>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', color: '#64748b', fontSize: '13px', marginBottom: '6px' }}>
                                            <span><CalendarOutlined /> {dayjs(item.appointment_date).format('DD MMM YYYY')}</span>
                                            <span><ClockCircleOutlined /> {item.appointment_time}</span>
                                        </div>
                                        <Text type="secondary" style={{ fontStyle: 'italic', fontSize: '0.85rem' }}>
                                            "{item.reason || 'Consultation de routine'}"
                                        </Text>
                                    </div>
                                </div>
                            </Card>
                        </List.Item>
                    )}
                />
            ) : (
                <Card style={{ borderRadius: '20px', textAlign: 'center', padding: '40px' }}>
                    <Empty 
                        description={
                            <span>
                                Vous n'avez pas encore de rendez-vous.<br/>
                                <Text type="secondary">Commencez par planifier votre première consultation.</Text>
                            </span>
                        }
                    >
                        <Button type="primary" onClick={() => setIsModalOpen(true)} style={{ borderRadius: '10px' }}>
                            Prendre RDV maintenant
                        </Button>
                    </Empty>
                </Card>
            )}

            {/* Modal for new appointment */}
            <Modal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width="min(700px, 95vw)"
                centered
                bodyStyle={{ padding: '0' }}
                destroyOnClose
            >
                <div style={{ padding: '20px' }}>
                    <AppointmentModal 
                        closeModal={() => {
                            setIsModalOpen(false);
                            fetchAppointments();
                        }} 
                    />
                </div>
            </Modal>
        </div>
    );
};

export default Appointments;
