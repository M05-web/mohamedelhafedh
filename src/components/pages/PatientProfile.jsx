import React, { useEffect, useState } from 'react';
import { supabase } from '../../../config/supabase';
import { useAuth } from '../../hooks/useAuth';
import { 
    Form, 
    Input, 
    Button, 
    Card, 
    Row, 
    Col, 
    DatePicker, 
    Select, 
    message, 
    Divider,
    Avatar,
    Typography,
    Space,
    Tag
} from 'antd';
import { 
    UserOutlined, 
    PhoneOutlined, 
    MailOutlined, 
    HomeOutlined, 
    SafetyCertificateOutlined,
    EditOutlined,
    SaveOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const PatientProfile = () => {
    const { user } = useAuth();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            fetchProfileData();
        }
    }, [user]);

    const fetchProfileData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Profile
            const { data: profile, error: pError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (pError) throw pError;

            // 2. Fetch Patient details
            const { data: patient, error: patError } = await supabase
                .from('patients')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (patError && patError.code !== 'PGRST116') throw patError;

            // 3. Set form values
            form.setFieldsValue({
                full_name: profile.full_name,
                email: profile.email,
                phone: profile.phone,
                date_of_birth: patient?.date_of_birth ? dayjs(patient.date_of_birth) : null,
                gender: patient?.gender,
                blood_group: patient?.blood_group,
                address: patient?.address,
                allergies: patient?.allergies,
                chronic_diseases: patient?.chronic_diseases,
                emergency_contact: patient?.emergency_contact
            });

        } catch (err) {
            console.error("Error fetching profile:", err);
            message.error("Erreur lors du chargement du profil.");
        } finally {
            setLoading(false);
        }
    };

    const onFinish = async (values) => {
        setSaving(true);
        try {
            // 1. Update Profile
            const { error: pError } = await supabase
                .from('profiles')
                .update({
                    full_name: values.full_name,
                    phone: values.phone
                })
                .eq('id', user.id);

            if (pError) throw pError;

            // 2. Update/Insert Patient Info
            const patientPayload = {
                date_of_birth: values.date_of_birth ? values.date_of_birth.format('YYYY-MM-DD') : null,
                gender: values.gender,
                blood_group: values.blood_group,
                address: values.address,
                allergies: values.allergies,
                chronic_diseases: values.chronic_diseases,
                emergency_contact: values.emergency_contact
            };

            const { error: patError } = await supabase
                .from('patients')
                .update(patientPayload)
                .eq('user_id', user.id);

            if (patError) throw patError;

            message.success("Profil mis à jour avec succès ! ✨");
        } catch (err) {
            console.error("Error updating profile:", err);
            message.error("Erreur lors de la sauvegarde.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="profile-container" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <style>
                {`
                    @media (max-width: 768px) {
                        .profile-container { padding: 10px !important; }
                        .profile-container h2 { font-size: 1.5rem !important; }
                    }
                `}
            </style>
            <div style={{ marginBottom: '30px' }}>
                <Title level={2} style={{ fontFamily: 'Outfit', fontWeight: '800', color: '#1a365d' }}>
                    Mon <span style={{ color: 'var(--primary)' }}>Profil Patient</span>
                </Title>
                <Text type="secondary">Gérez vos informations personnelles et votre dossier médical sécurisé.</Text>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ role: 'patient' }}
                disabled={loading}
            >
                <Row gutter={24}>
                    {/* Left Column: Account Info */}
                    <Col xs={24} lg={8}>
                        <Card 
                            className="glass-panel" 
                            style={{ borderRadius: '24px', textAlign: 'center', marginBottom: '24px' }}
                        >
                            <Avatar 
                                size={120} 
                                icon={<UserOutlined />} 
                                style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', marginBottom: '20px' }}
                            >
                                {user?.user_metadata?.full_name?.charAt(0)}
                            </Avatar>
                            <Title level={4} style={{ margin: 0 }}>{user?.user_metadata?.full_name}</Title>
                            <Tag color="blue" style={{ marginTop: '8px' }}>Patient Vérifié</Tag>
                            
                            <Divider />
                            
                            <div style={{ textAlign: 'left', marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#64748b', fontSize: '14px' }}>Adresse Email</label>
                                <div style={{ 
                                    padding: '12px 15px', 
                                    background: '#f8fafc', 
                                    borderRadius: '12px', 
                                    border: '1px solid #e2e8f0',
                                    color: '#1e293b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}>
                                    <MailOutlined style={{ color: 'var(--primary)' }} />
                                    <span>{form.getFieldValue('email') || user?.email}</span>
                                </div>
                            </div>

                            <Form.Item name="phone" label="Téléphone">
                                <Input prefix={<PhoneOutlined />} placeholder="+221 ..." style={{ borderRadius: '12px' }} size="large" />
                            </Form.Item>
                        </Card>
                    </Col>

                    {/* Right Column: Medical Info */}
                    <Col xs={24} lg={16}>
                        <Card 
                            className="glass-panel" 
                            style={{ borderRadius: '24px' }}
                            title={<><SafetyCertificateOutlined style={{ color: 'var(--secondary)', marginRight: '10px' }} /> Dossier Médical Confidential</>}
                        >
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="date_of_birth" label="Date de Naissance">
                                        <DatePicker style={{ width: '100%', borderRadius: '12px' }} size="large" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="gender" label="Genre">
                                        <Select placeholder="Sélectionner" style={{ width: '100%' }} size="large">
                                            <Option value="homme">Homme</Option>
                                            <Option value="femme">Femme</Option>
                                            <Option value="autre">Autre</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="blood_group" label="Groupe Sanguin">
                                        <Select placeholder="Choisir" style={{ width: '100%' }} size="large">
                                            <Option value="A+">A+</Option>
                                            <Option value="A-">A-</Option>
                                            <Option value="B+">B+</Option>
                                            <Option value="B-">B-</Option>
                                            <Option value="AB+">AB+</Option>
                                            <Option value="AB-">AB-</Option>
                                            <Option value="O+">O+</Option>
                                            <Option value="O-">O-</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="emergency_contact" label="Contact d'Urgence">
                                        <Input placeholder="Nom et Numéro" style={{ borderRadius: '12px' }} size="large" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item name="address" label="Adresse de Résidence">
                                <Input prefix={<HomeOutlined />} placeholder="Quartier, Dakar" style={{ borderRadius: '12px' }} size="large" />
                            </Form.Item>

                            <Form.Item name="allergies" label="Allergies Connues">
                                <Input.TextArea rows={2} placeholder="Ex: Pénicilline, Pollen..." style={{ borderRadius: '12px' }} />
                            </Form.Item>

                            <Form.Item name="chronic_diseases" label="Maladies Chroniques">
                                <Input.TextArea rows={2} placeholder="Ex: Diabète, Hypertension..." style={{ borderRadius: '12px' }} />
                            </Form.Item>

                            <Divider />

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <Button 
                                    size="large" 
                                    style={{ borderRadius: '12px', padding: '0 30px' }}
                                    onClick={() => fetchProfileData()}
                                >
                                    Annuler
                                </Button>
                                <Button 
                                    type="primary" 
                                    size="large" 
                                    icon={<SaveOutlined />}
                                    loading={saving}
                                    htmlType="submit"
                                    className="btn-premium"
                                    style={{ borderRadius: '12px', padding: '0 40px', height: '50px' }}
                                >
                                    Sauvegarder les modifications
                                </Button>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default PatientProfile;
