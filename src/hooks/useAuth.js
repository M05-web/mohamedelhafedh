import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { SecurityService } from '../global/security';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            console.log("useAuth: Initializing...");
            
            // Safety timeout to ensure we don't hang forever
            const timeoutId = setTimeout(() => {
                if (loading) {
                    console.warn("useAuth: Initialization timed out, forcing loading false");
                    setLoading(false);
                }
            }, 6000);

            try {
                const { data: { session } } = await supabase.auth.getSession();
                console.log("useAuth: Session result:", session ? "Found" : "None");
                if (session) {
                    setUser(session.user);
                    console.log("useAuth: Fetching role for", session.user.id);
                    const userRole = await SecurityService.getUserRole(session.user);
                    console.log("useAuth: Role result:", userRole);
                    setRole(userRole);
                }
            } catch (err) {
                console.error("useAuth: Initialization failed", err);
            } finally {
                clearTimeout(timeoutId);
                console.log("useAuth: Initialization complete, setting loading to false");
                setLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("useAuth: Auth state changed:", event, session ? "Session present" : "No session");
            
            if (session) {
                // IMPORTANT: Avoid setting loading(true) if it's just a repetitive token refresh or tab focus
                // Only show loading if we really need to fetch for the first time or if user changed
                const isNewUser = !user || user.id !== session.user.id;
                
                if (isNewUser || !role) {
                    setLoading(true);
                    setUser(session.user);
                    try {
                        const userRole = await SecurityService.getUserRole(session.user);
                        console.log("useAuth: Role updated to:", userRole);
                        setRole(userRole);
                    } catch (err) {
                        console.error("useAuth: State change fetch failed", err);
                    } finally {
                        setLoading(false);
                    }
                } else {
                    // Just update the user without flickering
                    setUser(session.user);
                }
            } else {
                setUser(null);
                setRole(null);
                setLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        await SecurityService.logAudit('LOGOUT');
        await supabase.auth.signOut();
    };

    return { user, role, loading, signOut };
};
