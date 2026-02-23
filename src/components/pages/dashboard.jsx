import React, { useEffect, useState } from "react";
import '../styles/dashboard.css';
import { supabase } from "../../../config/supabase";
import { Button, Modal, Tag } from "antd";
import AppointmentModal from "./appointmentModal";

const Dashboard = () => {

    const [user, setUser] = useState(undefined);
    const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);

    const closeModal = () => {
        setAppointmentModalOpen(false);
    };

    useEffect(() => {

        supabase.auth.getSession().then(async ({ data }) => {
            setUser(data.session?.user ?? null)
        })


        const { data: listener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setUser(session?.user ?? null)
            }
        )

        return () => {
            listener.subscription.unsubscribe()
        }
    }, []);

    useEffect(() => {

        const fetchAppointments = async () => {
            const { data, error } = await supabase
                .from("appointments")
                .select(`
                            id,
                            patient_id,
                            appointment_date,
                            appointment_time,
                            doctors (
                            id,
                            name,
                            specialty
                            )
                        `)
                .eq('patient_id', user?.id);

            if (error) {
                console.error("Error while getting appointmants", error)
            } else {
                console.log("Appointments Data", data);
                setAppointments(data);
            }
        }

        if (user?.id != null)
            fetchAppointments();

    }, [user, appointmentModalOpen]);

    useEffect(() => {
        const countDoctors = (appointments) => {
            const result = appointments.reduce((acc, appointment) => {
                const doctor = appointment.doctors;

                if (!doctor) return acc;

                if (!acc[doctor.id]) {
                    acc[doctor.id] = {
                        doctorId: doctor.id,
                        doctorName: doctor.name,
                        doctorSpeciality: doctor.specialty,
                        count: 0,
                    };
                }

                acc[doctor.id].count += 1;

                return acc;
            }, {});

            return Object.values(result);
        };
        let doctorsList = countDoctors(appointments);
        setDoctors(doctorsList);
        console.log("Doctors ", doctors);
    }, [appointments]);

    return (
        <section id="dashboard" className="dashboard">
            <div className="container">
                <div className="dashboard-header">
                    <div className="user-info">
                        <div className="user-avatar" id="userAvatar">{user ? user.email.charAt(0).toUpperCase() : 'Non défini'}</div>
                        <div>
                            <h2>Bonjour, <span id="userName">chèr(e) client(e)</span></h2>
                            <p id="userEmail">{user ? user.email : 'Non défini'}</p>
                        </div>
                    </div>
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-card">
                        <h3>Mes rendez-vous</h3>
                        <ul className="appointment-list" id="userAppointments">
                            {
                                appointments.map((appointment, i) => {
                                    return <li>
                                        <Tag color='green'>{appointment.doctors.name + " "}</Tag>
                                        {appointment.appointment_date + " " + appointment.appointment_time}
                                    </li>
                                })
                            }
                        </ul>
                    </div>

                    <div className="dashboard-card">
                        <h3>Mes médecins</h3>
                        <div id="favoriteDoctors">
                            {
                                doctors.map((doctor, i) => {
                                    return <li>
                                        {doctor.doctorName + " - " + doctor.doctorSpeciality}
                                        <Tag color='green'> {doctor.count}</Tag>
                                    </li>
                                })
                            }
                        </div>
                    </div>

                    <div className="dashboard-card">
                        <h3>Plannifiez un rendez-vous</h3>
                        <div id="medicalDocuments">
                            <button className="btn-view" onClick={() => setAppointmentModalOpen(true)}>Prendre un rendre-vous</button>
                        </div>
                    </div>
                </div>
            </div>
            <Modal
                onCancel={() => setAppointmentModalOpen(false)}
                open={appointmentModalOpen}
                footer={false}
            >
                <AppointmentModal closeModal={closeModal} />
            </Modal>
        </section>
    );
}

export default Dashboard;