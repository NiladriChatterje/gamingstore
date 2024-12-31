import { createContext, ReactNode, useState, useContext } from "react";
import type { AdminContextType } from './AdminContextType.d.ts';

const AdminContext = createContext<Partial<AdminContextType>>({});

export const AdminStateContext = ({ children }: { children: ReactNode }) => {
    const [admin, setAdmin] = useState<any>({});
    return (
        <AdminContext.Provider value={{ admin, setAdmin }}>
            {children}
        </AdminContext.Provider>
    )
}

export const useAdminStateContext = () => useContext(AdminContext);