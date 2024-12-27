import { useContext, createContext, useState, ReactNode } from 'react';
import { ProductContextType } from './ProductContextType';

export type OrderType = {
    id: number; name: string; price: number; image: string; desc: string; count: number;
}

const Global = createContext<Partial<ProductContextType>>({});

export const StateContext = ({ children }: { children: ReactNode }) => {
    const [defaultLoginAdminOrUser, setDefaultLoginAdminOrUser] = useState<string>(localStorage.getItem("loginusertype") || "user");

    return (<Global.Provider
        value={
            {
                defaultLoginAdminOrUser,
                setDefaultLoginAdminOrUser,
            }
        }>
        {children}
    </Global.Provider>)
}

export const useStateContext = () => useContext(Global);
