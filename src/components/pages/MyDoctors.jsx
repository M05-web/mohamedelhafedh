import React, { useEffect, useState } from 'react';
import { supabase } from '../../../config/supabase';
import { 
    Input, 
    Card, 
    Row, 
    Col, 
    Tag, 
    Avatar, 
    Skeleton, 
    Empty, 
    Badge,
    Tooltip,
    Modal,
    Button
} from 'antd';
import AppointmentModal from './appointmentModal';
import { 
    SearchOutlined, 
    MedicineBoxOutlined, 
    EnvironmentOutlined, 
    StarFilled,
    InfoCircleOutlined
} from '@ant-design/icons';

const MyDoctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const [activeDoctorId, setActiveDoctorId] = useState(null);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            // Join doctors with profiles and specialties
            const { data, error } = await supabase
                .from('doctors')
                .select(`
                    id,
                    biography,
                    hospital,
                    experience_years,
                    consultation_fee,
                    profiles:user_id (full_name, email),
                    specialties:specialty_id (name)
                `);

            if (error) throw error;
            setDoctors(data || []);
            setFilteredDoctors(data || []);
        } catch (err) {
            console.error("Error fetching doctors:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
        const filtered = doctors.filter(doc => 
            doc.profiles?.full_name?.toLowerCase().includes(query) ||
            doc.specialties?.name?.toLowerCase().includes(query) ||
            doc.hospital?.toLowerCase().includes(query)
        );
        setFilteredDoctors(filtered);
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', fontFamily: 'Outfit', fontWeight: '800', color: '#1a365d', marginBottom: '10px' }}>
                    Nos <span style={{ color: 'var(--primary)' }}>Médecins</span>
                </h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
                    Trouvez le spécialiste adapté à vos besoins parmi nos praticiens certifiés.
                </p>
                
                <div style={{ maxWidth: '600px', marginTop: '25px' }}>
                    <Input 
                        prefix={<SearchOutlined style={{ color: 'var(--primary)' }} />} 
                        placeholder="Rechercher par nom, spécialité ou hôpital..." 
                        size="large"
                        value={searchQuery}
                        onChange={handleSearch}
                        style={{ 
                            borderRadius: '16px', 
                            padding: '12px 20px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                            border: '1px solid rgba(0,0,0,0.05)'
                        }}
                    />
                </div>
            </div>

            {loading ? (
                <Row gutter={[24, 24]}>
                    {[1, 2, 3, 4].map(i => (
                        <Col xs={24} sm={12} lg={8} xl={6} key={i}>
                            <Card style={{ borderRadius: '24px' }}>
                                <Skeleton active avatar paragraph={{ rows: 3 }} />
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : filteredDoctors.length > 0 ? (
                <Row gutter={[24, 24]}>
                    {filteredDoctors.map(doc => (
                        <Col xs={24} sm={12} lg={8} xl={6} key={doc.id}>
                            <Card 
                                hoverable
                                className="glass-panel"
                                style={{ 
                                    borderRadius: '24px', 
                                    border: 'none', 
                                    overflow: 'hidden',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                                bodyStyle={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                                    <Badge count={<StarFilled style={{ color: '#f59e0b' }} />} offset={[-10, 60]}>
                                        <Avatar 
                                            size={80} 
                                            style={{ 
                                                backgroundColor: 'var(--primary-light)', 
                                                color: 'var(--primary)',
                                                fontSize: '2rem',
                                                fontWeight: '700'
                                            }}
                                        >
                                            {doc.profiles?.full_name?.charAt(0)}
                                        </Avatar>
                                    </Badge>
                                </div>

                                <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' }}>
                                        {doc.profiles?.full_name}
                                    </h3>
                                    <Tag color="blue" style={{ marginTop: '8px', borderRadius: '8px', fontWeight: '600' }}>
                                        {doc.specialties?.name || "Généraliste"}
                                    </Tag>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <p style={{ 
                                        color: '#64748b', 
                                        fontSize: '0.9rem', 
                                        lineHeight: '1.6', 
                                        textAlign: 'center',
                                        marginBottom: '20px',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {doc.biography || "Médecin dévoué offrant des soins de qualité supérieure et une approche centrée sur le patient."}
                                    </p>
                                </div>

                                <div style={{ 
                                    borderTop: '1px solid rgba(0,0,0,0.05)', 
                                    paddingTop: '15px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '10px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                                        <EnvironmentOutlined />
                                        <span style={{ fontSize: '0.85rem' }}>{doc.hospital || "Hôpital Principal"}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                                        <MedicineBoxOutlined />
                                        <span style={{ fontSize: '0.85rem' }}>{doc.experience_years || 5}+ ans d'expérience</span>
                                    </div>
                                    <Button 
                                        type="primary" 
                                        className="btn-premium" 
                                        style={{ marginTop: '10px', borderRadius: '12px', height: '40px' }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveDoctorId(doc.id);
                                            setBookingModalOpen(true);
                                        }}
                                    >
                                        Prendre RDV
                                    </Button>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <Empty description="Aucun médecin trouvé pour votre recherche" />
            )}

            <Modal
                open={bookingModalOpen}
                onCancel={() => setBookingModalOpen(false)}
                footer={null}
                width={600}
                centered
                bodyStyle={{ padding: '0' }}
                closeIcon={null}
            >
                <div style={{ padding: '30px' }}>
                    <AppointmentModal 
                        selectedDoctorId={activeDoctorId} 
                        closeModal={() => setBookingModalOpen(false)} 
                    />
                </div>
            </Modal>
        </div>
    );
};

export default MyDoctors;
