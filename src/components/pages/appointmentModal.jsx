import React, { useState, useEffect } from "react";
import { Dropdown, Button } from "antd";
import { DownOutlined, EllipsisOutlined, UserOutlined } from '@ant-design/icons';
import { supabase } from "../../../config/supabase";
import '../styles/appointmentModal.css';
import '../styles/modalSystem.css';
import { toast } from "react-toastify";

const timeSlotList = [
    "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"
];



const AppointmentModal = ({ closeModal }) => {

    const [timeSlotSelected, setTimeSlotSelected] = useState(false);
    const [appointmentDate, setAppointmentDate] = useState("");
    const [consultationReason, setConsultationReason] = useState("");
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedDoctorLabel, setSelectedDoctorLabel] =useState(null);
    const [items, setItems] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {

        supabase.auth.getSession().then(async ({ data }) => {
            console.log("user", data.session?.user)
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

    const confirmAppointment = async () => {
        const appointment = {
            'patient_id': user.id,
            'doctor_id': selectedDoctor,
            'appointment_date': appointmentDate,
            'appointment_time': timeSlotSelected,
            'reason': consultationReason
        }

        const { data, error } = await supabase
            .from("appointments")
            .insert(appointment);

        console.log("Appointment Data ", data);

        if (error) {
            console.error("Error while creating Appointment", error);
            toast.error("Erreur lors de la création !");
            closeModal();
        } else {
            closeModal();
            toast.success("Rendez-vous créé avec succès !")
        }
    }



    const handleMenuClick = e => {
       const item = items.find((element) => element.key == e.key);
       item ? setSelectedDoctorLabel(item.label) : null;
        setSelectedDoctor(e.key);
    };

    const menuProps = {
        items,
        onClick: handleMenuClick
    };

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const { data, error } = await supabase
                    .from("doctors")
                    .select("*");

                if (error) throw error;
                console.log("Doctors List", data);

                data.map((doctor, i) => {
                    let doctorItem = {
                        "label": doctor.name + " - " + doctor.specialty,
                        "key": doctor.id
                    }
                    if (!(items.find((element) => element.key == doctorItem.key)))
                        items.push(doctorItem);
                })


            } catch (err) {
                console.error("Erreur Supabase", err);
            }
        };

        fetchDoctors();
    }, []);

    return (
        <div id="appointmentModal">
            <div className="modal-content">
                <h2 className="modal-title">Prendre un rendez-vous</h2>
                <div id="appointmentDoctorInfo"></div>
                <div id="appointmentForm">
                    <div className="form-group">
                        <label for="appointmentDate">Date souhaitée</label>
                        <table className="calendar">
                            <tr>
                                <th>Lu</th><th>Ma</th><th>Me</th><th>Je</th><th>Ve</th><th>Sa</th><th>Di</th>
                            </tr>
                            <tr>
                                <td className="available-day">15</td><td className="available-day">16</td><td>17</td>
                                <td className="available-day">18</td><td className="available-day">19</td><td>20</td><td>21</td>
                            </tr>
                        </table>
                        <input type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Heure</label>
                        <div className="time-slots">
                            {
                                timeSlotList.map((timeSlot, i) => {
                                    return <div className={`time-slot ${timeSlotSelected == timeSlot ? 'time-slot-selected' : ''}`} data-time={timeSlot} onClick={(e) => { setTimeSlotSelected(e.currentTarget.dataset.time) }}
                                    >{timeSlot}
                                    </div>
                                })
                            }
                        </div>
                        <input type="hidden" value="appointmentTime" required />
                    </div>
                    <Dropdown menu={menuProps}>
                        <Button icon={<DownOutlined />} iconPlacement="end" size="large">
                            { selectedDoctorLabel != null ? selectedDoctorLabel : 'Sélectionner un docteur'}
                        </Button>
                    </Dropdown>
                    <div className="form-group">
                        <label for="appointmentReason">Motif de consultation</label>
                        <textarea id="appointmentReason" rows="3" placeholder="Décrivez brièvement le motif de votre consultation" onChange={(e) => setConsultationReason(e.target.value)}></textarea>
                    </div>
                    <button className="modal-btn" onClick={confirmAppointment}>Confirmer le rendez-vous</button>
                </div>
            </div>
        </div>
    );
}

export default AppointmentModal;