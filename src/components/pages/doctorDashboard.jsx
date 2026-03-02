import React, { useEffect, useState } from "react";
import '../styles/dashboard.css';
import { supabase } from "../../../config/supabase";
import { Button, Tag, Card, Statistic, Row, Col, List, Avatar } from "antd";
import { UserOutlined, CalendarOutlined, SolutionOutlined } from '@ant-design/icons';

const DoctorDashboard = () => {

    const [user, setUser] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [stats, setStats] = useState({
        totalPatients: 0,
        todayAppointments: 0,
        pendingConsultations: 0
    });

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setUser(data.session?.user ?? null);
        });

        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        const fetchDoctorData = async () => {
            if (!user) return;

            // Fetch appointments where doctor_id matches current user's ID
            // Assuming the appointments table has a doctor_id column
            const { data, error } = await supabase
                .from("appointments")
                .select(`
                    id,
                    appointment_date,
                    appointment_time,
                    patient_id
                `)
                .eq('doctor_id', user.id)
                .order('appointment_date', { ascending: true });

            if (error) {
                console.error("Error fetching doctor appointments", error);
            } else {
                setAppointments(data || []);

                // Mock stats for presentation
                setStats({
                    totalPatients: new Set((data || []).map(a => a.patient_id)).size,
                    todayAppointments: (data || []).filter(a => a.appointment_date === new Date().toISOString().split('T')[0]).length,
                    pendingConsultations: (data || []).length
                });
            }
        };

        fetchDoctorData();
    }, [user]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
    };

    return (
        <section id="doctor-dashboard" className="dashboard">
            <div className="container" style={{ paddingTop: '2rem' }}>
                <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="user-info">
                        <Avatar size={64} icon={<UserOutlined />} src={user?.user_metadata?.avatar_url} />
                        <div style={{ marginLeft: '1rem' }}>
                            <h2 style={{ color: '#1a365d' }}>Dr. <span id="userName">{user?.user_metadata?.full_name || 'Chargement...'}</span></h2>
                            <Tag color="blue">{user?.user_metadata?.specialty || 'Médecin'}</Tag>
                            <p style={{ color: '#64748b', marginTop: '0.5rem' }}>{user?.email}</p>
                        </div>
                    </div>
                    <Button type="primary" danger onClick={handleLogout}>Déconnexion</Button>
                </div>

                <Row gutter={[16, 16]} style={{ marginTop: '2rem' }}>
                    <Col xs={24} sm={8}>
                        <Card bordered={false} className="stat-card" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', borderRadius: '15px' }}>
                            <Statistic
                                title="Total Patients"
                                value={stats.totalPatients}
                                prefix={<UserOutlined />}
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card bordered={false} className="stat-card" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', borderRadius: '15px' }}>
                            <Statistic
                                title="Rendez-vous aujourd'hui"
                                value={stats.todayAppointments}
                                prefix={<CalendarOutlined />}
                                valueStyle={{ color: '#cf1322' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card bordered={false} className="stat-card" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', borderRadius: '15px' }}>
                            <Statistic
                                title="Consultations en attente"
                                value={stats.pendingConsultations}
                                prefix={<SolutionOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>

                <div className="dashboard-grid" style={{ marginTop: '2rem' }}>
                    <div className="dashboard-card" style={{ gridColumn: 'span 2', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '1.5rem' }}>
                        <h3 style={{ color: '#1e293b', marginBottom: '1.5rem' }}>Prochains Rendez-vous</h3>
                        <List
                            itemLayout="horizontal"
                            dataSource={appointments}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<Avatar icon={<UserOutlined />} />}
                                        title={<span>Patient ID: {item.patient_id}</span>}
                                        description={`${item.appointment_date} à ${item.appointment_time}`}
                                    />
                                    <Tag color="cyan">Confirmé</Tag>
                                </List.Item>
                            )}
                            locale={{ emptyText: 'Aucun rendez-vous planifié' }}
                        />
                    </div>

                    <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '1.5rem' }}>
                        <h3 style={{ color: '#1e293b', marginBottom: '1.5rem' }}>Infos Cabinet</h3>
                        <p><strong>Adresse:</strong> {user?.user_metadata?.address || 'Non spécifiée'}</p>
                        <p><strong>Expérience:</strong> {user?.user_metadata?.experience || '0'} ans</p>
                        <hr style={{ margin: '1rem 0', opacity: 0.1 }} />
                        <Button type="dashed" block>Modifier mon profil</Button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DoctorDashboard;
