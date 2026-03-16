import { supabase } from "../../config/supabase";

/**
 * Security Service for Role-Based Access Control (RBAC)
 * and Activity Monitoring.
 */
export const SecurityService = {
    /**
     * Gets the current user's role from their profile
     */
    async getUserRole(user) {
        if (!user || !user.id) return null;
        
        console.log("SecurityService: Fetching role for", user.id);
        
        // Race condition prevention: sometimes session metadata is more fresh than DB
        const metadataRole = user.user_metadata?.role;

        try {
            // Setup a timeout for the DB fetch
            const fetchPromise = supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Timeout")), 1500)
            );

            const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);
            
            if (error || !data) {
                console.warn("SecurityService: Profile missing or error, using metadata:", metadataRole || 'patient');
                return metadataRole || 'patient';
            }
            console.log("SecurityService: Role found in DB:", data.role);
            return data.role;
        } catch (e) {
            console.error("SecurityService: Role fetch failed/timed out, falling back:", metadataRole || 'patient');
            return metadataRole || 'patient';
        }
    },

    /**
     * Logs a security audit event
     */
    async logAudit(action, metadata = {}) {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const userId = session?.user?.id;

            // Fire and forget audit log to not block UX
            supabase.from('audit_logs').insert({
                user_id: userId,
                action: action,
                ip_address: 'client-side-log'
            }).then(({ error }) => {
                if (error) console.warn("SecurityService: Audit log error (non-critical)", error);
            });
        } catch (e) {
            console.warn("SecurityService: logAudit failed (non-critical)");
        }
    },

    /**
     * Check if user has permission for a specific role
     */
    hasPermission(userRole, requiredRoles) {
        if (!requiredRoles || requiredRoles.length === 0) return true;
        return requiredRoles.includes(userRole);
    }
};
