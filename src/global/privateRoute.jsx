import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { supabase } from "../../config/supabase";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {

    const [user, setUser] = useState(undefined);
    const [loading, setLoading] = useState(true);

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
    }, [])

    if(user == undefined)
        return <p> Chargement ... </p>

    return user ? children : <Navigate to="/login" replace />
}

export default PrivateRoute;