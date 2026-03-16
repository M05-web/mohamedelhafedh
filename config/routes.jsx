import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Login from "../src/components/pages/login";
import PrivateRoute from "../src/global/PrivateRoute";
import MainPage from "../src/components";
import Register from "../src/components/pages/register";
import DoctorDashboard from "../src/components/pages/doctorDashboard";
import AdminDashboard from "../src/components/pages/adminDashboard";
import AdminProfile from "../src/components/pages/AdminProfile";
import AdminLogin from "../src/components/pages/adminLogin";
import AdminRegister from "../src/components/pages/adminRegister";

import PatientPortal from "../src/components/pages/PatientPortal";
import MyDoctors from "../src/components/pages/MyDoctors";
import Appointments from "../src/components/pages/Appointments";
import PatientProfile from "../src/components/pages/PatientProfile";
import DoctorSchedule from "../src/components/pages/DoctorSchedule";
import DoctorPatients from "../src/components/pages/DoctorPatients";
import DoctorConsultations from "../src/components/pages/DoctorConsultations";
import DashboardLayout from "../src/global/DashboardLayout";
import PlaceholderPage from "../src/global/PlaceholderPage";
import PatientDetails from "../src/components/pages/PatientDetails";
import PatientHistory from "../src/components/pages/PatientHistory";

const RouteConfig = () => {
    console.log("RouteConfig: Initializing routes...");

    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Patient Routes */}
            <Route
                path="/dashboard"
                element={
                    <PrivateRoute requiredRoles={['patient']}>
                        <DashboardLayout>
                            <PatientPortal />
                        </DashboardLayout>
                    </PrivateRoute>
                }
            />
            <Route
                path="/appointments"
                element={
                    <PrivateRoute requiredRoles={['patient']}>
                        <DashboardLayout>
                            <Appointments />
                        </DashboardLayout>
                    </PrivateRoute>
                }
            />
            <Route
                path="/my-doctors"
                element={
                    <PrivateRoute requiredRoles={['patient']}>
                        <DashboardLayout>
                            <MyDoctors />
                        </DashboardLayout>
                    </PrivateRoute>
                }
            />
            <Route
                path="/history"
                element={
                    <PrivateRoute requiredRoles={['patient']}>
                        <DashboardLayout>
                            <PatientHistory />
                        </DashboardLayout>
                    </PrivateRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <PrivateRoute requiredRoles={['patient']}>
                        <DashboardLayout>
                            <PatientProfile />
                        </DashboardLayout>
                    </PrivateRoute>
                }
            />

            {/* Doctor Routes */}
            <Route
                path="/doctor-dashboard"
                element={
                    <PrivateRoute requiredRoles={['doctor']}>
                        <DashboardLayout>
                            <DoctorDashboard />
                        </DashboardLayout>
                    </PrivateRoute>
                }
            />
            <Route
                path="/schedule"
                element={
                    <PrivateRoute requiredRoles={['doctor']}>
                        <DashboardLayout>
                            <DoctorSchedule />
                        </DashboardLayout>
                    </PrivateRoute>
                }
            />
            <Route
                path="/my-patients"
                element={
                    <PrivateRoute requiredRoles={['doctor']}>
                        <DashboardLayout>
                            <DoctorPatients />
                        </DashboardLayout>
                    </PrivateRoute>
                }
            />
            <Route
                path="/patient-details/:id"
                element={
                    <PrivateRoute requiredRoles={['doctor']}>
                        <DashboardLayout>
                            <PatientDetails />
                        </DashboardLayout>
                    </PrivateRoute>
                }
            />
            <Route
                path="/consultations"
                element={
                    <PrivateRoute requiredRoles={['doctor']}>
                        <DashboardLayout>
                            <DoctorConsultations />
                        </DashboardLayout>
                    </PrivateRoute>
                }
            />

            {/* Admin Routes */}
            <Route
                path="/admin-profile"
                element={
                    <PrivateRoute requiredRoles={['admin']}>
                        <DashboardLayout>
                            <AdminProfile />
                        </DashboardLayout>
                    </PrivateRoute>
                }
            />
            <Route
                path="/admin-dashboard"
                element={
                    <PrivateRoute requiredRoles={['admin']}>
                        <DashboardLayout>
                            <AdminDashboard />
                        </DashboardLayout>
                    </PrivateRoute>
                }
            />

            {/* Admin Auth Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
    )
}

export default RouteConfig;