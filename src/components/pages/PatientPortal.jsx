import React from "react";
import Dashboard from "./dashboard";
import Doctors from "./doctors";
import QuickCategories from "./quickCategories";

const PatientPortal = () => {
    return (
        <div className="patient-portal">
            <Dashboard />
            
            <div style={{ marginTop: '4rem' }}>
                <QuickCategories />
            </div>

            <div style={{ marginTop: '4rem' }}>
                <Doctors />
            </div>
            
            <div style={{ padding: '4rem 0', textAlign: 'center', opacity: 0.5 }}>
                <p>© 2026 WerguiYaram Sénégal • Plateforme de Santé Sécurisée</p>
            </div>
        </div>
    );
}

export default PatientPortal;
