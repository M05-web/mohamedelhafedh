import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Table, Tag, Button, Tabs, message, Avatar, List, Progress, Empty, Modal, Form, Input, Select, Popconfirm, DatePicker, TimePicker } from "antd";
import { useSearchParams } from "react-router-dom";
import { 
    TeamOutlined, 
    CalendarOutlined, 
    CheckCircleOutlined, 
    SafetyOutlined, 
    DollarOutlined,
    UserOutlined,
    WarningOutlined,
    NotificationOutlined,
    BarChartOutlined,
    HistoryOutlined,
    SettingOutlined,
    MedicineBoxOutlined,
    LockOutlined,
    InfoCircleOutlined,
    SafetyCertificateOutlined
} from '@ant-design/icons';
import { supabase } from "../../../config/supabase";
import { useAuth } from "../../hooks/useAuth";
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

dayjs.locale('fr');

const AdminDashboard = () => {
    const { signOut } = useAuth();
    const [stats, setStats] = useState({ 
        totalUsers: 0, 
        appointments: 0, 
        revenue: 0, 
        pendingDoctors: 0,
        confirmedAppts: 0,
        cancelledAppts: 0
    });
    const [doctors, setDoctors] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [allPatients, setAllPatients] = useState([]);
    const [allAppointments, setAllAppointments] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [reschedulingAppt, setReschedulingAppt] = useState(null);
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientRecords, setPatientRecords] = useState([]);
    const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
    const [searchParams] = useSearchParams();
    const tabFromUrl = searchParams.get('tab');
    const [activeKey, setActiveKey] = useState("1");

    useEffect(() => {
        const tabMap = {
            'overview': '1',
            'users': '2',
            'doctors': '3',
            'patients': '4',
            'appointments': '5',
            'security': '6',
            'specialties': '7',
            'settings': '8'
        };
        
        if (tabFromUrl && tabMap[tabFromUrl]) {
            setActiveKey(tabMap[tabFromUrl]);
        }
    }, [tabFromUrl]);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const logAction = async (action) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            await supabase.from('audit_logs').insert({
                user_id: user?.id,
                action: action,
                ip_address: 'Client-side Action'
            });
        } catch (err) {
            console.error("Audit Log Error:", err);
        }
    };

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            // 1. Statistiques globales
            const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            
            const { data: apptStats } = await supabase.from('appointments').select('status');
            const apptsTotal = apptStats?.length || 0;
            const confirmed = apptStats?.filter(a => a.status === 'confirmed' || a.status === 'completed').length || 0;
            const cancelled = apptStats?.filter(a => a.status === 'cancelled').length || 0;

            // 2. Tous les Docteurs
            const { data: allDocs } = await supabase
                .from('doctors')
                .select(`*, profiles:user_id(full_name, email, phone), specialties:specialty_id(name)`)
                .order('is_verified', { ascending: true }); // Mettre ceux à vérifier en haut

            const { data: specs } = await supabase.from('specialties').select('*').order('name');

            // 3. Tous les utilisateurs
            const { data: usersData } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            // 4. Tous les Patients
            const { data: patientsData } = await supabase
                .from('patients')
                .select(`*, profiles:user_id(*)`)
                .order('id', { ascending: false });

            // 5. Tous les Rendez-vous
            const { data: apptsData } = await supabase
                .from('appointments')
                .select(`
                    id, 
                    appointment_date, 
                    appointment_time, 
                    status,
                    patients:patient_id(profiles:user_id(full_name)),
                    doctors:doctor_id(profiles:user_id(full_name))
                `)
                .order('appointment_date', { ascending: false });

            // 5. Audit Logs (Réels)
            const { data: logs } = await supabase
                .from('audit_logs')
                .select(`*, profiles:user_id(full_name)`)
                .order('created_at', { ascending: false })
                .limit(20);

            setStats({
                totalUsers: usersCount || 0,
                appointments: apptsTotal,
                confirmedAppts: confirmed,
                cancelledAppts: cancelled,
                revenue: confirmed * 15000,
                pendingDoctors: allDocs?.filter(d => !d.is_verified).length || 0
            });
            
            setDoctors(allDocs || []);
            setSpecialties(specs || []);
            setAllUsers(usersData || []);
            setAllPatients(patientsData || []);
            setAllAppointments(apptsData || []);
            setAuditLogs(logs || []);
            
        } catch (err) {
            console.error("Admin Dashboard Error:", err);
            message.error("Erreur lors de la récupération des données admin.");
        } finally {
            setLoading(false);
        }
    };

    const fetchPatientRecords = async (patientId) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('medical_records')
                .select(`*, doctors:doctor_id(profiles:user_id(full_name)), prescriptions(*)`)
                .eq('patient_id', patientId)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setPatientRecords(data || []);
            setIsRecordModalOpen(true);
        } catch (err) {
            message.error("Erreur dossiers: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleDoctorVerification = async (id, currentStatus) => {
        const { error } = await supabase.from('doctors').update({ is_verified: !currentStatus }).eq('id', id);
        if (!error) {
            message.success(currentStatus ? "Médecin invalidé." : "Médecin vérifié.");
            logAction(`${currentStatus ? 'Invalidation' : 'Vérification'} du médecin ID: ${id}`);
            fetchAdminData();
        }
    };

    const rescheduleAppointment = async (values) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('appointments')
                .update({ 
                    appointment_date: values.date.format('YYYY-MM-DD'),
                    appointment_time: values.time.format('HH:mm'),
                    status: 'confirmed'
                })
                .eq('id', reschedulingAppt.id);
            
            if (error) throw error;
            message.success("Rendez-vous décalé avec succès.");
            logAction(`Report du rendez-vous ID: ${reschedulingAppt.id} au ${values.date.format('DD/MM/YYYY')}`);
            setIsRescheduleModalOpen(false);
            setReschedulingAppt(null);
            fetchAdminData();
        } catch (err) {
            message.error("Erreur report: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const cancelAppointment = async (id) => {
        const { error } = await supabase
            .from('appointments')
            .update({ status: 'cancelled' })
            .eq('id', id);
        
        if (!error) {
            message.success("Rendez-vous annulé.");
            logAction(`Annulation du rendez-vous ID: ${id}`);
            fetchAdminData();
        } else {
            message.error("Erreur annulation: " + error.message);
        }
    };

    const addSpecialty = async (name) => {
        if (!name) return;
        const { error } = await supabase.from('specialties').insert([{ name }]);
        if (error) {
            message.error("Erreur: " + error.message);
        } else {
            message.success("Spécialité ajoutée.");
            logAction(`Ajout de la spécialité: ${name}`);
            fetchAdminData();
        }
    };

    const deleteSpecialty = async (id) => {
        const { error } = await supabase.from('specialties').delete().eq('id', id);
        if (error) {
            message.error("Impossible de supprimer : cette spécialité est probablement déjà utilisée par des médecins.");
        } else {
            message.success("Spécialité supprimée.");
            logAction(`Suppression de la spécialité ID: ${id}`);
            fetchAdminData();
        }
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_active: !currentStatus })
                .eq('id', userId);
            
            if (error) throw error;
            message.success(`Utilisateur ${!currentStatus ? 'activé' : 'suspendu'}.`);
            logAction(`${!currentStatus ? 'Activation' : 'Suspension'} de l'utilisateur ID: ${userId}`);
            fetchAdminData();
        } catch (err) {
            message.error("Erreur statut: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (userId) => {
        setLoading(true);
        try {
            // Note: Cascade delete should handle profile/patient/doctor relations
            const { error } = await supabase.from('profiles').delete().eq('id', userId);
            if (error) throw error;
            message.success("Utilisateur supprimé.");
            logAction(`Suppression définitive de l'utilisateur ID: ${userId}`);
            fetchAdminData();
        } catch (err) {
            message.error("Erreur suppression: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Colonnes pour la Validation des Docteurs
    const doctorColumns = [
        { 
            title: 'Spécialiste', 
            key: 'name',
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Avatar style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                        {record.profiles?.full_name?.charAt(0) || '?'}
                    </Avatar>
                    <div>
                        <div style={{ fontWeight: '600' }}>{record.profiles?.full_name || 'Inconnu'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{record.profiles?.email}</div>
                    </div>
                </div>
            )
        },
        { title: 'Spécialité', dataIndex: ['specialties', 'name'], key: 'specialty', render: (s) => <Tag color="blue">{s || 'Généraliste'}</Tag> },
        { title: 'Hôpital', dataIndex: 'hospital', key: 'hospital' },
        { title: 'Expérience', dataIndex: 'experience_years', key: 'exp', render: (exp) => <Tag>{exp || 0} ans</Tag> },
        { 
            title: 'Statut', 
            dataIndex: 'is_verified', 
            key: 'verified',
            render: (v) => <Tag color={v ? 'green' : 'gold'}>{v ? 'VÉRIFIÉ' : 'EN ATTENTE'}</Tag>
        },
        { 
            title: 'Action', 
            key: 'action',
            render: (_, record) => (
                <Button 
                    type={record.is_verified ? "default" : "primary"} 
                    size="small" 
                    className={record.is_verified ? "" : "btn-premium"}
                    icon={record.is_verified ? <WarningOutlined /> : <CheckCircleOutlined />} 
                    onClick={() => toggleDoctorVerification(record.id, record.is_verified)}
                >
                    {record.is_verified ? 'Invalider' : 'Approuver'}
                </Button>
            )
        }
    ];

    // Colonnes pour la Gestion des Utilisateurs
    const userColumns = [
        {
            title: 'Utilisateur',
            key: 'user',
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Avatar style={{ background: record.role === 'admin' ? '#ef4444' : 'var(--primary-light)', color: 'white' }}>{record.full_name?.charAt(0)}</Avatar>
                    <div>
                        <div style={{ fontWeight: '600' }}>{record.full_name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{record.email}</div>
                    </div>
                </div>
            )
        },
        { 
            title: 'Rôle', 
            dataIndex: 'role', 
            key: 'role',
            render: (role) => (
                <Tag color={role === 'admin' ? 'red' : role === 'doctor' ? 'blue' : 'green'}>
                    {role?.toUpperCase()}
                </Tag>
            )
        },
        { 
            title: 'Statut', 
            dataIndex: 'is_active', 
            key: 'status',
            render: (isActive, record) => (
                <Tag color={isActive ? 'green' : 'red'} style={{ cursor: 'pointer' }} onClick={() => toggleUserStatus(record.id, isActive)}>
                    {isActive ? 'ACTIF' : 'SUSPENDU'}
                </Tag>
            )
        },
        { title: 'Téléphone', dataIndex: 'phone', key: 'phone', render: (p) => p || '--' },
        { title: 'Inscription', dataIndex: 'created_at', key: 'date', render: (d) => dayjs(d).format('DD/MM/YYYY') },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button 
                        size="small" 
                        icon={record.is_active === false ? <CheckCircleOutlined /> : <WarningOutlined />} 
                        danger={record.is_active !== false}
                        onClick={() => toggleUserStatus(record.id, record.is_active)}
                    >
                        {record.is_active === false ? 'Réactiver' : 'Suspendre'}
                    </Button>
                    <Button 
                        size="small" 
                        icon={<SettingOutlined />} 
                        onClick={() => {
                            setEditingUser(record);
                            setIsUserModalOpen(true);
                        }}
                    >
                        Modifier
                    </Button>
                    <Popconfirm
                        title="Supprimer l'utilisateur ?"
                        description="Cette action est irréversible et supprimera tout son historique."
                        onConfirm={() => deleteUser(record.id)}
                        okText="Supprimer"
                        cancelText="Annuler"
                        okButtonProps={{ danger: true }}
                    >
                        <Button size="small" danger icon={<WarningOutlined />}>
                            Supprimer
                        </Button>
                    </Popconfirm>
                </div>
            )
        }
    ];

    const Overview = () => (
        <>
            <Row gutter={[24, 24]} style={{ marginBottom: '2.5rem' }}>
                <Col xs={24} sm={12} lg={6}>
                    <div className="glass-panel" style={{ padding: '1.5rem', background: 'white' }}>
                        <Statistic title="Total Inscrits" value={stats.totalUsers} prefix={<TeamOutlined style={{ color: 'var(--primary)' }} />} />
                        <div style={{ marginTop: '10px' }}>
                            <small style={{ color: 'var(--text-muted)' }}>Mise à jour réelle</small>
                        </div>
                    </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <div className="glass-panel" style={{ padding: '1.5rem', background: 'white' }}>
                        <Statistic title="RDV Confirmés" value={stats.confirmedAppts} prefix={<CheckCircleOutlined style={{ color: 'var(--secondary)' }} />} />
                        <div style={{ marginTop: '10px' }}>
                            <Progress percent={stats.appointments > 0 ? (stats.confirmedAppts / stats.appointments) * 100 : 0} size="small" showInfo={false} strokeColor="var(--secondary)" />
                        </div>
                    </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <div className="glass-panel" style={{ padding: '1.5rem', background: 'white' }}>
                        <Statistic title="Volume d'Activité" value={stats.appointments} prefix={<CalendarOutlined style={{ color: '#f59e0b' }} />} />
                        <div style={{ marginTop: '10px' }}>
                            <small style={{ color: 'var(--text-muted)' }}>Total des RDV créés</small>
                        </div>
                    </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <div className="glass-panel" style={{ padding: '1.5rem', background: 'white' }}>
                        <Statistic title="Médecins en attente" value={stats.pendingDoctors} prefix={<SafetyOutlined style={{ color: '#ef4444' }} />} />
                        <div style={{ marginTop: '10px' }}>
                            <Tag color={stats.pendingDoctors > 0 ? 'red' : 'green'}>
                                {stats.pendingDoctors > 0 ? 'Action requise' : 'À jour'}
                            </Tag>
                        </div>
                    </div>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    <Card style={{ borderRadius: '20px', border: 'none', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }} title={<><BarChartOutlined /> Historique d'Audit (Activités Réelles)</>}>
                        {auditLogs.length > 0 ? (
                            <Table 
                                scroll={{ x: 600 }}
                                columns={[
                                    { title: 'Date', dataIndex: 'created_at', key: 'date', width: 150, render: (d) => dayjs(d).format('DD MMMM HH:mm') },
                                    { title: 'Utilisateur', key: 'user', width: 150, render: (_, record) => record.profiles?.full_name || 'Système' },
                                    { title: 'Action', dataIndex: 'action', key: 'action', render: (a) => <Tag color="blue">{a}</Tag> },
                                    { title: 'IP', dataIndex: 'ip_address', key: 'ip', width: 100, render: (ip) => <small>{ip || 'Local'}</small> }
                                ]} 
                                dataSource={auditLogs} 
                                pagination={{ pageSize: 5 }}
                            />
                        ) : (
                            <Empty description="Aucun log d'audit trouvé." />
                        )}
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <div className="glass-panel" style={{ padding: '2rem', background: 'white', height: '100%' }}>
                        <h3 style={{ fontSize: '1.25rem', color: '#1a365d', marginBottom: '1.5rem' }}><HistoryOutlined /> Journal Rapide</h3>
                        <List
                            dataSource={allUsers.slice(0, 6)}
                            renderItem={item => (
                                <List.Item style={{ padding: '12px 0' }}>
                                    <List.Item.Meta
                                        avatar={<Avatar size="small" style={{ background: 'var(--primary)' }}>{item.full_name?.charAt(0)}</Avatar>}
                                        title={<span style={{ fontWeight: '600' }}>{item.full_name}</span>}
                                        description={`Inscrit le ${dayjs(item.created_at).format('DD/MM')}`}
                                    />
                                </List.Item>
                            )}
                        />
                    </div>
                </Col>
            </Row>
        </>
    );

    const SpecialtyManager = () => {
        const [newSpec, setNewSpec] = useState("");
        return (
            <div className="glass-panel" style={{ padding: '2rem', background: 'white' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#1a365d', marginBottom: '1.5rem' }}>
                    <MedicineBoxOutlined /> Gestion des Spécialités
                </h3>
                
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <Input 
                        placeholder="Ex: Neurologie" 
                        value={newSpec} 
                        onChange={e => setNewSpec(e.target.value)}
                        onPressEnter={() => {
                            addSpecialty(newSpec);
                            setNewSpec("");
                        }}
                    />
                    <Button type="primary" onClick={() => {
                        addSpecialty(newSpec);
                        setNewSpec("");
                    }}>
                        Ajouter
                    </Button>
                </div>

                <List
                    dataSource={specialties}
                    renderItem={item => (
                        <List.Item
                            actions={[
                                <Popconfirm
                                    title="Supprimer cette spécialité ?"
                                    onConfirm={() => deleteSpecialty(item.id)}
                                >
                                    <Button type="link" danger>Supprimer</Button>
                                </Popconfirm>
                            ]}
                        >
                            <span style={{ fontWeight: '500' }}>{item.name}</span>
                        </List.Item>
                    )}
                />
            </div>
        );
    };

    const PatientManager = () => {
        const columns = [
            {
                title: 'Patient',
                key: 'patient',
                render: (_, record) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Avatar style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                            {record.profiles?.full_name?.charAt(0) || 'P'}
                        </Avatar>
                        <div>
                            <div style={{ fontWeight: '600' }}>{record.profiles?.full_name || 'Patient'}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{record.profiles?.email}</div>
                        </div>
                    </div>
                )
            },
            { title: 'Date de naissance', dataIndex: 'date_of_birth', key: 'dob', render: (d) => d ? dayjs(d).format('DD/MM/YYYY') : '--' },
            { title: 'Groupe Sanguin', dataIndex: 'blood_group', key: 'blood', render: (b) => <Tag color="volcano">{b || 'Inconnu'}</Tag> },
            { title: 'Allergies', dataIndex: 'allergies', key: 'allergies', render: (a) => a ? <Tag color="warning">{a}</Tag> : 'Aucune' },
            { 
                title: 'Actions', 
                key: 'actions',
                render: (_, record) => (
                    <Button 
                        size="small" 
                        icon={<HistoryOutlined />}
                        onClick={() => {
                            setSelectedPatient(record);
                            fetchPatientRecords(record.id);
                        }}
                    >
                        Dossier
                    </Button>
                )
            }
        ];

        return (
            <div className="glass-panel" style={{ padding: '2rem', background: 'white' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#1a365d', marginBottom: '1.5rem' }}>
                    <TeamOutlined /> Liste des Patients
                </h3>
                <Table columns={columns} dataSource={allPatients} rowKey="id" pagination={{ pageSize: 8 }} scroll={{ x: 800 }} />
            </div>
        );
    };

    const AppointmentManager = () => {
        const columns = [
            { 
                title: 'Date & Heure', 
                key: 'datetime',
                render: (_, record) => (
                    <div>
                        <div style={{ fontWeight: '600' }}>{dayjs(record.appointment_date).format('DD MMMM YYYY')}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{record.appointment_time}</div>
                    </div>
                )
            },
            { title: 'Patient', key: 'patient', render: (_, record) => record.patients?.profiles?.full_name || '--' },
            { title: 'Docteur', key: 'doctor', render: (_, record) => record.doctors?.profiles?.full_name || '--' },
            { 
                title: 'Statut', 
                dataIndex: 'status', 
                key: 'status',
                render: (status) => (
                    <Tag color={status === 'confirmed' ? 'green' : status === 'pending' ? 'gold' : 'red'}>
                        {status?.toUpperCase()}
                    </Tag>
                )
            },
            { 
                title: 'Actions', 
                key: 'actions',
                render: (_, record) => (
                    record.status !== 'cancelled' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Button 
                                size="small" 
                                icon={<HistoryOutlined />} 
                                onClick={() => {
                                    setReschedulingAppt(record);
                                    setIsRescheduleModalOpen(true);
                                }}
                            >
                                Reporter
                            </Button>
                            <Popconfirm
                                title="Annuler ce rendez-vous ?"
                                onConfirm={() => cancelAppointment(record.id)}
                                okText="Oui"
                                cancelText="Non"
                                okButtonProps={{ danger: true }}
                            >
                                <Button size="small" danger icon={<WarningOutlined />}>Annuler</Button>
                            </Popconfirm>
                        </div>
                    )
                )
            }
        ];

        return (
            <div className="glass-panel" style={{ padding: '2rem', background: 'white' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#1a365d', marginBottom: '1.5rem' }}>
                    <CalendarOutlined /> Gestion Globale des Rendez-vous
                </h3>
                <Table columns={columns} dataSource={allAppointments} rowKey="id" pagination={{ pageSize: 8 }} scroll={{ x: 800 }} />
            </div>
        );
    };

    const AuditLogsManager = () => {
        const columns = [
            { 
                title: 'Date', 
                dataIndex: 'created_at', 
                key: 'date', 
                render: (d) => dayjs(d).format('DD/MM/YYYY HH:mm:ss') 
            },
            { title: 'Utilisateur', key: 'user', render: (_, record) => record.profiles?.full_name || 'Système' },
            { 
                title: 'Action', 
                dataIndex: 'action', 
                key: 'action',
                render: (action) => <Tag color={action.includes('Supprim') ? 'red' : 'blue'}>{action}</Tag>
            },
            { title: 'Adresse IP', dataIndex: 'ip_address', key: 'ip' },
        ];

        return (
            <div className="glass-panel" style={{ padding: '2rem', background: 'white' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#1a365d', marginBottom: '1.5rem' }}>
                    <SafetyCertificateOutlined /> Journaux d'Audit Sécurisés
                </h3>
                <Table columns={columns} dataSource={auditLogs} rowKey="id" pagination={{ pageSize: 10 }} scroll={{ x: 800 }} />
            </div>
        );
    };

    const SystemSettings = () => {
        const [maintenance, setMaintenance] = useState(false);
        
        return (
            <div className="glass-panel" style={{ padding: '2rem', background: 'white' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#1a365d', marginBottom: '1.5rem' }}>
                    <SettingOutlined /> Configuration de la Plateforme
                </h3>
                
                <Row gutter={[24, 24]}>
                    <Col xs={24} md={12}>
                        <Card title="Maintenance & Accès" size="small" style={{ borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <div>
                                    <div style={{ fontWeight: '600' }}>Mode Maintenance</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Empêche les nouvelles connexions</div>
                                </div>
                                <Button 
                                    danger={!maintenance} 
                                    type={maintenance ? "primary" : "default"}
                                    onClick={() => {
                                        setMaintenance(!maintenance);
                                        message.warning(maintenance ? "Mode maintenance désactivé." : "Le site est maintenant en maintenance.");
                                    }}
                                >
                                    {maintenance ? "Désactiver" : "Activer"}
                                </Button>
                            </div>
                            <Progress percent={maintenance ? 100 : 0} status={maintenance ? "exception" : "active"} showInfo={false} />
                        </Card>
                    </Col>
                    
                    <Col xs={24} md={12}>
                        <Card title="Informations Système" size="small" style={{ borderRadius: '12px' }}>
                            <p><b>Version :</b> 2.4.0-build.2026</p>
                            <p><b>Base de données :</b> Supabase PostgreSQL</p>
                            <p><b>Statut Serveur :</b> <Tag color="green">Opérationnel</Tag></p>
                            <Button type="link" icon={<InfoCircleOutlined />}>Voir les logs techniques</Button>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    };

    const items = [
        { key: '1', label: 'Tableau de Bord', children: <Overview /> },
        { 
            key: '2', 
            label: 'Utilisateurs', 
            children: (
                <>
                    <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <Button 
                            type="primary" 
                            className="btn-premium" 
                            icon={<TeamOutlined />} 
                            onClick={() => setIsUserModalOpen(true)}
                        >
                            Ajouter un Utilisateur
                        </Button>
                    </div>
                    <Table columns={userColumns} dataSource={allUsers} rowKey="id" pagination={{ pageSize: 8 }} scroll={{ x: 800 }} />
                </>
            )
        },
        { key: '3', label: 'Médecins', children: <Table columns={doctorColumns} dataSource={doctors} rowKey="id" pagination={{ pageSize: 8 }} scroll={{ x: 800 }} /> },
        { key: '4', label: 'Patients', children: <PatientManager /> },
        { key: '5', label: 'Rendez-vous', children: <AppointmentManager /> },
        { key: '6', label: 'Sécurité', children: <AuditLogsManager /> },
        { key: '7', label: 'Spécialités', children: <SpecialtyManager /> },
        { key: '8', label: 'Paramètres', children: <SystemSettings /> },
    ];

    return (
        <div style={{ padding: '0 24px 4rem 24px', maxWidth: '1400px', margin: '0 auto', overflowX: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', color: '#1a365d', marginBottom: '0.5rem', fontFamily: 'Outfit' }}>
                        Portail <span style={{ color: 'var(--primary)' }}>Administrateur</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Gérez les utilisateurs, validez les médecins et surveillez l'activité.</p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <Button 
                        icon={<HistoryOutlined />} 
                        onClick={fetchAdminData}
                        loading={loading}
                        style={{ height: '48px', borderRadius: '12px', border: 'none', background: 'white', boxShadow: 'var(--shadow-sm)' }}
                    >
                        Actualiser
                    </Button>
                    <Button 
                        type="primary" 
                        className="btn-premium" 
                        icon={<NotificationOutlined />}
                        style={{ height: '48px', borderRadius: '12px' }}
                        onClick={() => setActiveKey("6")}
                    >
                        Rapport d'Audit
                    </Button>
                </div>
            </div>

            <Tabs 
                activeKey={activeKey} 
                onChange={setActiveKey} 
                items={items} 
                className="premium-tabs" 
            />

            {/* Modal pour Reprogrammer un RDV */}
            <Modal
                title="Reporter le Rendez-vous"
                open={isRescheduleModalOpen}
                onCancel={() => {
                    setIsRescheduleModalOpen(false);
                    setReschedulingAppt(null);
                }}
                footer={null}
                centered
                destroyOnClose
            >
                <Form layout="vertical" onFinish={rescheduleAppointment} style={{ marginTop: '20px' }}>
                    <p>Reporter pour le patient : <b>{reschedulingAppt?.patients?.profiles?.full_name}</b></p>
                    <Form.Item name="date" label="Nouvelle Date" rules={[{ required: true }]}>
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="time" label="Nouvelle Heure" rules={[{ required: true }]}>
                        <TimePicker format="HH:mm" style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item style={{ textAlign: 'right', marginTop: '30px' }}>
                        <Button onClick={() => setIsRescheduleModalOpen(false)} style={{ marginRight: '8px' }}>
                            Annuler
                        </Button>
                        <Button type="primary" htmlType="submit">
                            Confirmer le report
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal Dossier Médical */}
            <Modal
                title={`Dossier Médical - ${selectedPatient?.profiles?.full_name}`}
                open={isRecordModalOpen}
                onCancel={() => {
                    setIsRecordModalOpen(false);
                    setPatientRecords([]);
                    setSelectedPatient(null);
                }}
                footer={null}
                width="min(800px, 95vw)"
                centered
                destroyOnClose
            >
                <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '10px' }}>
                    <List
                        dataSource={patientRecords}
                        renderItem={record => (
                            <Card 
                                size="small" 
                                style={{ marginBottom: '16px', borderRadius: '12px' }}
                                title={<div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>🩺 {record.diagnosis}</span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{dayjs(record.created_at).format('DD/MM/YYYY')}</span>
                                </div>}
                            >
                                <p><b>Médecin :</b> Dr. {record.doctors?.profiles?.full_name}</p>
                                <p><b>Traitement :</b> {record.treatment}</p>
                                {record.notes && <p><b>Notes :</b> {record.notes}</p>}
                                
                                {record.prescriptions && record.prescriptions.length > 0 && (
                                    <div style={{ marginTop: '12px', background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                                        <div style={{ fontWeight: '600', marginBottom: '4px', fontSize: '12px' }}>💊 Prescriptions :</div>
                                        {record.prescriptions.map((p, idx) => (
                                            <div key={idx} style={{ fontSize: '12px' }}>
                                                • {p.medication} ({p.dosage}) - <i style={{ color: 'var(--text-muted)' }}>{p.instructions}</i>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        )}
                        locale={{ emptyText: "Aucun historique médical trouvé pour ce patient." }}
                    />
                </div>
            </Modal>

            {/* Modal pour Ajouter/Modifier un utilisateur */}
            <Modal
                title={editingUser ? "Modifier l'Utilisateur" : "Ajouter un Nouvel Utilisateur"}
                open={isUserModalOpen}
                onCancel={() => {
                    setIsUserModalOpen(false);
                    setEditingUser(null);
                }}
                footer={null}
                width="min(500px, 95vw)"
                centered
                destroyOnClose
            >
                <Form
                    layout="vertical"
                    initialValues={editingUser || { role: 'patient' }}
                    onFinish={async (values) => {
                        setLoading(true);
                        try {
                            if (editingUser) {
                                // Modification
                                const { error } = await supabase
                                    .from('profiles')
                                    .update({
                                        full_name: values.full_name,
                                        role: values.role
                                    })
                                    .eq('id', editingUser.id);
                                
                                if (error) throw error;
                                message.success("Utilisateur mis à jour.");
                                logAction(`Modification de l'utilisateur ID: ${editingUser.id} (${values.role})`);
                            } else {
                                // Inscription Auth
                                const { data: authData, error: authError } = await supabase.auth.signUp({
                                    email: values.email,
                                    password: values.password,
                                    options: {
                                        data: { full_name: values.full_name }
                                    }
                                });

                                if (authError) throw authError;

                                // Création/Maj du profil
                                const { error: profileError } = await supabase
                                    .from('profiles')
                                    .upsert({
                                        id: authData.user.id,
                                        full_name: values.full_name,
                                        email: values.email,
                                        role: values.role
                                    });

                                if (profileError) throw profileError;
                                message.success("Utilisateur créé avec succès !");
                                logAction(`Création de l'utilisateur: ${values.email} (${values.role})`);
                            }
                            setIsUserModalOpen(false);
                            setEditingUser(null);
                        } catch (err) {
                            message.error(err.message || "Erreur lors de l'opération.");
                        } finally {
                            fetchAdminData();
                        }
                    }}
                    style={{ marginTop: '20px' }}
                >
                    <Form.Item
                        name="full_name"
                        label="Nom Complet"
                        rules={[{ required: true, message: 'Veuillez saisir le nom' }]}
                    >
                        <Input placeholder="Jean Dupont" />
                    </Form.Item>

                    {!editingUser && (
                        <>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[{ required: true, type: 'email', message: 'Email invalide' }]}
                            >
                                <Input placeholder="jean@exemple.com" />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                label="Mot de passe"
                                rules={[{ required: true, min: 6, message: 'Minimum 6 caractères' }]}
                            >
                                <Input.Password placeholder="******" />
                            </Form.Item>
                        </>
                    )}

                    <Form.Item
                        name="role"
                        label="Rôle"
                        rules={[{ required: true }]}
                    >
                        <Select disabled={editingUser?.role === 'admin'}>
                            <Select.Option value="patient">Patient</Select.Option>
                            <Select.Option value="doctor">Docteur</Select.Option>
                            <Select.Option value="admin">Administrateur</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: '30px' }}>
                        <Button style={{ marginRight: '8px' }} onClick={() => {
                            setIsUserModalOpen(false);
                            setEditingUser(null);
                        }}>
                            Annuler
                        </Button>
                        <Button type="primary" htmlType="submit" className="btn-premium">
                            {editingUser ? "Sauvegarder" : "Créer le compte"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminDashboard;
