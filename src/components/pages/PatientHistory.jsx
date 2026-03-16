import React, { useEffect, useState } from "react";
import { supabase } from "../../../config/supabase";
import { useAuth } from "../../hooks/useAuth";
import { 
    Card, 
    Timeline, 
    Spin, 
    Empty, 
    Tag, 
    Typography, 
    Button,
    Divider
} from "antd";
import { 
    HistoryOutlined, 
    ArrowLeftOutlined,
    MedicineBoxOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const PatientHistory = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchHistory();
        }
    }, [user]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const { data: patientData } = await supabase
                .from('patients')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (!patientData) return;

            const { data, error } = await supabase
                .from('medical_records')
                .select(`
                    id, 
                    diagnosis, 
                    treatment, 
                    doctor_id, 
                    created_at, 
                    doctors:doctor_id(
                        profiles:user_id(full_name),
                        specialties:specialty_id(name)
                    )
                `)
                .eq('patient_id', patientData.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMedicalRecords(data || []);
        } catch (err) {
            console.error("History Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;

    return (
        <div style={{ padding: '20px', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <Button 
                        icon={<ArrowLeftOutlined />} 
                        onClick={() => navigate('/dashboard')}
                        style={{ marginBottom: '1rem', borderRadius: '10px' }}
                    >
                        Retour
                    </Button>
                    <Title level={2} style={{ margin: 0, fontFamily: 'Outfit', fontWeight: '800' }}>
                        <HistoryOutlined style={{ marginRight: '10px', color: 'var(--primary)' }} />
                        Mon Historique Médical
                    </Title>
                    <Text type="secondary">Retrouvez tous vos diagnostics et traitements passés</Text>
                </div>
                <Tag color="blue" style={{ borderRadius: '10px', padding: '5px 15px', fontSize: '14px', fontWeight: '700' }}>
                    {medicalRecords.length} Consultations
                </Tag>
            </div>

            <Card style={{ borderRadius: '30px', boxShadow: 'var(--shadow-lg)', border: 'none', padding: '20px' }}>
                {medicalRecords.length > 0 ? (
                    <Timeline
                        mode="left"
                        items={medicalRecords.map(record => ({
                            label: (
                                <div style={{ paddingRight: '20px' }}>
                                    <div style={{ fontWeight: '800', color: '#1e293b' }}>{dayjs(record.created_at).format('DD MMMM YYYY')}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{dayjs(record.created_at).format('HH:mm')}</div>
                                </div>
                            ),
                            children: (
                                <Card 
                                    hoverable
                                    style={{ 
                                        borderRadius: '20px', 
                                        border: '1px solid #e2e8f0', 
                                        background: '#f8fafc',
                                        marginBottom: '20px'
                                    }}
                                    bodyStyle={{ padding: '24px' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                        <div>
                                            <div style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '1.1rem' }}>
                                                Dr. {record.doctors?.profiles?.full_name}
                                            </div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                {record.doctors?.specialties?.name}
                                            </div>
                                        </div>
                                        <MedicineBoxOutlined style={{ fontSize: '24px', color: 'var(--primary)', opacity: 0.5 }} />
                                    </div>
                                    
                                    <Divider style={{ margin: '15px 0' }} />
                                    
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            <FileTextOutlined style={{ color: 'var(--primary)' }} />
                                            Diagnostic :
                                        </div>
                                        <div style={{ color: '#475569', lineHeight: '1.6', background: 'white', padding: '12px', borderRadius: '12px', border: '1px solid #eef2f6' }}>
                                            {record.diagnosis || "Aucun diagnostic renseigné"}
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            <MedicineBoxOutlined style={{ color: 'var(--primary)' }} />
                                            Traitement & Prescriptions :
                                        </div>
                                        <div style={{ color: '#475569', lineHeight: '1.6', whiteSpace: 'pre-wrap', background: 'white', padding: '12px', borderRadius: '12px', border: '1px solid #eef2f6' }}>
                                            {record.treatment || "Aucun traitement renseigné"}
                                        </div>
                                    </div>
                                </Card>
                            )
                        }))}
                    />
                ) : (
                    <Empty 
                        image={Empty.PRESENTED_IMAGE_SIMPLE} 
                        description={
                            <div style={{ textAlign: 'center' }}>
                                <Title level={4}>Aucune consultation trouvée</Title>
                                <Text type="secondary">Vos futurs historiques de consultations apparaîtront ici.</Text>
                            </div>
                        } 
                    />
                )}
            </Card>
        </div>
    );
};

export default PatientHistory;
