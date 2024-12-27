import React, { LegacyRef, RefObject } from 'react'

type OrderType = {
    id: number; name: string; price: number; image: string; desc: string; count: number;
}

export type ProductContextType = {
    defaultLoginAdminOrUser: string = 'user' | 'admin';
    setDefaultLoginAdminOrUser: React.Dispatch<React.SetStateAction<string>>;
};
