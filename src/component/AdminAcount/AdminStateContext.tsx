import { createContext, ReactNode, useState, useContext } from "react";
import type { AdminContextType } from './AdminContextType.d.ts';
import { createClient, SanityClient } from "@sanity/client";

const AdminContext = createContext<Partial<AdminContextType>>({});

const sanityClient: SanityClient = createClient({
    projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
    token: import.meta.env.VITE_SANITY_TOKEN,
    dataset: 'production'
})

export const AdminStateContext = ({ children }: { children: ReactNode }) => {
    const [admin, setAdmin] = useState<any>({});
    return (
        <AdminContext.Provider value={{ admin, setAdmin, sanityClient }}>
            {children}
        </AdminContext.Provider>
    )
}

export const useAdminStateContext = () => useContext(AdminContext);