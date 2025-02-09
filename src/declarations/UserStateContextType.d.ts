import React, { LegacyRef, RefObject } from 'react'

export enum EanUpcIsbnType { EAN = "EAN", UPC = "UPC", ISBN = "ISBN", ASIN = "ASIN", GTIN = "GTIN", OTHERS = "OTHERS" }
export enum currency { INR = "INR", YEN = "YEN", USD = "USD" }

export declare type ProductType = {
    _id: string;
    productName: string;
    eanUpcIsbnGtinAsinType: EanUpcIsbnType;
    price: number;
    image?: FileList;
    modelNumber?: string;
    seller: string;
    productDescription: string;
    quantity: number;
    keywords: string[];
    discount: number;
}

export declare type ProductContextType = {
    lastRoute: string;
    setLastRoute: React.Dispatch<React.SetStateAction<string>>,
    slide: boolean,
    setSlide: React.Dispatch<React.SetStateAction<boolean>>,
    navRef: LegacyRef<HTMLElement>;
    totalPrice: number;
    setTotalPrice: React.Dispatch<React.SetStateAction<number>>;
    data: ProductType[];
    setData: React.Dispatch<React.SetStateAction<ProductType[]>>;
    oneItem: boolean;
    setOneItem: React.Dispatch<React.SetStateAction<boolean>>;
    qty: number;
    setQty: React.Dispatch<React.SetStateAction<number>>;
    ItemIDCount: object & { id?: number };
    setItemIDCount: React.Dispatch<React.SetStateAction<object>>;
    incDecQty: (counter: number, id: number | string) => void;
    addItemToOrderList: (item: ProductType) => void;
};
