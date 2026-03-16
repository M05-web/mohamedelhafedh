import React, { useState, useEffect } from "react";
import { Modal, Button, DatePicker, Select, Input, Divider, message, Row, Col } from "antd";
import { CalendarOutlined, ClockCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { supabase } from "../../../config/supabase";
import { useAuth } from "../../hooks/useAuth";
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const AppointmentModal = ({ selectedDoctorId, closeModal }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [doctorInfo, setDoctorInfo] = useState(null);
    const [specialties, setSpecialties] = useState([]);
    const [selectedSpecialtyId, setSelectedSpecialtyId] = useState(null);
    const [availableDoctors, setAvailableDoctors] = useState([]);
    const [currentDoctorId, setCurrentDoctorId] = useState(selectedDoctorId);
    
    const [date, setDate] = useState(null);
    const [time, setTime] = useState(null);
    const [reason, setReason] = useState("");

    const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

    useEffect(() => {
        fetchSpecialties();
        if (selectedDoctorId) {
            fetchDoctorInfo(selectedDoctorId);
            setCurrentDoctorId(selectedDoctorId);
        }
    }, [selectedDoctorId]);

    useEffect(() => {
        if (selectedSpecialtyId) {
            fetchDoctorsBySpecialty(selectedSpecialtyId);
        }
    }, [selectedSpecialtyId]);

    const fetchSpecialties = async () => {
        const { data, error } = await supabase.from('specialties').select('*').order('name');
        if (data) setSpecialties(data);
    };

    const fetchDoctorsBySpecialty = async (specialtyId) => {
        const { data, error } = await supabase
            .from('doctors')
            .select('id, profiles:user_id(full_name)')
            .eq('specialty_id', specialtyId);
        
        if (data) setAvailableDoctors(data);
    };

    const fetchDoctorInfo = async (id) => {
        const { data, error } = await supabase
            .from('doctors')
            .select('*, profiles:user_id(full_name), specialties:specialty_id(name)')
            .eq('id', id)
            .single();
        
        if (data) setDoctorInfo(data);
    };

    const handleBooking = async () => {
        if (!date || !time || !currentDoctorId) {
            message.warning("Veuillez remplir tous les champs obligatoires (médecin, date, heure).");
            return;
        }

        setLoading(true);
        try {
            const formattedDate = date.format('YYYY-MM-DD');
            
            const { data: existing, error: checkError } = await supabase
                .from('appointments')
                .select('id')
                .eq('doctor_id', currentDoctorId)
                .eq('appointment_date', formattedDate)
                .eq('appointment_time', time)
                .neq('status', 'cancelled');

            if (existing && existing.length > 0) {
                throw new Error("Ce créneau est déjà réservé. Veuillez en choisir un autre.");
            }

            // 2. Fetch Patient ID
            const { data: patientData } = await supabase
                .from('patients')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (!patientData) throw new Error("Profil patient non trouvé.");

            // 3. Insert Appointment
            const { error: insertError } = await supabase
                .from('appointments')
                .insert({
                    patient_id: patientData.id,
                    doctor_id: currentDoctorId,
                    appointment_date: formattedDate,
                    appointment_time: time,
                    reason: reason,
                    status: 'pending'
                });

            if (insertError) throw insertError;

            message.success("Demande de rendez-vous envoyée avec succès !");
            closeModal();
        } catch (err) {
            message.error(err.message || "Erreur lors de la réservation.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '10px' }}>
            <h3 style={{ marginBottom: '25px', color: '#1a365d', fontFamily: 'Outfit', fontWeight: '800', fontSize: '1.5rem' }}>
                {doctorInfo ? `Rendez-vous avec Dr. ${doctorInfo.profiles.full_name}` : 'Nouveau Rendez-vous'}
            </h3>
            
            {!selectedDoctorId && (
                <Row gutter={16}>
                    <Col span={12}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#475569' }}>Spécialité</label>
                            <Select 
                                placeholder="Choisir spécialité" 
                                style={{ width: '100%' }} 
                                size="large"
                                onChange={(val) => {
                                    setSelectedSpecialtyId(val);
                                    setCurrentDoctorId(null);
                                    setDoctorInfo(null);
                                }}
                            >
                                {specialties.map(s => (
                                    <Option key={s.id} value={s.id}>{s.name}</Option>
                                ))}
                            </Select>
                        </div>
                    </Col>
                    <Col span={12}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#475569' }}>Médecin</label>
                            <Select 
                                placeholder="Choisir médecin" 
                                style={{ width: '100%' }} 
                                size="large"
                                disabled={!selectedSpecialtyId}
                                value={currentDoctorId}
                                onChange={(val) => {
                                    setCurrentDoctorId(val);
                                    fetchDoctorInfo(val);
                                }}
                            >
                                {availableDoctors.map(d => (
                                    <Option key={d.id} value={d.id}>{d.profiles.full_name}</Option>
                                ))}
                            </Select>
                        </div>
                    </Col>
                </Row>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#475569' }}>Date souhaitée</label>
                    <DatePicker 
                        style={{ width: '100%' }} 
                        size="large" 
                        disabledDate={(current) => current && current < dayjs().endOf('day')}
                        onChange={(val) => setDate(val)}
                        placeholder="Sélectionner"
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#475569' }}>Heure</label>
                    <Select 
                        placeholder="Créneau" 
                        style={{ width: '100%' }} 
                        size="large"
                        onChange={(val) => setTime(val)}
                    >
                        {timeSlots.map(slot => (
                            <Option key={slot} value={slot}>{slot}</Option>
                        ))}
                    </Select>
                </div>
            </div>

            <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#475569' }}>Motif de consultation</label>
                <TextArea 
                    rows={3} 
                    placeholder="Quels sont vos symptômes ?" 
                    style={{ borderRadius: '12px', padding: '12px' }}
                    onChange={(e) => setReason(e.target.value)}
                />
            </div>

            <div style={{ background: '#eff6ff', padding: '15px', borderRadius: '10px', marginBottom: '25px' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#1e40af' }}>
                    <InfoCircleOutlined style={{ marginRight: '8px' }} />
                    Votre demande sera envoyée au médecin pour confirmation. Vous recevrez une notification dès qu'elle sera validée.
                </p>
            </div>

            <Button 
                type="primary" 
                block 
                size="large" 
                loading={loading}
                onClick={handleBooking}
                style={{ height: '50px', borderRadius: '12px', background: '#2563eb' }}
            >
                Confirmer la réservation
            </Button>
        </div>
    );
};

export default AppointmentModal;