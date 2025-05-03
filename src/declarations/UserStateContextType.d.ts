import React, { LegacyRef, RefObject } from "react";
import { currency, EanUpcIsbnType } from "@enums/enums";
import { ProductType } from "./ProductContextType";

export declare type ProductContextType = {
  userData: any;
  setUserData: React.Dispatch<React.SetStateAction<any>>;
  lastRoute: string;
  setLastRoute: React.Dispatch<React.SetStateAction<string>>;
  slide: boolean;
  setSlide: React.Dispatch<React.SetStateAction<boolean>>;
  navRef: LegacyRef<HTMLElement>;
  totalPrice: number;
  setTotalPrice: React.Dispatch<React.SetStateAction<number>>;
  data: ProductType[];
  setData: React.Dispatch<React.SetStateAction<ProductType[]>>;
  oneItem: boolean;
  setOneItem: React.Dispatch<React.SetStateAction<boolean>>;
  qty: number;
  setQty: React.Dispatch<React.SetStateAction<number>>;
  ItemIDCount: object & { id?: string };
  setItemIDCount: React.Dispatch<React.SetStateAction<object>>;
  incDecQty: (counter: number, id: number | string) => void;
  addItemToOrderList: (item: ProductType) => void;
};
