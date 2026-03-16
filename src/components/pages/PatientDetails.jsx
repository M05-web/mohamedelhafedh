import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../config/supabase";
import { 
    Card, Row, Col, Avatar, Tag, List, Timeline, Button, 
    Spin, Divider, Descriptions, Empty 
} from "antd";
import { 
    UserOutlined, 
    ArrowLeftOutlined, 
    CalendarOutlined, 
    PhoneOutlined, 
    MailOutlined,
    MedicineBoxOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const PatientDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchPatientFullData();
    }, [id]);

    const fetchPatientFullData = async () => {
        setLoading(true);
        try {
            // 1. Infos patient & profil
            const { data: patientData, error: patientError } = await supabase
                .from('patients')
                .select('*, profiles:user_id(*)')
                .eq('id', id)
                .single();

            if (patientError) throw patientError;
            setPatient(patientData);

            // 2. Historique des enregistrements médicaux
            const { data: recordsData, error: recordsError } = await supabase
                .from('medical_records')
                .select('*, doctors:doctor_id(profiles:user_id(full_name))')
                .eq('patient_id', id)
                .order('created_at', { ascending: false });

            if (recordsError) throw recordsError;
            setRecords(recordsData || []);

        } catch (err) {
            console.error("Fetch Patient Details Error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;
    if (!patient) return <Empty description="Patient non trouvé" />;

    return (
        <div style={{ padding: '20px' }}>
            <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/doctor-patients')}
                style={{ marginBottom: '20px', borderRadius: '10px' }}
            >
                Retour à la liste
            </Button>

            <Row gutter={[24, 24]}>
                {/* Profile Card */}
                <Col xs={24} lg={8}>
                    <Card style={{ borderRadius: '20px', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <Avatar size={100} icon={<UserOutlined />} style={{ background: 'var(--primary-light)', color: 'var(--primary)' }} />
                            <h2 style={{ marginTop: '15px', marginBottom: '5px' }}>{patient.profiles?.full_name}</h2>
                            <Tag color="blue">{patient.blood_group || 'Groupe sanguin inconnu'}</Tag>
                        </div>
                        
                        <Divider />
                        
                        <Descriptions column={1}>
                            <Descriptions.Item label={<><PhoneOutlined /> Téléphone</>}>{patient.profiles?.phone || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label={<><MailOutlined /> Email</>}>{patient.profiles?.email || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label={<><CalendarOutlined /> Date de Naissance</>}>{patient.date_of_birth ? dayjs(patient.date_of_birth).format('DD/MM/YYYY') : 'N/A'}</Descriptions.Item>
                        </Descriptions>
                        
                        <Divider orientation="left">Données Vitales</Divider>
                        <Descriptions column={1}>
                            <Descriptions.Item label="Allergies">{patient.allergies || 'Aucune'}</Descriptions.Item>
                            <Descriptions.Item label="Maladies Chroniques">{patient.chronic_diseases || 'Aucune'}</Descriptions.Item>
                            <Descriptions.Item label="Contact d'Urgence">{patient.emergency_contact || 'Non renseigné'}</Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>

                {/* Medical History */}
                <Col xs={24} lg={16}>
                    <Card 
                        title={<><MedicineBoxOutlined /> Historique des Consultations</>} 
                        style={{ borderRadius: '20px', boxShadow: 'var(--shadow-md)' }}
                    >
                        {records.length > 0 ? (
                            <Timeline
                                mode="left"
                                items={records.map(record => ({
                                    label: dayjs(record.created_at).format('DD MMM YYYY'),
                                    children: (
                                        <Card type="inner" title={`Consultation par Dr. ${record.doctors?.profiles?.full_name}`} style={{ marginBottom: '10px', borderRadius: '12px' }}>
                                            <div style={{ marginBottom: '10px' }}>
                                                <div style={{ fontWeight: '700', fontSize: '14px' }}><FileTextOutlined /> Diagnostic :</div>
                                                <div style={{ color: '#475569' }}>{record.diagnosis}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '700', fontSize: '14px' }}><MedicineBoxOutlined /> Traitement :</div>
                                                <div style={{ color: '#475569', whiteSpace: 'pre-wrap' }}>{record.treatment}</div>
                                            </div>
                                        </Card>
                                    )
                                }))}
                            />
                        ) : (
                            <Empty description="Aucune consultation enregistrée pour ce patient." />
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default PatientDetails;
