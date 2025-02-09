import React, { LegacyRef, RefObject } from 'react'

export declare type ProductType = {
    id: number; name: string; price: number; image: string; desc: string; count: number;
}

export declare type ProductContextType = {
    defaultLoginAdminOrUser: string;
    setDefaultLoginAdminOrUser: React.Dispatch<React.SetStateAction<string>>;
};
