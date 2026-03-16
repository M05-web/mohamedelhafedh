import React, { useEffect, useState } from "react";
import '../styles/index.css';
import { supabase } from "../../../config/supabase";
import { useAuth } from "../../hooks/useAuth";
import { 
    Button, 
    Modal, 
    Tag, 
    List, 
    Card, 
    Statistic, 
    Row, 
    Col, 
    Upload, 
    message, 
    Timeline, 
    Progress,
    Avatar,
    Empty
} from "antd";
import { 
    CalendarOutlined, 
    FilePdfOutlined, 
    HistoryOutlined, 
    UploadOutlined, 
    HeartOutlined, 
    BellOutlined,
    SearchOutlined,
    PlusOutlined,
    ArrowRightOutlined,
    SafetyCertificateOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import AppointmentModal from './appointmentModal';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchPatientData();
        }
    }, [user]);

    const fetchPatientData = async () => {
        setLoading(true);
        try {
            const { data: patientData } = await supabase.from('patients').select('id').eq('user_id', user.id).single();
            if (!patientData) return;

            const [apptsRes, recordsRes, docsRes] = await Promise.all([
                supabase.from("appointments").select(`id, appointment_date, appointment_time, status, reason, doctor_id, doctors:doctor_id(profiles:user_id(full_name), specialties:specialty_id(name))`).eq('patient_id', patientData.id).order('appointment_date', { ascending: false }),
                supabase.from('medical_records').select(`id, diagnosis, treatment, doctor_id, created_at, doctors:doctor_id(profiles:user_id(full_name))`).eq('patient_id', patientData.id).order('created_at', { ascending: false }),
                supabase.from('documents').select('id, file_name, created_at').eq('patient_id', patientData.id)
            ]);
            
            setAppointments(apptsRes.data || []);
            setMedicalRecords(recordsRes.data || []);
            setDocuments(docsRes.data || []);
        } catch (err) {
            console.error("Dashboard Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const nextAppointment = appointments.find(a => a.status === 'confirmed' && dayjs(a.appointment_date).isAfter(dayjs().subtract(1, 'day')));

    return (
        <div style={{ paddingBottom: '4rem', animation: 'fadeIn 0.5s ease-out' }}>
            {/* God Mode Header */}
            <div className="dashboard-header" style={{ 
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
                padding: '3rem', 
                borderRadius: '30px', 
                marginBottom: '3rem',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(0,0,0,0.15)'
            }}>
                <style>
                    {`
                        @media (max-width: 768px) {
                            .dashboard-header { padding: 2rem !important; margin-bottom: 2rem !important; }
                            .dashboard-header h1 { font-size: 1.8rem !important; }
                            .dashboard-header p { font-size: 1rem !important; }
                            .header-actions { flex-direction: column; gap: 1rem; width: 100%; }
                            .header-actions button { width: 100%; height: 50px !important; }
                        }
                    `}
                </style>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div className="header-actions dash-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                            <Tag color="cyan" style={{ borderRadius: '20px', padding: '2px 12px', marginBottom: '1rem', border: 'none', fontWeight: '700' }}>
                                <SafetyCertificateOutlined style={{ marginRight: '6px' }} /> PLATEFORME SÉCURISÉE
                            </Tag>
                            <h1 style={{ fontSize: '3rem', color: 'white', marginBottom: '0.5rem', fontFamily: 'Outfit', fontWeight: '800' }}>
                                Bonjour, <span style={{ color: 'var(--primary)', textShadow: '0 0 20px rgba(59,130,246,0.5)' }}>{user?.user_metadata?.full_name ? user.user_metadata.full_name.split(' ')[0] : 'Patient'}</span>
                            </h1>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem', maxWidth: '500px' }}>
                                Votre santé est notre priorité. Voici un aperçu complet de votre parcours de soins aujourd'hui.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <Button 
                                type="primary" 
                                icon={<PlusOutlined />} 
                                size="large"
                                onClick={() => setAppointmentModalOpen(true)}
                                style={{ 
                                    height: '60px', 
                                    padding: '0 30px', 
                                    borderRadius: '16px', 
                                    background: 'var(--primary)',
                                    border: 'none',
                                    fontWeight: '700',
                                    fontSize: '16px',
                                    boxShadow: '0 10px 20px rgba(59,130,246,0.3)'
                                }}
                            >
                                Nouveau Rendez-vous
                            </Button>
                        </div>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', background: 'var(--primary)', opacity: 0.05, borderRadius: '50%' }}></div>
                <div style={{ position: 'absolute', bottom: '-50px', left: '10%', width: '200px', height: '200px', background: 'var(--secondary)', opacity: 0.05, borderRadius: '50%' }}></div>
            </div>

            {/* Premium Stats Grid */}
            <Row gutter={[24, 24]} style={{ marginBottom: '3rem' }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={{ borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-md)' }} bodyStyle={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div style={{ width: '48px', height: '48px', background: 'var(--primary-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                <CalendarOutlined style={{ fontSize: '24px' }} />
                            </div>
                            <Tag color="blue" style={{ borderRadius: '10px' }}>ACTIF</Tag>
                        </div>
                        <Statistic title="Rendez-vous" value={appointments.filter(a => a.status === 'confirmed').length} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={{ borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-md)' }} bodyStyle={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div style={{ width: '48px', height: '48px', background: '#fef2f2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                                <FilePdfOutlined style={{ fontSize: '24px' }} />
                            </div>
                            <Tag color="error" style={{ borderRadius: '10px' }}>PDF</Tag>
                        </div>
                        <Statistic title="Documents" value={documents.length} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={{ borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-md)' }} bodyStyle={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div style={{ width: '48px', height: '48px', background: '#f0fdf4', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
                                <HistoryOutlined style={{ fontSize: '24px' }} />
                            </div>
                            <Tag color="success" style={{ borderRadius: '10px' }}>TERMINÉ</Tag>
                        </div>
                        <Statistic title="Consultations" value={medicalRecords.length} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={{ borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-md)' }} bodyStyle={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div style={{ width: '48px', height: '48px', background: '#fdf2f8', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ec4899' }}>
                                <HeartOutlined style={{ fontSize: '24px' }} />
                            </div>
                            <Tag color="magenta" style={{ borderRadius: '10px' }}>95%</Tag>
                        </div>
                        <Statistic title="Vitalité" value="Excellente" />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    {/* Main Workspace: Appointments & History */}
                    <div className="glass-panel" style={{ padding: '2.5rem', background: 'white', marginBottom: '2rem', border: 'none', boxShadow: 'var(--shadow-lg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.5rem', color: '#0f172a', margin: 0, fontWeight: '800' }}>Rendez-vous à venir</h3>
                                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Gérez vos prochaines consultations</p>
                            </div>
                            <Button 
                                type="text" 
                                icon={<ArrowRightOutlined />} 
                                onClick={() => navigate('/appointments')}
                                style={{ fontWeight: '700', color: 'var(--primary)' }}
                            >
                                Tout voir
                            </Button>
                        </div>
                        
                        <style>{`
                            .rdv-card { background: #f8fafc; border-radius: 20px; padding: 1.25rem; margin-bottom: 1rem; display: flex; gap: 1rem; align-items: flex-start; border: 1px solid #e2e8f0; }
                            .rdv-body { flex: 1; min-width: 0; }
                            .rdv-name { font-size: 1.05rem; font-weight: 700; color: #0f172a; margin: 0 0 4px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                            .rdv-sub { color: var(--text-muted); font-size: 0.875rem; margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                            .rdv-footer { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px; }
                        `}</style>
                        {appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').slice(0, 3).length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Aucun rendez-vous prévu pour le moment.</div>
                        ) : appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').slice(0, 3).map(item => (
                            <div key={item.id} className="rdv-card">
                                <Avatar size={52} style={{ background: 'white', border: '2px solid var(--primary-light)', color: '#1a365d', fontWeight: '800', flexShrink: 0 }}>
                                    {item.doctors?.profiles?.full_name?.charAt(0)}
                                </Avatar>
                                <div className="rdv-body">
                                    <p className="rdv-name">Dr. {item.doctors?.profiles?.full_name}</p>
                                    <p className="rdv-sub">{item.doctors?.specialties?.name} • {dayjs(item.appointment_date).format('DD MMM YYYY')}</p>
                                    <div className="rdv-footer">
                                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#1a365d' }}>{item.appointment_time}</span>
                                        <Tag color={item.status === 'confirmed' ? 'green' : 'orange'} style={{ borderRadius: '20px', padding: '2px 12px', border: 'none', fontWeight: '700', margin: 0 }}>
                                            {item.status === 'confirmed' ? 'Confirmé' : 'À valider'}
                                        </Tag>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Consultation History */}
                        <div style={{ marginTop: '3rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.5rem', color: '#0f172a', margin: 0, fontWeight: '800' }}>Historique Médical</h3>
                                <Tag color="blue" style={{ borderRadius: '10px' }}>{medicalRecords.length} Consultations</Tag>
                            </div>
                            <Timeline
                                mode="left"
                                items={medicalRecords.map(record => ({
                                    label: dayjs(record.created_at).format('DD MMM YYYY'),
                                    children: (
                                        <Card 
                                            style={{ borderRadius: '16px', border: '1px solid #e2e8f0', background: '#fff' }}
                                            bodyStyle={{ padding: '1.5rem' }}
                                        >
                                            <div style={{ fontWeight: '700', color: 'var(--primary)', marginBottom: '10px' }}>
                                                Dr. {record.doctors?.profiles?.full_name}
                                            </div>
                                            <div style={{ marginBottom: '15px' }}>
                                                <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>Diagnostic :</div>
                                                <div style={{ color: '#64748b' }}>{record.diagnosis}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>Traitement & Prescriptions :</div>
                                                <div style={{ color: '#64748b', whiteSpace: 'pre-wrap' }}>{record.treatment}</div>
                                            </div>
                                        </Card>
                                    )
                                }))}
                            />
                            {medicalRecords.length === 0 && (
                                <Empty description="Aucun historique médical disponible pour le moment." />
                            )}
                        </div>
                    </div>
                </Col>

                <Col xs={24} lg={8}>
                    {/* High-End Action Hub */}
                    <Card 
                        style={{ 
                            borderRadius: '30px', 
                            border: 'none', 
                            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
                            color: 'white', 
                            marginBottom: '2rem', 
                            boxShadow: 'var(--shadow-lg)',
                            padding: '1.5rem'
                        }} 
                        styles={{ body: { padding: 0 } }}
                    >
                        <h3 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.4rem', fontWeight: '800' }}>Centre d'Accès</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                            <Button 
                                block 
                                className="btn-luxury"
                                onClick={() => navigate('/my-doctors')} // Navigates to doctor list
                                style={{ 
                                    height: '80px', 
                                    borderRadius: '16px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'flex-start',
                                    gap: '15px',
                                    padding: '0 20px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white'
                                }}
                            >
                                <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <SearchOutlined style={{ fontSize: '20px' }} />
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontWeight: '700', fontSize: '15px' }}>Trouver un Spécialiste</div>
                                    <div style={{ fontSize: '12px', opacity: 0.5 }}>Prendre rendez-vous</div>
                                </div>
                            </Button>
                            
                            <Button 
                                block 
                                style={{ 
                                    height: '80px', 
                                    borderRadius: '16px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'flex-start',
                                    gap: '15px',
                                    padding: '0 20px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: 'white'
                                }}
                            >
                                <div style={{ width: '40px', height: '40px', background: '#ef4444', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FilePdfOutlined style={{ fontSize: '20px' }} />
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontWeight: '700', fontSize: '15px' }}>Ordonnances</div>
                                    <div style={{ fontSize: '12px', opacity: 0.5 }}>Consulter vos prescriptions</div>
                                </div>
                            </Button>
                        </div>
                    </Card>

                    {/* Documents Widget */}
                    <div className="glass-panel" style={{ padding: '2rem', background: 'white', borderRadius: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0, fontWeight: '800' }}>Documents</h3>
                            <Upload showUploadList={false}>
                                <Button type="primary" shape="circle" icon={<PlusOutlined />} size="small" />
                            </Upload>
                        </div>
                        <List
                            dataSource={documents.slice(0, 4)}
                            renderItem={item => (
                                <List.Item style={{ padding: '12px 0', border: 'none' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                                        <div style={{ width: '40px', height: '40px', background: '#fef2f2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                                            <FilePdfOutlined />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{item.file_name || 'Analyse_Sanguine.pdf'}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{dayjs(item.created_at).format('DD MMM YYYY')}</div>
                                        </div>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </div>
                </Col>
            </Row>

            {/* Modals */}
            <Modal
                open={appointmentModalOpen}
                onCancel={() => setAppointmentModalOpen(false)}
                footer={null}
                width="min(600px, 95vw)"
                centered
                bodyStyle={{ padding: '0' }}
                closeIcon={null}
            >
                {/* Re-using specialized component but with proper design injection */}
                <div style={{ padding: '30px' }}>
                    <AppointmentModal closeModal={() => setAppointmentModalOpen(false)} />
                </div>
            </Modal>
        </div>
    );
};

export default Dashboard;