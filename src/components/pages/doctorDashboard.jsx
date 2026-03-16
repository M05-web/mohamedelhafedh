import React, { useEffect, useState } from "react";
import { supabase } from "../../../config/supabase";
import { useAuth } from "../../hooks/useAuth";
import { Button, Tag, Card, Statistic, Row, Col, List, Avatar, Modal, Input, message, Tabs, Progress } from "antd";
import { 
    UserOutlined, 
    CalendarOutlined, 
    SolutionOutlined, 
    CheckCircleOutlined, 
    CloseCircleOutlined, 
    FormOutlined,
    BellOutlined,
    ClockCircleOutlined,
    TeamOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import ScheduleManager from "./scheduleManager";

const { TextArea } = Input;

const DoctorDashboard = () => {
    const { user, signOut } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [stats, setStats] = useState({ totalPatients: 0, todayAppointments: 0, pendingConsultations: 0, completionRate: 85 });
    const [consultationModalOpen, setConsultationModalOpen] = useState(false);
    const [selectedAppt, setSelectedAppt] = useState(null);
    const [diagnosis, setDiagnosis] = useState("");
    const [treatment, setTreatment] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchDoctorData();
        }
    }, [user]);

    const fetchDoctorData = async () => {
        setLoading(true);
        try {
            const { data: doctorData } = await supabase.from('doctors').select('id').eq('user_id', user.id).single();
            if (!doctorData) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("appointments")
                .select(`id, appointment_date, appointment_time, status, reason, patient_id, patients:patient_id (profiles:user_id(full_name))`)
                .eq('doctor_id', doctorData.id)
                .order('appointment_date', { ascending: true });

            if (error) throw error;
            setAppointments(data || []);

            const today = dayjs().format('YYYY-MM-DD');
            setStats({
                totalPatients: new Set((data || []).map(a => a.patient_id)).size,
                todayAppointments: (data || []).filter(a => a.appointment_date === today).length,
                pendingConsultations: (data || []).filter(a => a.status === 'confirmed').length,
                completionRate: 92
            });
        } catch (err) {
            console.error("Doctor Dashboard Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (apptId, newStatus) => {
        const { error } = await supabase.from('appointments').update({ status: newStatus }).eq('id', apptId);
        if (!error) {
            message.success(`Statut mis à jour: ${newStatus}`);
            fetchDoctorData();
        }
    };

    const handleConsultationSubmit = async () => {
        try {
            const { data: doctorData } = await supabase.from('doctors').select('id').eq('user_id', user.id).single();
            await supabase.from('medical_records').insert({
                appointment_id: selectedAppt.id,
                patient_id: selectedAppt.patient_id,
                doctor_id: doctorData.id,
                diagnosis: diagnosis,
                treatment: treatment
            });
            await updateStatus(selectedAppt.id, 'completed');
            message.success("Consultation enregistrée !");
            setConsultationModalOpen(false);
            setDiagnosis("");
            setTreatment("");
        } catch (err) {
            message.error("Erreur lors de l'enregistrement.");
        }
    };

    const DashboardContent = () => (
        <>
            {/* Clinical Analytics */}
            <Row gutter={[24, 24]} style={{ marginBottom: '2.5rem' }}>
                <Col xs={24} sm={12} lg={6}>
                    <div className="glass-panel" style={{ padding: '1.5rem', background: 'white' }}>
                        <Statistic title="Patients Actifs" value={stats.totalPatients} prefix={<TeamOutlined style={{ color: 'var(--primary)' }} />} />
                        <div style={{ marginTop: '10px' }}><Progress percent={80} size="small" showInfo={false} strokeColor="var(--primary)" /></div>
                    </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <div className="glass-panel" style={{ padding: '1.5rem', background: 'white' }}>
                        <Statistic title="RDV Aujourd'hui" value={stats.todayAppointments} prefix={<CalendarOutlined style={{ color: 'var(--secondary)' }} />} />
                        <div style={{ marginTop: '10px' }}><Progress percent={100} size="small" showInfo={false} strokeColor="var(--secondary)" /></div>
                    </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <div className="glass-panel" style={{ padding: '1.5rem', background: 'white' }}>
                        <Statistic title="À Consulter" value={stats.pendingConsultations} prefix={<ClockCircleOutlined style={{ color: '#f59e0b' }} />} />
                        <div style={{ marginTop: '10px' }}><Progress percent={45} size="small" showInfo={false} strokeColor="#f59e0b" /></div>
                    </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <div className="glass-panel" style={{ padding: '1.5rem', background: 'white' }}>
                        <Statistic title="Taux de Complétion" value={stats.completionRate} suffix="%" prefix={<CheckCircleOutlined style={{ color: '#8b5cf6' }} />} />
                        <div style={{ marginTop: '10px' }}><Progress percent={stats.completionRate} size="small" showInfo={false} strokeColor="#8b5cf6" /></div>
                    </div>
                </Col>
            </Row>

            <Card style={{ borderRadius: '20px', border: 'none', boxShadow: 'var(--shadow-md)' }} title={<span style={{ fontFamily: 'Outfit', fontWeight: '700' }}>Flux de Patients & Rendez-vous</span>}>
                <List
                    itemLayout="horizontal"
                    dataSource={appointments}
                    renderItem={item => (
                        <List.Item
                            style={{ padding: '1.5rem', borderRadius: '15px', background: '#f8fafc', marginBottom: '1rem', border: '1px solid transparent' }}
                            actions={[
                                item.status === 'pending' && <Button type="primary" className="btn-premium" ghost size="small" onClick={() => updateStatus(item.id, 'confirmed')}>Confirmer</Button>,
                                item.status === 'confirmed' && <Button type="primary" className="btn-premium" icon={<FormOutlined />} size="small" onClick={() => { setSelectedAppt(item); setConsultationModalOpen(true); }}>Consulter</Button>,
                                item.status === 'pending' && <Button danger ghost className="btn-premium" size="small" onClick={() => updateStatus(item.id, 'cancelled')}>Refuser</Button>
                            ]}
                        >
                            <List.Item.Meta
                                avatar={<Avatar size={48} style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: '700' }}>{item.patients?.profiles?.full_name?.charAt(0)}</Avatar>}
                                title={<span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1a365d' }}>{item.patients?.profiles?.full_name}</span>}
                                description={
                                    <div style={{ display: 'flex', gap: '20px', marginTop: '4px' }}>
                                        <span style={{ color: 'var(--text-muted)' }}><CalendarOutlined /> {dayjs(item.appointment_date).format('DD MMM YYYY')}</span>
                                        <span style={{ color: 'var(--text-muted)' }}><ClockCircleOutlined /> {item.appointment_time}</span>
                                        <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{item.reason || 'Consultation standard'}</span>
                                    </div>
                                }
                            />
                            <Tag color={
                                item.status === 'confirmed' ? 'green' : 
                                item.status === 'completed' ? 'blue' : 
                                item.status === 'cancelled' ? 'red' : 'orange'
                            } style={{ borderRadius: '20px', padding: '4px 16px', border: 'none', fontWeight: '700' }}>
                                {item.status.toUpperCase()}
                            </Tag>
                        </List.Item>
                    )}
                />
            </Card>
        </>
    );

    const items = [
        { key: '1', label: 'Vue Clinique', children: <DashboardContent /> },
        { key: '2', label: 'Gestion du Planning', children: <ScheduleManager /> },
    ];

    return (
        <div style={{ paddingBottom: '4rem' }}>
            <div className="dash-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', color: '#1a365d', marginBottom: '0.5rem', fontFamily: 'Outfit' }}>
                        Cabinet Médical <span style={{ color: 'var(--primary)' }}>Digital</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Gérez vos consultations et votre emploi du temps avec précision.</p>
                </div>
                <div className="dash-header-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <Button icon={<BellOutlined />} style={{ height: '48px', width: '48px', borderRadius: '12px', border: 'none', background: 'white' }} />
                    <Button type="primary" className="btn-premium btn-primary" style={{ height: '48px', borderRadius: '12px' }}>
                        Urgences (0)
                    </Button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px' }}>
                    <Progress type="circle" percent={100} status="active" />
                    <p style={{ marginTop: '20px' }}>Chargement de vos données médicales...</p>
                </div>
            ) : appointments.length === 0 && stats.totalPatients === 0 && !appointments ? (
                <div style={{ textAlign: 'center', padding: '100px', background: 'white', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                    <TeamOutlined style={{ fontSize: '64px', color: 'var(--primary)', marginBottom: '20px' }} />
                    <h2 style={{ fontFamily: 'Outfit' }}>Initialisation de votre Espace Docteur</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Nous n'avons pas trouvé de profil docteur actif pour ce compte. <br/> Cela peut arriver si l'inscription n'a pas été finalisée ou si vous êtes en attente de validation.</p>
                    <Button type="primary" size="large" className="btn-premium" onClick={() => window.location.reload()} style={{ marginTop: '20px' }}>
                        Rafraîchir mon profil
                    </Button>
                </div>
            ) : (
                <>
                    <Tabs defaultActiveKey="1" items={items} className="premium-tabs" />
                </>
            )}

            <Modal
                title={<span style={{ fontFamily: 'Outfit', fontWeight: '700', fontSize: '1.5rem' }}>Dossier de Consultation</span>}
                open={consultationModalOpen}
                onCancel={() => setConsultationModalOpen(false)}
                footer={[
                    <Button key="back" onClick={() => setConsultationModalOpen(false)} style={{ borderRadius: '10px', height: '45px' }}>Annuler</Button>,
                    <Button key="submit" type="primary" onClick={handleConsultationSubmit} className="btn-premium" style={{ borderRadius: '10px', height: '45px' }}>Enregistrer & Fermer</Button>
                ]}
                width="min(800px, 95vw)"
                centered
            >
                <div style={{ padding: '20px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2rem', padding: '15px', background: '#f0f9ff', borderRadius: '15px' }}>
                        <Avatar size={50} src={null} style={{ background: 'var(--primary)' }}>{selectedAppt?.patients?.profiles?.full_name?.charAt(0)}</Avatar>
                        <div>
                            <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{selectedAppt?.patients?.profiles?.full_name}</div>
                            <div style={{ color: 'var(--primary)', fontWeight: '600' }}>#{selectedAppt?.id?.slice(0, 8)}</div>
                        </div>
                    </div>
                    
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: '700', color: '#1e293b' }}>Diagnostic Clinique</label>
                        <TextArea rows={4} placeholder="Saisissez vos observations cliniques..." style={{ borderRadius: '12px', padding: '15px' }} onChange={(e) => setDiagnosis(e.target.value)} />
                    </div>
                    
                    <div>
                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: '700', color: '#1e293b' }}>Prescriptions & Traitement</label>
                        <TextArea rows={6} placeholder="Détaillez le traitement et l'ordonnance..." style={{ borderRadius: '12px', padding: '15px' }} onChange={(e) => setTreatment(e.target.value)} />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default DoctorDashboard;
