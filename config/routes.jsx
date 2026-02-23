import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "../src/components/pages/login";
import PrivateRoute from "../src/global/PrivateRoute";
import MainPage from "../src/components";
import Register from "../src/components/pages/register";

const RouteConfig = () => {

    return (
        <Routes>
            {/* <Route path="*" element={<Login />} /> */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
                path="/dashboard"
                element={
                    <PrivateRoute>
                        <MainPage />
                    </PrivateRoute>

                }
            >
            </Route>
        </Routes>
    )
}

export default RouteConfig;