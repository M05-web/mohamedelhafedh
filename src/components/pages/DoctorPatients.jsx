import React, { useEffect, useState } from "react";
import { supabase } from "../../../config/supabase";
import { useAuth } from "../../hooks/useAuth";
import { List, Avatar, Card, Input, Tag, Spin, Empty, Row, Col, Button } from "antd";
import { SearchOutlined, UserOutlined, PhoneOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from "react-router-dom";

const DoctorPatients = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");

    useEffect(() => {
        if (user) fetchPatients();
    }, [user]);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const { data: doctorData } = await supabase.from('doctors').select('id').eq('user_id', user.id).single();
            if (!doctorData) return;

            const { data, error } = await supabase
                .from("appointments")
                .select(`
                    id,
                    patient_id,
                    patients (
                        id,
                        profiles:user_id (full_name, email, phone)
                    )
                `)
                .eq('doctor_id', doctorData.id);

            if (error) throw error;

            // Group by patient and count appointments
            const patientMap = {};
            data.forEach(appt => {
                const p = appt.patients;
                if (!p) return;
                if (!patientMap[p.id]) {
                    patientMap[p.id] = {
                        id: p.id,
                        name: p.profiles?.full_name || 'Inconnu',
                        email: p.profiles?.email,
                        phone: p.profiles?.phone || 'Non renseigné',
                        apptCount: 0
                    };
                }
                patientMap[p.id].apptCount += 1;
            });

            setPatients(Object.values(patientMap));
        } catch (err) {
            console.error("Fetch Patients Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(p => 
        p.name.toLowerCase().includes(searchText.toLowerCase()) || 
        p.email?.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', color: '#1a365d', marginBottom: '0.5rem', fontFamily: 'Outfit' }}>
                        Mes <span style={{ color: 'var(--primary)' }}>Patients</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Consultez la liste et l'historique de vos patients suivis.</p>
                </div>
                <Input 
                    placeholder="Rechercher un patient..." 
                    prefix={<SearchOutlined style={{ color: 'var(--primary)' }} />}
                    style={{ width: '300px', height: '45px', borderRadius: '12px' }}
                    onChange={e => setSearchText(e.target.value)}
                />
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>
            ) : filteredPatients.length > 0 ? (
                <Row gutter={[24, 24]}>
                    {filteredPatients.map(p => (
                        <Col xs={24} md={12} lg={8} key={p.id}>
                            <Card 
                                hoverable
                                style={{ borderRadius: '20px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                                bodyStyle={{ padding: '24px' }}
                            >
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
                                    <Avatar size={64} icon={<UserOutlined />} style={{ background: 'var(--primary-light)', color: 'var(--primary)' }} />
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1a365d' }}>{p.name}</h3>
                                        <Tag color="blue" style={{ marginTop: '5px', borderRadius: '10px' }}>{p.apptCount} RDV au total</Tag>
                                    </div>
                                </div>
                                
                                <div style={{ color: '#64748b', fontSize: '14px' }}>
                                    <div style={{ marginBottom: '10px' }}><PhoneOutlined style={{ marginRight: '10px', color: 'var(--primary)' }} /> {p.phone}</div>
                                    <div style={{ marginBottom: '10px' }}><SearchOutlined style={{ marginRight: '10px', color: 'var(--primary)' }} /> {p.email}</div>
                                </div>
                                
                                <Button 
                                    block 
                                    type="primary" 
                                    ghost 
                                    style={{ marginTop: '15px', borderRadius: '10px', height: '40px' }} 
                                    icon={<CalendarOutlined />}
                                    onClick={() => navigate(`/patient-details/${p.id}`)}
                                >
                                    Voir Détails
                                </Button>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <Empty description="Aucun patient trouvé." style={{ marginTop: '100px' }} />
            )}
        </div>
    );
};

export default DoctorPatients;
