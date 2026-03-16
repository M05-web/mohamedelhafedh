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
    SaveOutlined,
    SafetyCertificateOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const AdminProfile = () => {
    const { user, role } = useAuth();
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
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            form.setFieldsValue({
                full_name: profile.full_name,
                email: profile.email,
                phone: profile.phone,
            });

        } catch (err) {
            console.error("Error fetching admin profile:", err);
            message.error("Erreur lors du chargement du profil.");
        } finally {
            setLoading(false);
        }
    };

    const onFinish = async (values) => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: values.full_name,
                    phone: values.phone
                })
                .eq('id', user.id);

            if (error) throw error;

            message.success("Profil administrateur mis à jour ! ✨");
        } catch (err) {
            console.error("Error updating admin profile:", err);
            message.error("Erreur lors de la sauvegarde.");
        } finally {
            setSaving(false);
        }
    };

    if (loading && !user) return <div style={{ padding: '50px', textAlign: 'center' }}>Chargement...</div>;

    return (
        <div className="profile-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '30px' }}>
                <Title level={2} style={{ fontFamily: 'Outfit', fontWeight: '800', color: '#1a365d' }}>
                    Profil <span style={{ color: 'var(--primary)' }}>Administrateur</span>
                </Title>
                <Text type="secondary">Gérez vos informations de compte et vos accès de sécurité.</Text>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                disabled={loading}
            >
                <Row gutter={24}>
                    <Col xs={24}>
                        <Card 
                            className="glass-panel" 
                            style={{ borderRadius: '24px', marginBottom: '24px' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '30px' }}>
                                <Avatar 
                                    size={100} 
                                    icon={<UserOutlined />} 
                                    style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}
                                >
                                    {user?.user_metadata?.full_name?.charAt(0)}
                                </Avatar>
                                <div>
                                    <Title level={3} style={{ margin: 0 }}>{user?.user_metadata?.full_name}</Title>
                                    <Space style={{ marginTop: '8px' }}>
                                        <Tag color="gold" icon={<SafetyCertificateOutlined />}>Compte Administrateur</Tag>
                                        <Tag color="blue">Accès Total</Tag>
                                    </Space>
                                </div>
                            </div>

                            <Divider />

                            <Row gutter={16}>
                                <Col xs={24} md={12}>
                                    <Form.Item 
                                        name="full_name" 
                                        label="Nom Complet" 
                                        rules={[{ required: true, message: 'Le nom est obligatoire' }]}
                                    >
                                        <Input prefix={<UserOutlined />} size="large" style={{ borderRadius: '12px' }} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item name="email" label="Adresse Email">
                                        <Input prefix={<MailOutlined />} size="large" disabled style={{ borderRadius: '12px' }} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item name="phone" label="Téléphone">
                                        <Input prefix={<PhoneOutlined />} size="large" placeholder="+221 ..." style={{ borderRadius: '12px' }} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item label="Rôle Système">
                                        <Input disabled value="Administrateur Système" size="large" style={{ borderRadius: '12px' }} />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Divider />

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <Button 
                                    size="large" 
                                    style={{ borderRadius: '12px' }}
                                    onClick={() => fetchProfileData()}
                                >
                                    Réinitialiser
                                </Button>
                                <Button 
                                    type="primary" 
                                    size="large" 
                                    icon={<SaveOutlined />}
                                    loading={saving}
                                    htmlType="submit"
                                    className="btn-premium"
                                    style={{ borderRadius: '12px', padding: '0 40px' }}
                                >
                                    Sauvegarder
                                </Button>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default AdminProfile;
