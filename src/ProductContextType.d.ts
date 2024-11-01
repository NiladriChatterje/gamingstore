import React, { LegacyRef, RefObject } from 'react'

type OrderType = {
    id: number; name: string; price: number; image: string; desc: string; count: number;
}

export type ProductContextType = {
    defaultLoginAdminOrUser: string = 'user' | 'admin';
    setDefaultLoginAdminOrUser: React.Dispatch<React.SetStateAction<string>>;
    slide: boolean,
    setSlide: React.Dispatch<React.setStateAction<boolean>>,
    navRef: LegacyRef<HTMLElement>;
    totalPrice: number;
    setTotalPrice: React.Dispatch<React.SetStateAction<number>>;
    data: OrderType[];
    setData: React.Dispatch<React.SetStateAction<OrderType[]>>;
    oneItem: boolean;
    setOneItem: React.Dispatch<React.SetStateAction<boolean>>;
    qty: number;
    setQty: React.Dispatch<React.SetStateAction<number>>;
    ItemIDCount: object & { id?: number };
    setItemIDCount: React.Dispatch<React.SetStateAction<object>>;
    incDecQty: (counter: number, id: number | string) => void;
    addItemToOrderList: (item: OrderType) => void;
};
