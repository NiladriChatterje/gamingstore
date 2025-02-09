import { useContext, createContext, useState, ReactNode } from 'react';
import { ProductContextType } from '@declarations/ProductContextType';

const GlobalProvider = createContext<Partial<ProductContextType>>({});

export const StateContext = ({ children }: { children: ReactNode }) => {
    const [defaultLoginAdminOrUser, setDefaultLoginAdminOrUser] = useState<string>(localStorage.getItem("loginusertype") || "user");

    return (<GlobalProvider.Provider
        value={
            {
                defaultLoginAdminOrUser,
                setDefaultLoginAdminOrUser,
            }
        }>
        {children}
    </GlobalProvider.Provider>)
}

export const useStateContext = () => useContext(GlobalProvider);
