import React, { useContext, createContext, useState, ReactNode, useEffect } from 'react';
type LoginContext = {
    defaultLoginAdminOrUser: string;
    setDefaultLoginAdminOrUser: React.Dispatch<React.SetStateAction<string>>;
}

const GlobalProvider = createContext<Partial<LoginContext>>({});

export const StateContext = ({ children }: { children: ReactNode }) => {
    const [defaultLoginAdminOrUser, setDefaultLoginAdminOrUser] = useState<string>(localStorage.getItem("loginusertype") || "");

    // Listen for localStorage changes and sync state
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'loginusertype' && e.newValue !== null) {
                setDefaultLoginAdminOrUser(e.newValue);
            }
        };

        // Listen for storage events from other tabs/windows
        window.addEventListener('storage', handleStorageChange);

        // Also check for changes in the same tab by polling
        const interval = setInterval(() => {
            const currentValue = localStorage.getItem("loginusertype") || "";
            if (currentValue !== defaultLoginAdminOrUser) {
                setDefaultLoginAdminOrUser(currentValue);
            }
        }, 100);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, [defaultLoginAdminOrUser]);

    // Update localStorage when state changes (for manual updates)
    const updateDefaultLoginAdminOrUser = (value: React.SetStateAction<string>) => {
        setDefaultLoginAdminOrUser(prev => {
            const newValue = typeof value === 'function' ? value(prev) : value;
            localStorage.setItem("loginusertype", newValue);
            return newValue;
        });
    };

    return (<GlobalProvider.Provider
        value={
            {
                defaultLoginAdminOrUser,
                setDefaultLoginAdminOrUser: updateDefaultLoginAdminOrUser,
            }
        }>
        {children}
    </GlobalProvider.Provider>)
}

export const useStateContext = () => useContext(GlobalProvider);
