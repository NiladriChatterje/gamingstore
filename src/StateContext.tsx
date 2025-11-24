import React, { useContext, createContext, useState, ReactNode } from 'react';
type LoginContext = {
    defaultLoginAdminOrUser: string;
    setDefaultLoginAdminOrUser: React.Dispatch<React.SetStateAction<string>>;
}

const GlobalProvider = createContext<Partial<LoginContext>>({});

export const StateContext = ({ children }: { children: ReactNode }) => {
    const [defaultLoginAdminOrUser, setDefaultLoginAdminOrUser] = useState<string>(localStorage.getItem("loginusertype") || "");

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
