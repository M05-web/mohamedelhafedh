import React, { useEffect, useState } from "react";
import { supabase } from "../../../config/supabase";
import { useAuth } from "../../hooks/useAuth";
import { List, Card, Table, Tag, Typography, Spin, Space } from "antd";
import { HistoryOutlined, FileTextOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

const DoctorConsultations = () => {
    const { user } = useAuth();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) fetchConsultations();
    }, [user]);

    const fetchConsultations = async () => {
        setLoading(true);
        try {
            const { data: doctorData } = await supabase.from('doctors').select('id').eq('user_id', user.id).single();
            if (!doctorData) return;

            const { data, error } = await supabase
                .from('medical_records')
                .select(`
                    id,
                    diagnosis,
                    treatment,
                    created_at,
                    patients (
                        profiles:user_id (full_name)
                    )
                `)
                .eq('doctor_id', doctorData.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRecords(data || []);
        } catch (err) {
            console.error("Consultation History Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'created_at',
            key: 'date',
            render: date => dayjs(date).format('DD MMM YYYY HH:mm'),
            width: 150
        },
        {
            title: 'Patient',
            dataIndex: ['patients', 'profiles', 'full_name'],
            key: 'patient',
            render: name => (
                <Space>
                    <UserOutlined style={{ color: 'var(--primary)' }} />
                    <Text strong>{name}</Text>
                </Space>
            ),
            width: 200
        },
        {
            title: 'Diagnostic',
            dataIndex: 'diagnosis',
            key: 'diagnosis',
            ellipsis: true,
        },
        {
            title: 'Traitement',
            dataIndex: 'treatment',
            key: 'treatment',
            ellipsis: true,
        }
    ];

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '30px' }}>
                <Title level={1} style={{ fontSize: '2.5rem', color: '#1a365d', marginBottom: '0.5rem', fontFamily: 'Outfit' }}>
                    Historique des <span style={{ color: 'var(--primary)' }}>Consultations</span>
                </Title>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Revoyez vos diagnostics et traitements passés.</p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>
            ) : (
                <Card style={{ borderRadius: '20px', border: 'none', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
                    <Table 
                        columns={columns} 
                        dataSource={records} 
                        rowKey="id"
                        pagination={{ pageSize: 8 }}
                        onRow={(record) => ({
                            style: { cursor: 'pointer' }
                        })}
                    />
                </Card>
            )}
        </div>
    );
};

export default DoctorConsultations;
