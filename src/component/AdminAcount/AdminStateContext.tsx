import { createContext, ReactNode } from "react";
import type { AdminContextType } from './AdminContextType.d.ts';

const AdminContext = createContext<Partial<AdminContextType>>({});
export const AdminStateContext = ({ children }: { children: ReactNode }) => {

    return (
        <AdminContext.Provider value={{}}>
            {children}
        </AdminContext.Provider>
    )
}