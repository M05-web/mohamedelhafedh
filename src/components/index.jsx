import React from "react";
import './styles/index.css'
import Header from "./pages/header";
import Hero from "./pages/hero";
import QuickCategories from "./pages/quickCategories";
import Doctors from "./pages/doctors";
import Hospital from "./pages/hospital";
import Consultation from "./pages/consultation";
import Features from "./pages/features";
import Dashboard from "./pages/dashboard";
import Login from "./pages/login";

const MainPage = () => {

    return (
        <>
            <Header />
            <main>
                <Hero />
                <Dashboard />
                <QuickCategories />
                <Doctors />
                <Hospital />
                <Consultation />
                <Features />
            </main>
        </>
    );
}

export default MainPage;