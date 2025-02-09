import { useContext, createContext, useState, ReactNode } from 'react';
import { ProductContextType } from './declarations/ProductContextType';



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
