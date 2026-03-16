import React, { useEffect, useState } from "react";
import DoctorComponent from "./doctorComponent";
import { supabase } from "../../../config/supabase";
import { Input, Select, Spin, Empty, Modal } from "antd";
import AppointmentModal from "./appointmentModal";
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';

const Doctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [specialtyFilter, setSpecialtyFilter] = useState("all");
    const [specialties, setSpecialties] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDoctorId, setSelectedDoctorId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: doctorsData, error: doctorsError } = await supabase
                    .from("doctors")
                    .select(`
                        id, 
                        hospital, 
                        experience_years, 
                        consultation_fee, 
                        biography, 
                        specialties:specialty_id (name), 
                        profiles:user_id (full_name)
                    `);

                if (doctorsError) throw doctorsError;

                const formattedDoctors = doctorsData.map(d => ({
                    id: d.id,
                    name: d.profiles?.full_name || 'Inconnu',
                    specialty: d.specialties?.name || 'Généraliste',
                    hospital: d.hospital,
                    experience: d.experience_years + ' ans',
                    price: d.consultation_fee ? `CFA ${d.consultation_fee}` : 'Non spécifié',
                    available: true
                }));

                setDoctors(formattedDoctors);
                setFilteredDoctors(formattedDoctors);

                const { data: specData } = await supabase.from('specialties').select('name');
                setSpecialties(specData || []);

            } catch (err) {
                console.error("Search Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        let result = doctors;
        if (searchQuery) {
            result = result.filter(d => 
                d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                d.specialty.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        if (specialtyFilter !== "all") {
            result = result.filter(d => d.specialty === specialtyFilter);
        }
        setFilteredDoctors(result);
    }, [searchQuery, specialtyFilter, doctors]);

    return (
        <section id="doctors" style={{ padding: '6rem 0', background: 'transparent' }}>
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                    <div>
                        <span style={{ color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>Praticiens</span>
                        <h2 style={{ fontSize: '2.5rem', marginTop: '0.5rem', color: '#1a365d', fontFamily: 'Outfit' }}>Trouvez votre spécialiste</h2>
                    </div>
                </div>

                <div style={{ 
                    display: 'flex', 
                    gap: '15px', 
                    marginBottom: '3rem', 
                    background: 'white', 
                    padding: '12px', 
                    borderRadius: '20px', 
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid rgba(255,255,255,0.5)'
                }}>
                    <Input 
                        placeholder="Nom, spécialité, hôpital..." 
                        prefix={<SearchOutlined style={{ color: 'var(--primary)' }} />} 
                        size="large"
                        style={{ flex: 2, border: 'none', background: '#f8fafc', borderRadius: '12px' }}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Select 
                        defaultValue="all" 
                        size="large"
                        placeholder="Spécialité"
                        suffixIcon={<FilterOutlined style={{ color: 'var(--primary)' }} />}
                        style={{ flex: 1, border: 'none', minWidth: '200px' }}
                        onChange={(value) => setSpecialtyFilter(value)}
                        className="premium-select"
                    >
                        <Select.Option value="all">Toutes spécialités</Select.Option>
                        {specialties.map(s => <Select.Option key={s.name} value={s.name}>{s.name}</Select.Option>)}
                    </Select>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>
                ) : filteredDoctors.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                        {filteredDoctors.map((doctor) => (
                            <div key={doctor.id} onClick={() => {
                                setSelectedDoctorId(doctor.id);
                                setModalOpen(true);
                            }}>
                                <DoctorComponent doctor={doctor} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '5rem', background: 'white', borderRadius: '25px', boxShadow: 'var(--shadow-md)' }}>
                        <Empty description={<span style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Nous n'avons trouvé aucun médecin correspondant.</span>} />
                    </div>
                )}
            </div>

            <Modal
                title={<span style={{ fontFamily: 'Outfit', fontWeight: '700', fontSize: '1.5rem' }}>Détails du Rendez-vous</span>}
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                footer={null}
                width={500}
                centered
                bodyStyle={{ padding: 0 }}
            >
                <div style={{ padding: '0px' }}>
                    <AppointmentModal 
                        selectedDoctorId={selectedDoctorId} 
                        closeModal={() => setModalOpen(false)} 
                    />
                </div>
            </Modal>
        </section>
    );
}

export default Doctors;