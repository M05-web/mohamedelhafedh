import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Spin } from "antd";

const PrivateRoute = ({ children, requiredRoles = [] }) => {
    const { user, role, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
                <Spin size="large" tip="Vérification des accès..." />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRoles.length > 0 && !requiredRoles.includes(role)) {
        console.log("PrivateRoute: Role mismatch", { currentRole: role, required: requiredRoles });
        
        // If logged in but NO profile/role found in DB
        if (!role) {
            console.warn("PrivateRoute: No role found. Accessing as patient by default.");
            if (requiredRoles.includes('patient')) return children;
            return <Navigate to="/dashboard" replace />;
        }

        if (role === 'doctor') return <Navigate to="/doctor-dashboard" replace />;
        if (role === 'admin') return <Navigate to="/admin-dashboard" replace />;
        
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

export default PrivateRoute;