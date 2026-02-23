import React from "react";

const DoctorComponent = ( { doctor }) => {
    return (
        <div class="doctor-card" data-id="${doctor.id}">
            {/* <img src="${doctor.image}" alt="${doctor.name}" class="doctor-img" /> */}
            <div class="doctor-info">
                <h3>{doctor.name}</h3>
                <span class="specialty">{doctor.specialty}</span>
                <div class="location">
                    <i class="fas fa-map-marker-alt"></i> {doctor.location}
                </div>
                <p>{doctor.description}</p>
                <div class="rating">
                    <i class="fas fa-star"></i> {doctor.rating}/5 ({doctor.reviews} avis)
                </div>
                <div class="price">Consultation: {doctor.price}</div>
                <div class="available">
                    <i class="fas fa-check-circle"></i> {doctor.available ? 'Disponible cette semaine' : 'Non disponible'}
                </div>
                {/* <button class="btn-book" onclick="openAppointmentModal(${doctor.id})">
                    Prendre rendez-vous
                </button> */}
            </div>
        </div>
    )
}

export default DoctorComponent;